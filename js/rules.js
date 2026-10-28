/* Mesada+ Família · regras e cálculos.
 *
 * Este arquivo concentra TODAS as regras da casa: pontos, tetos, bônus escolar,
 * níveis, sequências e conquistas. Não toca no DOM, então roda no navegador
 * (window.MesadaRules) e no Node (testes em tests/rules.test.js).
 *
 * Valores monetários sempre em centavos inteiros. Pontos sempre inteiros.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.MesadaRules = api;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const VERSION = 3;

  /* ---------- Escola ---------- */

  // Ocorrências negativas: o nível define o ajuste, que só sai do bônus.
  const NEG_KINDS = [
    { id: 'material', title: 'Esqueceu material', level: 1, summary: 'Livro, caderno, agenda ou outro item' },
    { id: 'entrega', title: 'Atividade não entregue', level: 2, summary: 'Fez e não entregou, ou entregou pela metade' },
    { id: 'dever', title: 'Dever de casa não feito', level: 3, summary: 'Tarefa obrigatória que ficou pra trás' },
    { id: 'reincidencia', title: 'Repetiu depois do combinado', level: 4, summary: 'Terceira vez da mesma coisa no mês' },
    { id: 'disciplina', title: 'Desrespeito ou bagunça', level: 5, summary: 'Atitude de propósito, confirmada' },
    { id: 'grave', title: 'Ocorrência grave', level: 6, summary: 'Pede conversa séria e combinado novo' }
  ];
  const UNCLASSIFIED = { id: 'classificar', title: 'Ocorrência a classificar', level: 0, summary: 'Veio do e-mail da escola. Escolha o tipo.' };

  const POS_KINDS = [
    { id: 'elogio', title: 'Elogio de professor' },
    { id: 'destaque', title: 'Destaque em trabalho ou prova' },
    { id: 'ajuda', title: 'Ajudou colega ou a turma' },
    { id: 'participacao', title: 'Participação (monitoria, aula extra)' },
    { id: 'casa', title: 'Ajudei em casa por iniciativa própria' },
    { id: 'combinado', title: 'Cumpri um combinado importante' },
    { id: 'cuidado', title: 'Cuidei de alguém ou resolvi um conflito' },
    { id: 'iniciativa', title: 'Aprendi ou tentei algo novo' },
    { id: 'outra', title: 'Outra coisa boa' }
  ];

  const SUBJECTS = ['Português', 'Matemática', 'Ciências', 'História', 'Geografia', 'Inglês', 'Arte',
    'Educação Física', 'Redação', 'Física', 'Química', 'Biologia', 'Outra'];

  // Bônus por nota. Faixas mutuamente exclusivas: vale a maior.
  const GRADE_TIERS = [
    { min: 100, pts: 20, label: 'Nota máxima (100%)' },
    { min: 95, pts: 15, label: 'De 95% a 99%' },
    { above: 90, pts: 10, label: 'Acima de 90%' }
  ];
  const IMPROVE = { delta: 10, pts: 8, maxMonth: 2 };
  const POSITIVE = { pts: 10, maxMonth: 3 };
  const NEGATIVE = { tolerance: 1, ptsPerLevel: 5 };

  // Conceitos comuns. Ajuste se a legenda da escola for diferente.
  const CONCEPTS = { A: 95, MB: 95, B: 80, C: 65, R: 65, D: 50, I: 40, E: 30 };

  /* ---------- Rotina ---------- */

  // Calibragem: quatro semanas completas = teto de hábitos (30% de R$ 100).
  // 25 + 10 + 10 + 15 + 10 + 5 = 75 pts por semana = R$ 7,50.
  const DEFAULT_TASKS = [
    { id: 'estudo', name: 'Estudo ou leitura', icon: 'book', target: 4, pts: 25, active: true },
    { id: 'mochila', name: 'Mochila pronta', icon: 'school', target: 4, pts: 10, active: true },
    { id: 'cama', name: 'Arrumar a cama', icon: 'sun', target: 5, pts: 10, active: true },
    { id: 'quarto', name: 'Quarto em ordem', icon: 'home', target: 5, pts: 15, active: true },
    { id: 'extra', name: 'Ajuda extra em casa', icon: 'spark', target: 1, pts: 10, active: true },
    { id: 'semana', name: 'Semana completa', icon: 'flame', target: 5, pts: 5, active: true, streak: true }
  ];
  const TASK_HELP = {
    estudo: { kid: '15 min de leitura', mid: '25 min de estudo focado', teen: 'Estudar ou revisar pro que vem aí' },
    mochila: 'Conferida na noite anterior',
    cama: 'Antes de sair de casa',
    quarto: 'Roupa guardada e mesa livre',
    extra: 'Uma ajuda combinada',
    semana: 'Algum hábito em 5 dias diferentes'
  };

  const DEFAULT_CONFIG = {
    base: 10000,          // mesada-base padrão, em centavos
    habitsPct: 30,        // teto do bônus de hábitos, em % da base
    schoolPct: 12,        // teto do bônus escolar, em % da base
    centsPerPoint: 10,    // 1 ponto = R$ 0,10
    interestPct: 2,       // "juros do pai" ao mês sobre os cofrinhos de meta
    pin: null,            // { salt, hash } do PIN do responsável
    familyGoal: { name: 'Passeio em família', emoji: '🎡', target: 20 }
  };
  const DEFAULT_SPLIT = { save: 20, give: 10 };

  /* ---------- Jogo ---------- */

  const LEVELS = [0, 60, 150, 300, 500, 750, 1050, 1400, 1800, 2300];
  const LEVEL_NAMES = {
    kid: ['🥚 Ovo misterioso', '🐣 Pintinho', '🐥 Passarinho', '🐦 Voadora', '🦜 Papagaia esperta',
      '🦉 Coruja sábia', '🦅 Águia', '🐉 Dragãozinha', '🦄 Unicórnio lendário', '🌟 Estrela da casa'],
    mid: ['Aprendiz', 'Exploradora', 'Aventureira', 'Desbravadora', 'Estrategista',
      'Inventora', 'Capitã', 'Mestra', 'Lenda', 'Lendária'],
    teen: ['Novata', 'No ritmo', 'Constante', 'Autônoma', 'Estrategista',
      'Focada', 'Imparável', 'Referência', 'Mentora', 'Lendária']
  };
  const XP_GOAL_DONE = 30;

  const BADGES = [
    { id: 'meta1', icon: '🎯', name: 'Primeiro sonho', desc: 'Criou sua primeira meta' },
    { id: 'poupa50', icon: '🐷', name: 'Poupadora', desc: 'Juntou R$ 50 nas metas' },
    { id: 'metaok', icon: '🏆', name: 'Sonho realizado', desc: 'Comprou o que queria com a própria grana' },
    { id: 'doar', icon: '💛', name: 'Coração generoso', desc: 'Separou grana pra doar' },
    { id: 'juros', icon: '💰', name: 'Grana que rende', desc: 'Ganhou juros no cofrinho' },
    { id: 'nota90', icon: '📘', name: 'Acima de 90', desc: 'Tirou mais de 90%' },
    { id: 'nota100', icon: '💯', name: 'Gabaritou', desc: 'Tirou 100% numa prova' },
    { id: 'melhora', icon: '📈', name: 'Virada', desc: 'Subiu 10 pontos numa matéria' },
    { id: 'elogio', icon: '⭐', name: 'Elogiada', desc: 'Ganhou elogio da escola' },
    { id: 'semana', icon: '🔥', name: 'Semana completa', desc: 'Hábitos em 5 dias da semana' },
    { id: 'chama14', icon: '☄️', name: 'Chama acesa', desc: '14 dias seguidos' },
    { id: 'nivel5', icon: '🚀', name: 'Nível 5', desc: 'Chegou no nível 5' }
  ];

  /* ---------- Datas ---------- */

  const pad = n => String(n).padStart(2, '0');
  const dateOfDay = (m, day) => `${m}-${pad(day)}`;
  const monthDays = m => new Date(Number(m.slice(0, 4)), Number(m.slice(5, 7)), 0).getDate();
  const cycleOf = d => Math.min(3, Math.floor((Number(d.slice(8, 10)) - 1) / 7));
  function datesForCycle(m, w) {
    const max = monthDays(m), a = 1 + w * 7, b = w === 3 ? max : a + 6;
    return Array.from({ length: b - a + 1 }, (_, i) => dateOfDay(m, a + i));
  }
  function addDays(d, n) {
    const t = Date.UTC(+d.slice(0, 4), +d.slice(5, 7) - 1, +d.slice(8, 10)) + n * 86400000;
    const x = new Date(t);
    return `${x.getUTCFullYear()}-${pad(x.getUTCMonth() + 1)}-${pad(x.getUTCDate())}`;
  }
  const daysBetween = (a, b) => Math.round((Date.UTC(+b.slice(0, 4), +b.slice(5, 7) - 1, +b.slice(8, 10)) - Date.UTC(+a.slice(0, 4), +a.slice(5, 7) - 1, +a.slice(8, 10))) / 86400000);
  const inMonth = (d, m) => String(d || '').startsWith(m);
  const byDate = (a, b) => String(a.date).localeCompare(String(b.date)) || String(a.id).localeCompare(String(b.id));
  const round1 = v => Math.round(v * 10) / 10;

  /* ---------- Notas ---------- */

  // Aceita "9,5", "95", "95%", "38/40", "38 de 40" e conceitos (A, MB, B...).
  // scale: 'auto' (até 10 vira escala 0-10), '10' ou '100'.
  function parseGrade(raw, scale = 'auto') {
    const s = String(raw ?? '').trim().toUpperCase().replace(/,/g, '.');
    if (!s) return null;
    if (Object.prototype.hasOwnProperty.call(CONCEPTS, s)) return CONCEPTS[s];
    let m = s.match(/^(\d+(?:\.\d+)?)\s*(?:\/|DE)\s*(\d+(?:\.\d+)?)$/);
    if (m) {
      const x = +m[1], y = +m[2];
      return y > 0 && x <= y ? round1((x / y) * 100) : null;
    }
    m = s.match(/^(\d+(?:\.\d+)?)\s*%$/);
    if (m) return +m[1] <= 100 ? round1(+m[1]) : null;
    m = s.match(/^(\d+(?:\.\d+)?)$/);
    if (!m) return null;
    const v = +m[1];
    if (scale === '10' || (scale === 'auto' && v <= 10)) return v <= 10 ? round1(v * 10) : null;
    return v <= 100 ? round1(v) : null;
  }

  function gradePoints(pct) {
    if (pct == null || Number.isNaN(pct)) return 0;
    if (pct >= 100) return 20;
    if (pct >= 95) return 15;
    if (pct > 90) return 10;
    return 0;
  }

  function previousGrade(state, g) {
    let best = null;
    for (const x of state.grades) {
      if (x.id === g.id || x.childId !== g.childId || x.status !== 'confirmed') continue;
      if (norm(x.subject) !== norm(g.subject)) continue;
      if (byDate(x, g) >= 0) continue;
      if (!best || byDate(x, best) > 0) best = x;
    }
    return best;
  }
  const norm = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase();

  /* ---------- Cálculos mensais ---------- */

  const findKind = id => NEG_KINDS.find(k => k.id === id) || UNCLASSIFIED;
  const findPos = id => POS_KINDS.find(k => k.id === id) || POS_KINDS[0];

  function schoolMonth(state, cid, m) {
    const grades = state.grades.filter(g => g.childId === cid && g.status === 'confirmed' && inMonth(g.date, m)).sort(byDate);
    const perGrade = {};
    let gradePts = 0, improvePts = 0, improvements = 0, above90 = 0;
    for (const g of grades) {
      const pts = gradePoints(g.pct);
      const prev = previousGrade(state, g);
      let improve = 0;
      if (prev && g.pct - prev.pct >= IMPROVE.delta && improvements < IMPROVE.maxMonth) {
        improvements++; improve = IMPROVE.pts;
      }
      gradePts += pts; improvePts += improve; if (pts > 0) above90++;
      perGrade[g.id] = { pts, improve, prev: prev ? prev.pct : null };
    }
    const occ = state.occurrences.filter(o => o.childId === cid && o.status === 'confirmed' && inMonth(o.date, m)).sort(byDate);
    const pos = occ.filter(o => o.polarity === 'pos');
    const perPos = {};
    pos.forEach((o, i) => { perPos[o.id] = i < POSITIVE.maxMonth ? POSITIVE.pts : 0; });
    const posPts = Math.min(pos.length, POSITIVE.maxMonth) * POSITIVE.pts;
    const negs = occ.filter(o => o.polarity !== 'pos');
    const perNeg = {};
    let penaltyPts = 0;
    negs.forEach((o, i) => {
      let p = i < NEGATIVE.tolerance ? 0 : findKind(o.kind).level * NEGATIVE.ptsPerLevel;
      if (o.recovered) p = Math.floor(p / 2);
      perNeg[o.id] = p; penaltyPts += p;
    });
    return {
      gradePts, improvePts, posPts, above90, gradeCount: grades.length,
      posCount: pos.length, negCount: negs.length, penaltyPts,
      schoolPts: gradePts + improvePts + posPts, perGrade, perPos, perNeg
    };
  }

  const habitsPtsMonth = (state, cid, m) => state.bonuses.filter(b => b.childId === cid && b.month === m).reduce((s, b) => s + (b.pts || 0), 0);
  const childBase = (state, c) => (c && Number.isSafeInteger(c.base) && c.base >= 0 ? c.base : state.config.base);

  function normalizeClosure(c) {
    if ('bonusCents' in c) return c;
    // Fechamento da versão 1: desconto saía da base.
    const penalty = (c.deduction || 0) - (c.recovered || 0);
    return { ...c, habitsCents: c.bonuses || 0, schoolCents: 0, penaltyCents: penalty, bonusCents: (c.total || 0) - (c.base || 0) };
  }

  function finances(state, cid, m) {
    const child = state.children.find(c => c.id === cid);
    // A primeira parcela fixa a base deste mês. Editar regras vale para o próximo.
    const first = state.ledger.find(x => x.childId === cid && x.type === 'payout' && x.month === m && Number.isInteger(x.installment));
    const base = first && Number.isSafeInteger(first.baseSnapshot) ? first.baseSnapshot : childBase(state, child);
    const cpp = state.config.centsPerPoint;
    const capHabits = Math.round(base * state.config.habitsPct / 100);
    const capSchool = Math.round(base * state.config.schoolPct / 100);
    const habitsPts = habitsPtsMonth(state, cid, m);
    const s = schoolMonth(state, cid, m);
    const habitsCents = Math.min(capHabits, habitsPts * cpp);
    const schoolCents = Math.min(capSchool, s.schoolPts * cpp);
    const penaltyCents = s.penaltyPts * cpp;
    const bonusCents = Math.max(0, habitsCents + schoolCents - penaltyCents);
    const live = {
      base, capHabits, capSchool, habitsPts, habitsCents, schoolCents, penaltyCents, bonusCents,
      total: base + bonusCents, school: s, closed: false
    };
    const closed = state.closures.find(x => x.childId === cid && x.month === m);
    return closed ? { ...live, ...normalizeClosure(closed), school: s, closed: true } : live;
  }

  /* ---------- Cofrinhos ---------- */

  // Quatro parcelas mensais: dias 7, 14, 21 e último dia. Não promete 52 semanas/ano.
  function installmentPlan(state, cid, m) {
    const f = finances(state, cid, m), unit = Math.floor(f.base / 4);
    return [7, 14, 21, monthDays(m)].map((day, index) => {
      const payment = state.ledger.find(x => x.childId === cid && x.type === 'payout' && x.month === m && x.installment === index);
      return { index, date: dateOfDay(m, day), amount: index === 3 ? f.base - unit * 3 : unit, paid: Boolean(payment) || f.closed };
    });
  }
  const advancesPaid = (state, cid, m) => state.ledger.filter(x => x.childId === cid && x.type === 'payout' && x.month === m && Number.isInteger(x.installment)).reduce((sum, x) => sum + x.amount, 0);
  const remainingPayout = (state, cid, m) => finances(state, cid, m).closed ? 0 : Math.max(0, finances(state, cid, m).total - advancesPaid(state, cid, m));

  // gastar: livre · poupar: soma das metas · doar: separado para doação
  function jarSpend(state, cid) {
    let v = 0;
    for (const x of state.ledger) {
      if (x.childId !== cid) continue;
      if (['opening', 'payout', 'unsave'].includes(x.type)) v += x.amount;
      else if (['save', 'spend', 'give'].includes(x.type)) v -= x.amount;
    }
    return v;
  }
  function goalSaved(state, gid) {
    let v = 0;
    for (const x of state.ledger) {
      if (x.goalId !== gid) continue;
      if (x.type === 'save' || x.type === 'interest') v += x.amount;
      else if (x.type === 'unsave' || x.type === 'redeem') v -= x.amount;
    }
    return v;
  }
  const jarSave = (state, cid) => state.goals.filter(g => g.childId === cid).reduce((s, g) => s + goalSaved(state, g.id), 0);
  function jarGive(state, cid) {
    let v = 0;
    for (const x of state.ledger) {
      if (x.childId !== cid) continue;
      if (x.type === 'give') v += x.amount;
      else if (x.type === 'donate') v -= x.amount;
    }
    return v;
  }
  const interestFor = (state, goal) => goal.done ? 0 : Math.floor(goalSaved(state, goal.id) * state.config.interestPct / 100);

  // Divide o pagamento do mês entre Poupar (primeira meta aberta) e Doar.
  function payoutSplit(state, child, total) {
    const split = { ...DEFAULT_SPLIT, ...(child.split || {}) };
    const goal = state.goals.find(g => g.childId === child.id && !g.done);
    const save = goal ? Math.floor(total * split.save / 100) : 0;
    const give = Math.floor(total * split.give / 100);
    return { save, give, spend: total - save - give, goalId: goal ? goal.id : null };
  }

  // Valor futuro de depósitos mensais com juros compostos (simulador).
  function futureValue(monthly, months, pct) {
    let v = 0;
    for (let i = 0; i < months; i++) v = v * (1 + pct / 100) + monthly;
    return Math.round(v);
  }

  /* ---------- Jogo: XP, níveis, sequência, conquistas ---------- */

  const ageBand = age => (age <= 10 ? 'kid' : age <= 13 ? 'mid' : 'teen');
  const taskHelp = (task, age) => {
    const h = TASK_HELP[task.id];
    return typeof h === 'object' ? h[ageBand(age)] : (h || '');
  };

  function monthsWithActivity(state, cid) {
    const set = new Set();
    for (const g of state.grades) if (g.childId === cid) set.add(String(g.date).slice(0, 7));
    for (const o of state.occurrences) if (o.childId === cid) set.add(String(o.date).slice(0, 7));
    return [...set];
  }

  // XP = pontos conquistados, sem teto. O dinheiro tem teto; o esforço continua valendo XP.
  function xp(state, cid) {
    let total = state.bonuses.filter(b => b.childId === cid).reduce((s, b) => s + (b.pts || 0), 0);
    for (const m of monthsWithActivity(state, cid)) {
      const s = schoolMonth(state, cid, m);
      total += s.schoolPts;
    }
    total += state.goals.filter(g => g.childId === cid && g.done).length * XP_GOAL_DONE;
    return total;
  }

  function levelInfo(points, age) {
    let i = 0;
    while (i + 1 < LEVELS.length && points >= LEVELS[i + 1]) i++;
    const band = ageBand(age);
    const next = LEVELS[i + 1] ?? null;
    const cur = LEVELS[i];
    return {
      level: i + 1, name: LEVEL_NAMES[band][i], band, xp: points, floor: cur, next,
      toNext: next == null ? 0 : next - points,
      progress: next == null ? 100 : Math.round(((points - cur) / (next - cur)) * 100)
    };
  }

  // Dias seguidos com algum hábito. Um "coringa" perdoa 1 dia sem registro a cada 7.
  function streak(state, cid, todayStr) {
    const days = new Set(state.checkins.filter(c => c.childId === cid).map(c => c.date));
    let d = days.has(todayStr) ? todayStr : addDays(todayStr, -1);
    let count = 0, missedPrev = false, lastJoker = null;
    for (let i = 0; i < 500; i++) {
      if (days.has(d)) { count++; missedPrev = false; }
      else {
        if (count === 0 || missedPrev) break;
        if (lastJoker && daysBetween(d, lastJoker) < 7) break;
        lastJoker = d; missedPrev = true;
      }
      d = addDays(d, -1);
    }
    return count;
  }

  function badges(state, cid, todayStr) {
    const got = new Set();
    const goals = state.goals.filter(g => g.childId === cid);
    const ledger = state.ledger.filter(x => x.childId === cid);
    const grades = state.grades.filter(g => g.childId === cid && g.status === 'confirmed');
    if (goals.length) got.add('meta1');
    if (jarSave(state, cid) >= 5000) got.add('poupa50');
    if (goals.some(g => g.done)) got.add('metaok');
    if (ledger.some(x => x.type === 'give')) got.add('doar');
    if (ledger.some(x => x.type === 'interest')) got.add('juros');
    if (grades.some(g => g.pct > 90)) got.add('nota90');
    if (grades.some(g => g.pct >= 100)) got.add('nota100');
    if (grades.some(g => { const p = previousGrade(state, g); return p && g.pct - p.pct >= IMPROVE.delta; })) got.add('melhora');
    if (state.occurrences.some(o => o.childId === cid && o.polarity === 'pos' && o.status === 'confirmed')) got.add('elogio');
    if (state.bonuses.some(b => b.childId === cid && b.taskId === 'semana')) got.add('semana');
    if (streak(state, cid, todayStr) >= 14) got.add('chama14');
    const child = state.children.find(c => c.id === cid);
    if (levelInfo(xp(state, cid), child ? child.age : 12).level >= 5) got.add('nivel5');
    return got;
  }

  // Meta cooperativa: soma de dias de estudo ou leitura de todas as filhas no mês.
  function familyProgress(state, m) {
    const byChild = state.children.map(c => ({
      childId: c.id,
      count: new Set(state.checkins.filter(x => x.childId === c.id && x.taskId === 'estudo' && inMonth(x.date, m)).map(x => x.date)).size
    }));
    const total = byChild.reduce((s, x) => s + x.count, 0);
    const target = Math.max(1, state.config.familyGoal.target);
    return { total, target, byChild, done: total >= target };
  }

  /* ---------- Estado: semente e migração ---------- */

  const clone = x => JSON.parse(JSON.stringify(x));
  const SAFE_ID = /^[A-Za-z0-9_-]{1,80}$/;
  const COLOR = /^#[0-9a-fA-F]{3,8}$/;
  const okId = x => typeof x === 'string' && SAFE_ID.test(x);
  const okDate = d => typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d);
  const int = (v, d, min, max) => (v !== null && v !== '' && Number.isFinite(Number(v)) ? Math.max(min, Math.min(max, Math.round(Number(v)))) : d);

  function mergeTasks(saved) {
    const list = Array.isArray(saved) ? saved : [];
    return DEFAULT_TASKS.map(d => {
      const s = list.find(t => t && t.id === d.id) || {};
      const pick = {};
      if (Number.isSafeInteger(s.pts) && s.pts >= 0) pick.pts = s.pts;
      if (Number.isSafeInteger(s.target) && s.target >= 1) pick.target = s.target;
      if (typeof s.active === 'boolean') pick.active = s.active;
      return { ...d, ...pick };
    });
  }

  const DEFAULT_PARENTS = [{ id: 'igor', name: 'Igor' }, { id: 'luciana', name: 'Luciana' }];

  // Começo limpo: as duas filhas, os dois responsáveis e R$ 100 de base para cada.
  function seed() {
    return {
      version: VERSION,
      parents: clone(DEFAULT_PARENTS),
      children: [
        { id: 'alice', name: 'Alice', age: 14, alias: 'F14', color: '#8056d9', bg: '#f0eaff', base: null, split: { save: 20, give: 10 } },
        { id: 'leticia', name: 'Letícia', age: 12, alias: 'F12', color: '#0d9c92', bg: '#dcf7f3', base: null, split: { save: 20, give: 10 } }
      ],
      selected: 'alice', view: 'dashboard', role: 'parent:igor',
      config: clone(DEFAULT_CONFIG),
      tasks: clone(DEFAULT_TASKS),
      grades: [], occurrences: [], checkins: [], bonuses: [], goals: [], ledger: [],
      closures: [], seenBadges: {}, importedIds: []
    };
  }

  // Registros de exemplo das versões 1 e 2 (ids fixos da semente antiga).
  const DEMO_IDS = new Set(['g1', 'g2', 'g3', 'oc1', 'oc2', 'oc3', 'oc4', 'bo1', 'bo2', 'goal1', 'goal2', 'goal3', 'l1', 'l2', 'l3', 'l4', 'l5', 'l6']);

  // Converte dados salvos (v1 ou v2) para v2. Retorna null se o formato for inválido.
  function migrate(raw) {
    if (!raw || typeof raw !== 'object' || !Array.isArray(raw.children) || !Array.isArray(raw.ledger)) return null;
    const s = clone(raw);
    if (s.version === 1) {
      const old = s.config || {};
      const base = Number.isSafeInteger(old.base) ? old.base : DEFAULT_CONFIG.base;
      s.config = {
        ...clone(DEFAULT_CONFIG), base,
        habitsPct: old.maxBonus != null && base > 0 ? Math.round(old.maxBonus / base * 100) : DEFAULT_CONFIG.habitsPct
      };
      s.occurrences = (s.occurrences || []).map(o => ({ ...o, polarity: 'neg' }));
      s.bonuses = (s.bonuses || []).map(b => ({ ...b, pts: Math.round((b.amount || 0) / DEFAULT_CONFIG.centsPerPoint) }));
      s.version = 2;
    }
    if (s.version === 2) {
      // v3: só Alice e Letícia, responsáveis Igor e Luciana, sem dados de exemplo.
      const demo = x => !x || DEMO_IDS.has(x.id) || String(x.id).startsWith('ck_') || x.childId === 'cacula';
      s.children = (s.children || []).filter(c => c && c.id !== 'cacula');
      for (const k of ['grades', 'occurrences', 'checkins', 'bonuses', 'goals', 'ledger']) s[k] = (s[k] || []).filter(x => !demo(x));
      s.ledger = s.ledger.filter(x => !x.goalId || !DEMO_IDS.has(x.goalId));
      s.closures = (s.closures || []).filter(x => x && x.childId !== 'cacula');
      for (const c of s.children) { if (c.id === 'alice') c.age = 14; if (c.id === 'leticia') c.age = 12; c.base = null; }
      if (s.config) s.config.base = DEFAULT_CONFIG.base;
      if (s.seenBadges) delete s.seenBadges.cacula;
      if (s.seenLevel) delete s.seenLevel.cacula;
      s.parents = clone(DEFAULT_PARENTS);
      s.role = s.role === 'parent' ? 'parent:igor' : s.role;
      if (s.selected === 'cacula') s.selected = 'alice';
      s.version = 3;
    }
    if (s.version !== VERSION) return null;

    // Saneamento: um backup editado à mão não pode quebrar a tela nem injetar HTML.
    const c0 = { ...clone(DEFAULT_CONFIG), ...(s.config || {}) };
    const fg = { ...DEFAULT_CONFIG.familyGoal, ...(c0.familyGoal || {}) };
    s.config = {
      base: int(c0.base, DEFAULT_CONFIG.base, 0, 99900),
      habitsPct: int(c0.habitsPct, DEFAULT_CONFIG.habitsPct, 0, 100),
      schoolPct: int(c0.schoolPct, DEFAULT_CONFIG.schoolPct, 0, 100),
      centsPerPoint: int(c0.centsPerPoint, DEFAULT_CONFIG.centsPerPoint, 1, 100),
      interestPct: Number.isFinite(Number(c0.interestPct)) ? Math.max(0, Math.min(10, Number(c0.interestPct))) : DEFAULT_CONFIG.interestPct,
      pin: c0.pin && typeof c0.pin.salt === 'string' && typeof c0.pin.hash === 'string' ? { salt: c0.pin.salt, hash: c0.pin.hash } : null,
      familyGoal: { name: String(fg.name).slice(0, 40), emoji: String(fg.emoji).slice(0, 4), target: int(fg.target, 30, 1, 300) }
    };
    s.children = s.children.filter(c => c && okId(c.id)).map(c => ({
      ...c,
      name: String(c.name || 'Perfil').slice(0, 25),
      age: int(c.age, 12, 4, 19),
      alias: String(c.alias || '').slice(0, 6),
      color: COLOR.test(c.color) ? c.color : '#695ce6',
      bg: COLOR.test(c.bg) ? c.bg : '#efedff',
      base: Number.isSafeInteger(c.base) && c.base >= 0 ? c.base : null,
      split: { save: int(c.split?.save, DEFAULT_SPLIT.save, 0, 100), give: int(c.split?.give, DEFAULT_SPLIT.give, 0, 100) }
    }));
    if (!s.children.length) return null;
    for (const k of ['grades', 'occurrences', 'checkins', 'bonuses', 'goals', 'ledger', 'closures', 'importedIds']) {
      if (!Array.isArray(s[k])) s[k] = [];
    }
    const kids = new Set(s.children.map(c => c.id));
    const own = x => x && okId(x.id) && kids.has(x.childId) && okDate(x.date);
    s.grades = s.grades.filter(g => own(g) && Number.isFinite(g.pct) && g.pct >= 0 && g.pct <= 100)
      .map(g => ({ ...g, subject: String(g.subject || 'Outra').slice(0, 30), raw: String(g.raw ?? g.pct).slice(0, 12), status: g.status === 'pending' ? 'pending' : 'confirmed' }));
    s.occurrences = s.occurrences.filter(own).map(o => ({ polarity: 'neg', ...o, detail: String(o.detail || '').slice(0, 300), subject: String(o.subject || '').slice(0, 30), by: String(o.by || '').slice(0, 20), feedback: String(o.feedback || '').slice(0, 180), feedbackBy: String(o.feedbackBy || '').slice(0, 20) }));
    s.checkins = s.checkins.filter(own).map(c => ({ ...c, month: String(c.date).slice(0, 7), week: cycleOf(c.date) }));
    s.bonuses = s.bonuses.filter(b => own(b) && Number.isSafeInteger(b.pts) && Number.isInteger(b.week));
    s.goals = s.goals.filter(g => g && okId(g.id) && kids.has(g.childId) && Number.isSafeInteger(g.target) && g.target > 0)
      .map(g => ({ ...g, name: String(g.name || 'Meta').slice(0, 38), emoji: String(g.emoji || '🎯').slice(0, 4), done: okDate(g.done) ? g.done : undefined }));
    s.ledger = s.ledger.filter(x => own(x) && Number.isSafeInteger(x.amount) && x.amount >= 0 && (x.goalId == null || okId(x.goalId)))
      .map(x => ({ ...x, description: String(x.description || '').slice(0, 90) }));
    s.closures = s.closures.filter(x => x && kids.has(x.childId) && Number.isSafeInteger(x.total));
    s.importedIds = s.importedIds.filter(x => typeof x === 'string').slice(-2000);
    s.tasks = mergeTasks(s.tasks);
    if (!s.seenBadges || typeof s.seenBadges !== 'object') s.seenBadges = {};
    s.parents = (Array.isArray(s.parents) ? s.parents : []).filter(p => p && okId(p.id)).map(p => ({ id: p.id, name: String(p.name || 'Responsável').slice(0, 20) }));
    if (!s.parents.length) s.parents = clone(DEFAULT_PARENTS);
    if (!s.children.some(c => c.id === s.selected)) s.selected = s.children[0].id;
    if (!['dashboard', 'school', 'lancar', 'routine', 'wallet', 'rules'].includes(s.view)) s.view = 'dashboard';
    const roles = [...s.parents.map(p => `parent:${p.id}`), ...s.children.map(c => `child:${c.id}`)];
    if (!roles.includes(s.role)) s.role = roles[0];
    return s;
  }

  return {
    VERSION, NEG_KINDS, UNCLASSIFIED, POS_KINDS, SUBJECTS, GRADE_TIERS, IMPROVE, POSITIVE, NEGATIVE, CONCEPTS,
    DEFAULT_TASKS, DEFAULT_CONFIG, DEFAULT_SPLIT, DEFAULT_PARENTS, LEVELS, LEVEL_NAMES, BADGES, XP_GOAL_DONE,
    dateOfDay, monthDays, cycleOf, datesForCycle, addDays, daysBetween, inMonth, byDate,
    parseGrade, gradePoints, previousGrade, findKind, findPos, schoolMonth, habitsPtsMonth, childBase,
    finances, installmentPlan, advancesPaid, remainingPayout, jarSpend, jarSave, jarGive, goalSaved, interestFor, payoutSplit, futureValue,
    ageBand, taskHelp, xp, levelInfo, streak, badges, familyProgress, mergeTasks, seed, migrate
  };
});
