/**
 * Mesada+ Família · leitura diária dos e-mails do ClassApp
 *
 * Roda no Google Apps Script da SUA conta Google. Lê o seu Gmail, anota
 * notas e ocorrências numa planilha privada como PENDENTE e manda um resumo.
 * Nada vira ponto sem a sua aprovação. O app só recebe linhas APROVADAS.
 *
 * Guia passo a passo: apps-script/LEIAME.md
 *
 * Privacidade: o script não guarda o texto dos e-mails. Grava só data,
 * apelido da filha (F09, F12, F14), tipo, disciplina, nota e o link do e-mail.
 * Nomes reais ficam apenas nas Propriedades do Script, nunca no GitHub.
 */

const CONFIG = {
  remetente: 'classapp.com.br',      // ajuste após rodar diagnosticar()
  diasParaTras: 7,                    // janela de busca a cada execução
  horaDiaria: 19,                     // horário do gatilho diário
  marcador: 'escola/classapp',        // marcador aplicado no Gmail
  aba: 'Pendentes',
  fuso: 'America/Sao_Paulo'
};

const COLUNAS = ['id', 'data', 'filha', 'tipo', 'disciplina', 'nota_pct', 'pontos_sugeridos', 'status', 'link_email'];
const TIPOS = ['nota', 'nota_sem_valor', 'ocorrencia_positiva', 'ocorrencia_negativa', 'comunicado'];
const STATUS = ['PENDENTE', 'APROVADO', 'DESCARTADO'];

const DISCIPLINAS = ['matematica', 'portugues', 'lingua portuguesa', 'redacao', 'ciencias', 'historia', 'geografia',
  'ingles', 'lingua inglesa', 'espanhol', 'arte', 'artes', 'educacao fisica', 'fisica', 'quimica', 'biologia', 'filosofia', 'sociologia'];
const POSITIVAS = /(elogio|parabens|destaque|merito|ocorrencia positiva|reconhecimento|excelente participacao)/;
const NEGATIVAS = /(advertencia|indisciplina|nao entregou|nao fez|sem tarefa|sem material|esqueceu|atraso|falta de material|ocorrencia disciplinar|notificacao disciplinar|ocorrencia)/;
const NOTAS = /(nota|media|avaliacao|prova|boletim|resultado|simulado|teste)/;

/* ---------- 1. Instalação: rode uma vez ---------- */

function instalar() {
  const props = PropertiesService.getScriptProperties();
  if (!props.getProperty('SHEET_ID')) {
    const ss = SpreadsheetApp.create('Mesada+ ClassApp (privado)');
    props.setProperty('SHEET_ID', ss.getId());
  }
  if (!props.getProperty('API_TOKEN')) props.setProperty('API_TOKEN', Utilities.getUuid().replace(/-/g, ''));
  if (!props.getProperty('ALIASES')) props.setProperty('ALIASES', JSON.stringify({ 'NOME DA FILHA DE 14': 'F14', 'NOME DA FILHA DE 12': 'F12', 'NOME DA FILHA DE 9': 'F09' }));
  prepararPlanilha_();
  ScriptApp.getProjectTriggers().filter(t => t.getHandlerFunction() === 'verificarClassApp').forEach(t => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('verificarClassApp').timeBased().everyDays(1).atHour(CONFIG.horaDiaria).inTimezone(CONFIG.fuso).create();
  const ss = SpreadsheetApp.openById(props.getProperty('SHEET_ID'));
  console.log('Planilha: ' + ss.getUrl());
  console.log('Token (cole no app, em Escola › ClassApp): ' + props.getProperty('API_TOKEN'));
  console.log('Agora edite ALIASES em Configurações do projeto › Propriedades do script.');
}

function prepararPlanilha_() {
  const ss = SpreadsheetApp.openById(PropertiesService.getScriptProperties().getProperty('SHEET_ID'));
  let sh = ss.getSheetByName(CONFIG.aba);
  if (!sh) sh = ss.getSheets()[0].setName(CONFIG.aba);
  if (sh.getLastRow() === 0) {
    sh.appendRow(COLUNAS);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, COLUNAS.length).setFontWeight('bold');
  }
  const linhas = Math.max(sh.getMaxRows() - 1, 1);
  sh.getRange(2, COLUNAS.indexOf('status') + 1, linhas, 1)
    .setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(STATUS, true).build());
  sh.getRange(2, COLUNAS.indexOf('tipo') + 1, linhas, 1)
    .setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(TIPOS, true).build());
  return sh;
}

/* ---------- 2. Rotina diária ---------- */

function verificarClassApp() {
  const props = PropertiesService.getScriptProperties();
  const aliases = JSON.parse(props.getProperty('ALIASES') || '{}');
  const sh = prepararPlanilha_();
  const vistos = new Set(sh.getLastRow() > 1 ? sh.getRange(2, 1, sh.getLastRow() - 1, 1).getValues().flat().map(String) : []);
  const marcador = GmailApp.getUserLabelByName(CONFIG.marcador) || GmailApp.createUserLabel(CONFIG.marcador);
  const consulta = `from:(${CONFIG.remetente}) newer_than:${CONFIG.diasParaTras}d`;
  const novos = [];

  GmailApp.search(consulta, 0, 50).forEach(thread => {
    thread.getMessages().forEach(msg => {
      const id = msg.getId();
      if (vistos.has(id)) return;
      const ev = extrair(msg.getSubject(), msg.getPlainBody(), aliases);
      const linha = [id, Utilities.formatDate(msg.getDate(), CONFIG.fuso, 'yyyy-MM-dd'), ev.filha, ev.tipo, ev.disciplina,
        ev.pct === null ? '' : ev.pct, ev.pontos, ev.tipo === 'comunicado' ? 'DESCARTADO' : 'PENDENTE',
        'https://mail.google.com/mail/u/0/#all/' + id];
      sh.appendRow(linha);
      vistos.add(id);
      if (ev.tipo !== 'comunicado') novos.push(linha);
    });
    thread.addLabel(marcador);
  });

  if (novos.length) {
    const texto = novos.map(r => `• ${r[1]} · ${r[2]} · ${r[3]}${r[4] ? ' · ' + r[4] : ''}${r[5] !== '' ? ' · ' + r[5] + '%' : ''} · ${r[6]} pts sugeridos`).join('\n');
    MailApp.sendEmail(Session.getEffectiveUser().getEmail(),
      `Mesada+: ${novos.length} anotação(ões) da escola para revisar`,
      `${texto}\n\nRevise e marque APROVADO ou DESCARTADO:\n${SpreadsheetApp.openById(props.getProperty('SHEET_ID')).getUrl()}\n\n` +
      'Depois, no app, abra Escola › ClassApp › Importar aprovados.\n' +
      'Notas sem valor no e-mail aparecem como nota_sem_valor: preencha nota_pct e troque o tipo para nota.');
  }
  return novos.length;
}

/* ---------- 3. Extração ---------- */

function norm_(s) {
  return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

function extrair(assunto, corpo, aliases) {
  const t = norm_(assunto + ' \n ' + corpo);
  let filha = 'INDEFINIDA';
  for (const [nome, apelido] of Object.entries(aliases || {})) {
    const n = norm_(nome).trim();
    if (n && new RegExp('\\b' + n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b').test(t)) { filha = apelido; break; }
  }
  const disciplina = DISCIPLINAS.find(d => t.includes(d)) || '';

  if (POSITIVAS.test(t)) return { filha, tipo: 'ocorrencia_positiva', disciplina, pct: null, pontos: 10 };
  if (NEGATIVAS.test(t)) return { filha, tipo: 'ocorrencia_negativa', disciplina, pct: null, pontos: 0 };
  if (NOTAS.test(t)) {
    const pct = lerNota_(t);
    if (pct === null) return { filha, tipo: 'nota_sem_valor', disciplina, pct: null, pontos: 0 };
    return { filha, tipo: 'nota', disciplina, pct, pontos: pontosNota_(pct) };
  }
  return { filha, tipo: 'comunicado', disciplina, pct: null, pontos: 0 };
}

// Aceita "nota: 9,5", "nota 95", "95%", "38/40 pontos", "tirou 38 de 40".
// Frações só valem com contexto, para não confundir datas (10/11) com notas.
function lerNota_(t) {
  const num = s => Number(String(s).replace(',', '.'));
  const N = '(\\d{1,3}(?:[.,]\\d{1,2})?)';
  const fracao = '(?<![\\d\\/.,])' + N + '\\s*(?:\\/|de)\\s*' + N + '(?![\\d\\/])';
  const ok = (x, y) => num(y) > 0 && num(x) <= num(y);
  let m = t.match(new RegExp('(?:nota|media|resultado|pontuacao|obteve|tirou|acertou)\\s*(?:final|obtida|da avaliacao)?\\s*[:=-]?\\s*' + fracao));
  if (m && ok(m[1], m[2])) return arred_(num(m[1]) / num(m[2]) * 100);
  m = t.match(new RegExp(fracao + '\\s*(?:pontos|pts|acertos|questoes)'));
  if (m && ok(m[1], m[2])) return arred_(num(m[1]) / num(m[2]) * 100);
  m = t.match(new RegExp(N + '\\s*%'));
  if (m && num(m[1]) <= 100) return arred_(num(m[1]));
  m = t.match(new RegExp('(?:nota|media|resultado|obteve|tirou)\\s*(?:final|obtida|da avaliacao)?\\s*[:=-]?\\s*' + N + '(?![\\d\\/])'));
  if (m) { const n = num(m[1]); if (n <= 10) return arred_(n * 10); if (n <= 100) return arred_(n); }
  return null;
}
function arred_(v) { return Math.round(v * 10) / 10; }
function pontosNota_(pct) { return pct >= 100 ? 20 : pct >= 95 ? 15 : pct > 90 ? 10 : 0; }

/* ---------- 4. Endpoint lido pelo app ---------- */

function doGet(e) {
  const props = PropertiesService.getScriptProperties();
  const esperado = props.getProperty('API_TOKEN') || '';
  const recebido = String((e && e.parameter && e.parameter.token) || '');
  if (!esperado || !iguais_(recebido, esperado)) return json_({ erro: 'nao autorizado' });
  const sh = SpreadsheetApp.openById(props.getProperty('SHEET_ID')).getSheetByName(CONFIG.aba);
  const dados = sh.getDataRange().getValues();
  const cab = dados.shift().map(String);
  const col = nome => cab.indexOf(nome);
  const saida = dados
    .filter(r => String(r[col('status')]).trim().toUpperCase() === 'APROVADO')
    .map(r => ({
      id: String(r[col('id')]),
      data: r[col('data')] instanceof Date ? Utilities.formatDate(r[col('data')], CONFIG.fuso, 'yyyy-MM-dd') : String(r[col('data')]),
      filha: String(r[col('filha')]).trim(),
      tipo: String(r[col('tipo')]).trim(),
      disciplina: String(r[col('disciplina')] || ''),
      pct: r[col('nota_pct')] === '' ? null : Number(String(r[col('nota_pct')]).replace(',', '.'))
    }));
  return json_(saida);
}
function json_(obj) { return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON); }
function iguais_(a, b) {
  if (a.length !== b.length) return false;
  let d = 0; for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}

/* ---------- 5. Ferramentas de ajuste ---------- */

// Mostra no registro os remetentes e assuntos dos últimos e-mails da escola.
// Use para confirmar CONFIG.remetente antes de ativar a rotina.
function diagnosticar() {
  const threads = GmailApp.search('classapp newer_than:60d', 0, 15);
  if (!threads.length) console.log('Nenhum e-mail com "classapp" nos últimos 60 dias. Procure um aviso da escola e copie o remetente.');
  threads.forEach(th => {
    const m = th.getMessages().pop();
    const ev = extrair(m.getSubject(), m.getPlainBody(), JSON.parse(PropertiesService.getScriptProperties().getProperty('ALIASES') || '{}'));
    console.log(`${m.getFrom()} | ${m.getSubject()} | tipo=${ev.tipo} filha=${ev.filha} nota=${ev.pct}`);
  });
}

// Testa a extração com exemplos. Rode e confira o registro de execução.
function testarExtracao() {
  const aliases = { 'Ana': 'F14' };
  [
    ['Nova nota publicada', 'Ana obteve nota 9,5 na avaliação de Matemática.'],
    ['Resultado da prova', 'Ana: 38/40 pontos em Ciências.'],
    ['Elogio', 'Parabéns à Ana pela apresentação de História.'],
    ['Ocorrência', 'Ana não entregou a tarefa de Português.'],
    ['Nova mensagem', 'Você recebeu uma nova mensagem. Acesse o ClassApp para ler.']
  ].forEach(([a, c]) => console.log(a + ' → ' + JSON.stringify(extrair(a, c, aliases))));
}
