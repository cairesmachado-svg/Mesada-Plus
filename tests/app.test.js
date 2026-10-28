// Integração da interface com armazenamento simulado; não substitui inspeção visual.
const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const R = require('../js/rules.js');
const code = fs.readFileSync(require.resolve('../js/app.js'), 'utf8');
function app(seed = R.seed()) {
  const handlers = {}, elements = { app: { innerHTML: '' } };
  let saved = JSON.stringify(seed);
  const storage = { getItem: k => k === 'mesadaplus-prototipo-v1' ? saved : null, setItem: (k, v) => { if (k === 'mesadaplus-prototipo-v1') saved = v; } };
  class Clock extends Date { constructor(...args) { super(...(args.length ? args : ['2026-10-31T12:00:00'])); } }
  const context = {
    window: { MesadaRules: R, scrollTo() {}, matchMedia: () => ({ matches: true }) },
    document: { getElementById: id => elements[id], querySelector: () => null, addEventListener: (type, fn) => handlers[type] = fn },
    localStorage: storage, sessionStorage: { getItem: () => null, setItem() {}, removeItem() {} },
    setTimeout: () => 0, clearTimeout() {}, Date: Clock, confirm: () => true,
    FormData: class { constructor(form) { return Object.entries(form.values)[Symbol.iterator](); } }
  };
  vm.runInNewContext(code, context);
  return {
    html: () => elements.app.innerHTML,
    state: () => JSON.parse(saved),
    click: dataset => handlers.click({ target: { closest: () => ({ dataset }) } }),
    role: value => handlers.change({ target: { id: 'role', value } }),
    submit: values => handlers.submit({ preventDefault() {}, target: { getAttribute: () => 'form-lancar', values } })
  };
}

test('todas as telas abrem nos quatro perfis; criança não recebe ações de pagamento', () => {
  const a = app();
  for (const role of ['parent:igor', 'parent:luciana', 'child:alice', 'child:leticia']) {
    a.role(role);
    for (const view of ['dashboard', 'lancar', 'routine', 'wallet', 'school', 'rules']) {
      a.click({ act: 'nav', view });
      assert.match(a.html(), /Mesada\+/);
      if (role.startsWith('child:')) assert.doesNotMatch(a.html(), /data-act="pay-installment"/);
    }
  }
  a.role('child:alice'); a.click({ act: 'nav', view: 'dashboard' });
  assert.ok(a.html().indexOf('Qual foi sua conquista de hoje?') < a.html().indexOf('NÍVEL 1'));
  assert.equal((a.html().match(/class="badge /g) || []).length, 3);
});

test('parcelas são liberadas uma vez; fechamento só paga o restante e respeita perfil', () => {
  const s = R.seed(); s.config.base = 20000;
  const a = app(s);
  a.role('child:alice'); a.click({ act: 'pay-installment', child: 'alice', index: '0' });
  assert.equal(a.state().ledger.length, 0);
  a.role('parent:igor');
  for (let i = 0; i < 2; i++) a.click({ act: 'pay-installment', child: 'alice', index: '0' });
  let state = a.state();
  assert.equal(R.advancesPaid(state, 'alice', '2026-10'), 5000);
  assert.equal(R.jarSpend(state, 'alice'), 4500); // sem meta: poupança fica em Gastar; 10% Doar
  a.click({ act: 'close-month' });
  state = a.state();
  assert.equal(state.ledger.filter(x => x.type === 'payout').reduce((n, x) => n + x.amount, 0), 20000);
  assert.equal(R.jarSpend(state, 'alice'), 18000);
  assert.equal(R.jarGive(state, 'alice'), 2000);
  a.click({ act: 'pay-installment', child: 'alice', index: '1' });
  a.click({ act: 'close-month' });
  assert.equal(a.state().ledger.filter(x => x.type === 'payout').length, 2);
});

test('boa atitude de casa fica pendente e reconhecimento é escapado ao renderizar', async () => {
  const a = app(); a.role('child:alice');
  await a.submit({ child: 'alice', mode: 'pos', kind: 'casa', subject: '', detail: 'Ajudei na cozinha', date: '2026-10-31' });
  assert.equal(a.state().occurrences[0].status, 'pending');
  assert.equal(R.schoolMonth(a.state(), 'alice', '2026-10').posPts, 0);
  const s = a.state(); s.occurrences[0].status = 'confirmed'; s.occurrences[0].feedback = '<img src=x onerror=alert(1)>';
  const b = app(s); b.click({ act: 'nav', view: 'dashboard' });
  assert.match(b.html(), /&lt;img src=x onerror=alert\(1\)&gt;/);
  assert.doesNotMatch(b.html(), /<img src=x/);
});
