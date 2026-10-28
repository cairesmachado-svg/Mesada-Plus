// Testes das regras. Rode com: node --test tests/*.test.js
const test = require('node:test');
const assert = require('node:assert/strict');
const R = require('../js/rules.js');

const TODAY = '2026-10-25';
const fresh = () => R.migrate(R.seed());

test('semente: Alice e Letícia, Igor e Luciana, R$ 100 de base, sem dados de exemplo', () => {
  const s = fresh();
  assert.deepEqual(s.children.map(c => [c.name, c.age]), [['Alice', 14], ['Letícia', 12]]);
  assert.deepEqual(s.parents.map(p => p.name), ['Igor', 'Luciana']);
  assert.equal(s.role, 'parent:igor');
  assert.equal(R.finances(s, 'alice', '2026-10').total, 10000);
  assert.equal(R.finances(s, 'leticia', '2026-10').total, 10000);
  for (const k of ['grades', 'occurrences', 'checkins', 'bonuses', 'goals', 'ledger']) assert.equal(s[k].length, 0, k);
});

test('parseGrade entende escalas, frações e conceitos', () => {
  assert.equal(R.parseGrade('9,5'), 95);
  assert.equal(R.parseGrade('95'), 95);
  assert.equal(R.parseGrade('95%'), 95);
  assert.equal(R.parseGrade('38/40'), 95);
  assert.equal(R.parseGrade('38 de 40'), 95);
  assert.equal(R.parseGrade('10'), 100);
  assert.equal(R.parseGrade('10', '100'), 10);
  assert.equal(R.parseGrade('MB'), 95);
  assert.equal(R.parseGrade('41/40'), null);
  assert.equal(R.parseGrade('abc'), null);
  assert.equal(R.parseGrade(''), null);
});

test('bônus por nota: acima de 90%, 95% e 100%', () => {
  assert.equal(R.gradePoints(90), 0);
  assert.equal(R.gradePoints(90.1), 10);
  assert.equal(R.gradePoints(94.9), 10);
  assert.equal(R.gradePoints(95), 15);
  assert.equal(R.gradePoints(99.9), 15);
  assert.equal(R.gradePoints(100), 20);
});

test('melhora de 10 pontos na mesma matéria rende +8, no máximo 2 por mês', () => {
  const s = fresh();
  s.grades = [
    { id: 'a', childId: 'alice', date: '2026-09-10', subject: 'História', pct: 60, status: 'confirmed' },
    { id: 'b', childId: 'alice', date: '2026-10-02', subject: 'História', pct: 75, status: 'confirmed' },
    { id: 'c', childId: 'alice', date: '2026-10-05', subject: 'História', pct: 92, status: 'confirmed' },
    { id: 'd', childId: 'alice', date: '2026-10-09', subject: 'Historia', pct: 100, status: 'confirmed' }
  ];
  const m = R.schoolMonth(s, 'alice', '2026-10');
  assert.equal(m.perGrade.b.improve, 8);
  assert.equal(m.perGrade.c.improve, 8);
  assert.equal(m.perGrade.d.improve, 0, 'terceira melhora no mês não conta');
  assert.equal(m.gradePts, 0 + 10 + 20);
  assert.equal(m.improvePts, 16);
});

test('ocorrências positivas: +10 cada, até 3 por mês', () => {
  const s = fresh();
  s.occurrences = [1, 2, 3, 4].map(i => ({ id: 'p' + i, childId: 'alice', polarity: 'pos', kind: 'elogio', date: `2026-10-0${i}`, status: 'confirmed' }));
  const m = R.schoolMonth(s, 'alice', '2026-10');
  assert.equal(m.posPts, 30);
  assert.equal(m.perPos.p4, 0);
});

test('negativas: a primeira do mês é conversa; as seguintes saem só do bônus', () => {
  const s = fresh();
  s.bonuses = [{ id: 'b', childId: 'alice', taskId: 'cama', week: 0, month: '2026-10', pts: 40, date: '2026-10-07' }];
  s.occurrences = [
    { id: 'n1', childId: 'alice', polarity: 'neg', kind: 'dever', date: '2026-10-02', status: 'confirmed' },
    { id: 'n2', childId: 'alice', polarity: 'neg', kind: 'dever', date: '2026-10-08', status: 'confirmed' },
    { id: 'n3', childId: 'alice', polarity: 'neg', kind: 'grave', date: '2026-10-09', status: 'confirmed' }
  ];
  const f = R.finances(s, 'alice', '2026-10');
  assert.equal(f.school.perNeg.n1, 0);
  assert.equal(f.school.perNeg.n2, 15);
  assert.equal(f.school.perNeg.n3, 30);
  assert.equal(f.habitsCents, 400);
  assert.equal(f.bonusCents, 0, 'bônus nunca fica negativo');
  assert.equal(f.total, f.base, 'a mesada-base nunca é descontada');
});

test('recuperação reduz pela metade o ajuste da ocorrência', () => {
  const s = fresh();
  s.occurrences = [
    { id: 'n1', childId: 'alice', polarity: 'neg', kind: 'material', date: '2026-10-02', status: 'confirmed' },
    { id: 'n2', childId: 'alice', polarity: 'neg', kind: 'dever', date: '2026-10-08', status: 'confirmed', recovered: true }
  ];
  assert.equal(R.schoolMonth(s, 'alice', '2026-10').perNeg.n2, 7);
});

test('tetos: hábitos 30% e escola 12% da base', () => {
  const s = fresh();
  s.bonuses = [{ id: 'b', childId: 'leticia', taskId: 'cama', week: 0, month: '2026-10', pts: 999, date: '2026-10-07' }];
  s.grades = Array.from({ length: 9 }, (_, i) => ({ id: 'g' + i, childId: 'leticia', date: `2026-10-1${i}`, subject: 'Mat' + i, pct: 100, status: 'confirmed' }));
  const f = R.finances(s, 'leticia', '2026-10');
  assert.equal(f.capHabits, 3000);
  assert.equal(f.capSchool, 1200);
  assert.equal(f.habitsCents, 3000);
  assert.equal(f.schoolCents, 1200);
  assert.equal(f.total, 10000 + 4200);
});

test('base individual por filha muda os tetos proporcionalmente', () => {
  const s = fresh();
  s.children.find(c => c.id === 'leticia').base = 4000;
  const f = R.finances(s, 'leticia', '2026-10');
  assert.equal(f.capHabits, 1200);
  assert.equal(f.capSchool, 480);
});

test('semana completa de hábitos = teto mensal de hábitos', () => {
  const week = R.DEFAULT_TASKS.reduce((s, t) => s + t.pts, 0);
  assert.equal(week * 4 * R.DEFAULT_CONFIG.centsPerPoint, R.DEFAULT_CONFIG.base * R.DEFAULT_CONFIG.habitsPct / 100);
});

test('sequência com coringa: perdoa 1 falta a cada 7 dias', () => {
  const s = fresh();
  const mk = dates => dates.map((d, i) => ({ id: 'k' + i, childId: 'alice', taskId: 'cama', date: d }));
  s.checkins = mk(['2026-10-25', '2026-10-24', '2026-10-22', '2026-10-21']);
  assert.equal(R.streak(s, 'alice', TODAY), 4);
  s.checkins = mk(['2026-10-25', '2026-10-23', '2026-10-21']);
  assert.equal(R.streak(s, 'alice', TODAY), 2, 'segundo coringa em menos de 7 dias encerra');
  s.checkins = mk(['2026-10-24', '2026-10-23']);
  assert.equal(R.streak(s, 'alice', TODAY), 2, 'hoje ainda sem registro não quebra a sequência');
  s.checkins = mk(['2026-10-25', '2026-10-22']);
  assert.equal(R.streak(s, 'alice', TODAY), 1, 'duas faltas seguidas encerram');
});

test('níveis e nomes por faixa etária', () => {
  assert.equal(R.levelInfo(0, 12).level, 1);
  assert.equal(R.levelInfo(59, 12).level, 1);
  assert.equal(R.levelInfo(60, 12).level, 2);
  assert.equal(R.levelInfo(60, 12).name, 'Exploradora');
  assert.equal(R.levelInfo(0, 14).name, 'Novata');
  assert.equal(R.levelInfo(5000, 14).level, 10);
  assert.equal(R.levelInfo(5000, 14).toNext, 0);
});

function withWallet() {
  const s = fresh();
  s.goals = [{ id: 'gl', childId: 'leticia', name: 'Kit', emoji: '🎨', target: 6000 }];
  s.ledger = [
    { id: 'a', childId: 'leticia', type: 'opening', amount: 1500, date: '2026-10-01', description: 'x' },
    { id: 'b', childId: 'leticia', type: 'save', goalId: 'gl', amount: 800, date: '2026-10-02', description: 'x' },
    { id: 'c', childId: 'leticia', type: 'give', amount: 200, date: '2026-10-02', description: 'x' }
  ];
  return s;
}

test('cofrinhos: gastar, poupar e doar a partir do extrato', () => {
  const s = withWallet();
  assert.equal(R.jarSpend(s, 'leticia'), 1500 - 800 - 200);
  assert.equal(R.jarSave(s, 'leticia'), 800);
  assert.equal(R.jarGive(s, 'leticia'), 200);
  s.ledger.push({ id: 'i', childId: 'leticia', goalId: 'gl', type: 'interest', amount: 16, date: '2026-10-31' });
  s.ledger.push({ id: 'd', childId: 'leticia', type: 'donate', amount: 100, date: '2026-10-31' });
  assert.equal(R.goalSaved(s, 'gl'), 816);
  assert.equal(R.jarGive(s, 'leticia'), 100);
});

test('divisão automática do pagamento', () => {
  const s = withWallet();
  const c = s.children.find(x => x.id === 'leticia');
  assert.deepEqual(R.payoutSplit(s, c, 10000), { save: 2000, give: 1000, spend: 7000, goalId: 'gl' });
  s.goals = [];
  assert.equal(R.payoutSplit(s, c, 10000).save, 0, 'sem meta aberta, nada vai para Poupar');
});

test('simulador de juros compostos', () => {
  assert.equal(R.futureValue(1000, 12, 0), 12000);
  assert.equal(R.futureValue(1000, 2, 10), 2100);
});

test('migração da versão 1 preserva dados e protege a base', () => {
  const v1 = {
    version: 1, children: [{ id: 'a', name: 'A', age: 14, color: '#000', bg: '#fff' }], selected: 'a', view: 'dashboard', role: 'parent',
    config: { base: 10000, maxDeduction: 4000, maxBonus: 3000, maxRecovery: 1000 },
    occurrences: [{ id: 'o', childId: 'a', kind: 'dever', date: '2026-10-02', status: 'confirmed', recovered: false }],
    checkins: [{ id: 'c', childId: 'a', taskId: 'cama', week: 0, month: '2026-10', date: '2026-10-02' }],
    bonuses: [{ id: 'b', childId: 'a', taskId: 'cama', week: 0, month: '2026-10', amount: 200, date: '2026-10-07' }],
    goals: [], ledger: [{ id: 'l', childId: 'a', type: 'opening', amount: 100, date: '2026-10-01', description: 'x' }],
    closures: [{ id: 'z', childId: 'a', month: '2026-09', base: 10000, deduction: 600, recovered: 0, bonuses: 500, total: 9900, confirmed: 1, closed: true }]
  };
  const s = R.migrate(v1);
  assert.equal(s.version, 3);
  assert.equal(s.role, 'parent:igor');
  assert.equal(s.config.habitsPct, 30);
  assert.equal(s.bonuses[0].pts, 20);
  assert.equal(s.occurrences[0].polarity, 'neg');
  assert.equal(R.finances(s, 'a', '2026-09').total, 9900, 'mês fechado mantém o valor pago');
  assert.equal(R.finances(s, 'a', '2026-10').total, 10000 + 200, 'primeira negativa do mês não desconta');
  assert.equal(R.migrate({ foo: 1 }), null);
});

test('migração da versão 2 tira a Caçula e os dados de exemplo e mantém o que é real', () => {
  const v2 = {
    version: 2, selected: 'cacula', view: 'school', role: 'parent', config: { base: 10000 },
    children: [{ id: 'alice', name: 'Alice', age: 15 }, { id: 'leticia', name: 'Letícia', age: 14 }, { id: 'cacula', name: 'Caçula', age: 9 }],
    grades: [{ id: 'g1', childId: 'alice', date: '2026-10-06', subject: 'Matemática', pct: 94, status: 'confirmed' },
      { id: 'id_real', childId: 'leticia', date: '2026-10-20', subject: 'Português', pct: 96, status: 'confirmed' }],
    occurrences: [{ id: 'oc4', childId: 'cacula', polarity: 'pos', kind: 'ajuda', date: '2026-10-08', status: 'confirmed' }],
    checkins: [{ id: 'ck_alice_estudo_2026-10-25', childId: 'alice', taskId: 'estudo', date: '2026-10-25' }],
    bonuses: [], goals: [{ id: 'goal1', childId: 'alice', name: 'Fone', emoji: '🎧', target: 18000 }],
    ledger: [{ id: 'l1', childId: 'alice', type: 'opening', amount: 4200, date: '2026-10-01' },
      { id: 'id_x', childId: 'alice', goalId: 'goal1', type: 'save', amount: 500, date: '2026-10-10' }],
    closures: [], seenBadges: { cacula: ['doar'] }
  };
  const s = R.migrate(v2);
  assert.equal(s.version, 3);
  assert.deepEqual(s.children.map(c => [c.id, c.age]), [['alice', 14], ['leticia', 12]]);
  assert.equal(s.selected, 'alice');
  assert.equal(s.role, 'parent:igor');
  assert.deepEqual(s.grades.map(g => g.id), ['id_real']);
  assert.equal(s.occurrences.length, 0);
  assert.equal(s.checkins.length, 0);
  assert.equal(s.goals.length, 0);
  assert.equal(s.ledger.length, 0, 'movimento ligado a meta de exemplo também sai');
  assert.ok(!('cacula' in s.seenBadges));
});

test('conquistas e meta da família', () => {
  const s = withWallet();
  s.grades = [{ id: 'g', childId: 'leticia', date: '2026-10-20', subject: 'Português', pct: 96, status: 'confirmed' }];
  s.occurrences = [{ id: 'o', childId: 'leticia', polarity: 'pos', kind: 'participacao', date: '2026-10-20', status: 'confirmed' }];
  const b = R.badges(s, 'leticia', TODAY);
  assert.ok(b.has('nota90'));
  assert.ok(b.has('elogio'));
  assert.ok(b.has('doar'));
  assert.ok(b.has('meta1'));
  s.checkins = [
    { id: 'k1', childId: 'alice', taskId: 'estudo', date: '2026-10-20' },
    { id: 'k2', childId: 'leticia', taskId: 'estudo', date: '2026-10-20' },
    { id: 'k3', childId: 'leticia', taskId: 'cama', date: '2026-10-21' }
  ];
  assert.equal(R.familyProgress(s, '2026-10').total, 2);
});

test('migração saneia backup adulterado', () => {
  const s = R.seed();
  s.children[0].color = 'red;"><script>alert(1)</script>';
  s.children.push({ id: 'x"><img src=x>', name: 'Intrusa', age: 10 });
  s.grades.push({ id: 'g9', childId: 'alice', date: TODAY, subject: '<b>Mat</b>', pct: '<img>', status: 'confirmed' });
  s.ledger.push({ id: 'l9', childId: 'alice', type: 'opening', amount: 'muito', date: TODAY });
  s.config.base = '<script>';
  s.parents.push({ id: 'p"><x', name: 'Falso' });
  const m = R.migrate(s);
  assert.equal(m.children[0].color, '#695ce6');
  assert.equal(m.children.length, 2);
  assert.equal(m.parents.length, 2);
  assert.ok(!m.grades.some(g => g.id === 'g9'));
  assert.ok(!m.ledger.some(x => x.id === 'l9'));
  assert.equal(m.config.base, R.DEFAULT_CONFIG.base);
});

test('quatro parcelas preservam centavos e usam o último dia real do mês', () => {
  const s = fresh(); s.config.base = 20001;
  for (const [month, last] of [['2026-02', '2026-02-28'], ['2028-02', '2028-02-29'], ['2026-10', '2026-10-31']]) {
    const plan = R.installmentPlan(s, 'alice', month);
    assert.equal(plan.length, 4);
    assert.deepEqual(plan.map(x => x.amount), [5000, 5000, 5000, 5001]);
    assert.equal(plan.at(-1).date, last);
    assert.equal(plan.reduce((n, x) => n + x.amount, 0), 20001);
  }
});

test('parcelas pagas não duplicam no fechamento e base fica fixa só naquele mês', () => {
  const s = fresh(); s.config.base = 20000;
  s.ledger.push({ id: 'parcela1', childId: 'alice', type: 'payout', month: '2026-10', installment: 0, baseSnapshot: 20000, amount: 5000, date: '2026-10-07' });
  s.config.base = 30000;
  assert.equal(R.finances(s, 'alice', '2026-10').base, 20000);
  assert.equal(R.finances(s, 'alice', '2026-11').base, 30000);
  assert.equal(R.finances(s, 'leticia', '2026-10').base, 30000);
  assert.equal(R.installmentPlan(s, 'alice', '2026-10')[0].paid, true);
  assert.equal(R.remainingPayout(s, 'alice', '2026-10'), 15000);
  assert.equal(R.jarSpend(s, 'alice'), 5000);
  const restored = R.migrate(JSON.parse(JSON.stringify(s)));
  assert.equal(R.remainingPayout(restored, 'alice', '2026-10'), 15000);
  s.occurrences.push({ id: 'boa', childId: 'alice', polarity: 'pos', kind: 'casa', status: 'confirmed', date: TODAY });
  assert.equal(R.remainingPayout(s, 'alice', '2026-10'), 15100);
  s.closures.push({ childId: 'alice', month: '2026-10', total: 20100, base: 20000, bonusCents: 100 });
  assert.equal(R.remainingPayout(s, 'alice', '2026-10'), 0);
  assert.ok(R.installmentPlan(s, 'alice', '2026-10').every(x => x.paid));
});

test('fechamentos antigos continuam fechados e boas atitudes novas sobrevivem ao backup', () => {
  const s = fresh();
  s.closures.push({ childId: 'alice', month: '2026-09', total: 10000, base: 10000, bonusCents: 0 });
  assert.ok(R.installmentPlan(s, 'alice', '2026-09').every(x => x.paid));
  s.occurrences.push({ id: 'cuidado1', childId: 'alice', polarity: 'pos', kind: 'cuidado', status: 'confirmed', date: TODAY, feedback: '<Obrigada pela ajuda>', feedbackBy: 'Luciana' });
  const restored = R.migrate(s);
  assert.equal(R.findPos(restored.occurrences[0].kind).id, 'cuidado');
  assert.equal(restored.occurrences[0].feedbackBy, 'Luciana');
  assert.equal(R.schoolMonth(restored, 'alice', '2026-10').posPts, 10);
});

test('missões: teto bloqueia recompensa inteira; aprovação individual isola a irmã', () => {
  const s = fresh();
  s.missions = ['alice', 'leticia'].map(childId => ({ id: childId, childId, key: '2026-10_3_orcamento', date: TODAY, answer: 'Resposta', status: 'pending' }));
  let r = R.missionApproval(s, '2026-10_3_orcamento', TODAY, 'alice');
  assert.deepEqual(r.targets.map(c => c.id), ['alice']);
  s.ledger.push({ id: 'extra', childId: 'alice', type: 'mission', amount: 1900, month: '2026-10', date: TODAY });
  assert.match(R.missionApproval(s, '2026-10_3_orcamento', TODAY, 'alice').error, /teto/);
  assert.equal(R.missionPaid(s, 'alice', '2026-10'), 1900);
  assert.equal(R.missionApproval(s, '2026-10_3_orcamento', '2026-11-01', 'alice').error, undefined);
  assert.ok(R.missionApproval(s, 'chave-invalida', TODAY, 'alice').error);
});

test('missões: backup antigo ganha estrutura, novo mantém relatos e recompensa', () => {
  const old = R.seed(); delete old.missions; delete old.config.missionCap;
  const s = R.migrate(old);
  assert.deepEqual(s.missions, []); assert.equal(s.config.missionCap, 2000);
  s.view = 'missions';
  s.missions.push({ id: 'missao1', childId: 'alice', key: '2026-10_3_receita', date: TODAY, answer: 'Meu guia', status: 'revision', note: 'Uma dica' });
  assert.equal(R.migrate(s).missions[0].note, 'Uma dica');
  assert.equal(R.migrate(s).view, 'missions');
  for (let w = 0; w < 4; w++) assert.equal(R.missionsFor('2026-10', w).length, 3);
});
