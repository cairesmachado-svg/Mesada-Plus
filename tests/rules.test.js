// Testes das regras. Rode com: node --test tests/
const test = require('node:test');
const assert = require('node:assert/strict');
const R = require('../js/rules.js');

const TODAY = '2026-10-25';
const fresh = () => R.migrate(R.seed(TODAY));

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

test('melhora de 10 pontos na mesma disciplina rende +8, no máximo 2 por mês', () => {
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
  s.grades = []; s.bonuses = [{ id: 'b', childId: 'alice', taskId: 'cama', week: 0, month: '2026-10', pts: 40, date: '2026-10-07' }];
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
  s.children.find(c => c.id === 'cacula').base = 4000;
  const f = R.finances(s, 'cacula', '2026-10');
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
  assert.equal(R.levelInfo(0, 9).level, 1);
  assert.equal(R.levelInfo(59, 9).level, 1);
  assert.equal(R.levelInfo(60, 9).level, 2);
  assert.match(R.levelInfo(60, 9).name, /Pintinho/);
  assert.equal(R.levelInfo(500, 12).name, 'Estrategista');
  assert.equal(R.levelInfo(5000, 14).level, 10);
  assert.equal(R.levelInfo(5000, 14).toNext, 0);
});

test('cofrinhos: gastar, poupar e doar a partir do livro-razão', () => {
  const s = fresh();
  assert.equal(R.jarSpend(s, 'cacula'), 1500 - 800 - 200);
  assert.equal(R.jarSave(s, 'cacula'), 800);
  assert.equal(R.jarGive(s, 'cacula'), 200);
  s.ledger.push({ id: 'i', childId: 'cacula', goalId: 'goal3', type: 'interest', amount: 16 });
  s.ledger.push({ id: 'd', childId: 'cacula', type: 'donate', amount: 100 });
  assert.equal(R.goalSaved(s, 'goal3'), 816);
  assert.equal(R.jarGive(s, 'cacula'), 100);
});

test('divisão automática do pagamento', () => {
  const s = fresh();
  const c = s.children.find(x => x.id === 'cacula');
  const p = R.payoutSplit(s, c, 10000);
  assert.deepEqual(p, { save: 3000, give: 1000, spend: 6000, goalId: 'goal3' });
  s.goals = s.goals.filter(g => g.childId !== 'cacula');
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
  assert.equal(s.version, 2);
  assert.equal(s.config.habitsPct, 30);
  assert.equal(s.bonuses[0].pts, 20);
  assert.equal(s.occurrences[0].polarity, 'neg');
  assert.equal(s.tasks.length, R.DEFAULT_TASKS.length);
  assert.equal(R.finances(s, 'a', '2026-09').total, 9900, 'mês fechado mantém o valor pago');
  assert.equal(R.finances(s, 'a', '2026-10').total, 10000 + 200, 'primeira negativa do mês não desconta');
  assert.equal(R.migrate({ foo: 1 }), null);
});

test('conquistas e meta da família na semente', () => {
  const s = fresh();
  const b = R.badges(s, 'leticia', TODAY);
  assert.ok(b.has('nota90'));
  assert.ok(b.has('elogio'));
  assert.ok(R.badges(s, 'cacula', TODAY).has('doar'));
  const fam = R.familyProgress(s, '2026-10');
  assert.equal(fam.total, 4 + 3 + 5);
});

test('migração saneia backup adulterado', () => {
  const s = R.seed(TODAY);
  s.children[0].color = 'red;"><script>alert(1)</script>';
  s.children.push({ id: 'x"><img src=x>', name: 'Intrusa', age: 10 });
  s.grades.push({ id: 'g9', childId: 'alice', date: TODAY, subject: '<b>Mat</b>', pct: '<img>', status: 'confirmed' });
  s.ledger.push({ id: 'l9', childId: 'alice', type: 'opening', amount: 'muito', date: TODAY });
  s.config.base = '<script>';
  const m = R.migrate(s);
  assert.equal(m.children[0].color, '#695ce6');
  assert.equal(m.children.length, 3);
  assert.ok(!m.grades.some(g => g.id === 'g9'));
  assert.ok(!m.ledger.some(x => x.id === 'l9'));
  assert.equal(m.config.base, R.DEFAULT_CONFIG.base);
});
