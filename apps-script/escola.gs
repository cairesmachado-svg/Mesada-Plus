/**
 * Mesada+ Família · leitura diária dos e-mails da escola (Galois e ClassApp)
 *
 * Roda no Google Apps Script da conta Gmail que RECEBE os e-mails da escola.
 * Anota notas e ocorrências numa planilha privada como PENDENTE e manda um
 * resumo. Nada vira ponto sem a sua aprovação. O app só recebe linhas APROVADAS.
 *
 * Guia passo a passo: apps-script/LEIAME.md
 *
 * Privacidade: o script não guarda o texto dos e-mails nem a matrícula.
 * Grava só data, apelido da filha (F09, F12, F14), tipo, disciplina, nota,
 * o tipo de ocorrência (ex.: Monitoria) e o link do e-mail.
 * Nomes reais ficam apenas nas Propriedades do Script, nunca no GitHub.
 */

const CONFIG = {
  remetentes: ['galois.com.br', 'classapp.com.br'], // confira com diagnosticar()
  diasParaTras: 7,                                   // janela de busca a cada execução
  horaDiaria: 19,                                    // horário do gatilho diário
  marcador: 'escola/mesada',                         // marcador aplicado no Gmail
  aba: 'Pendentes',
  fuso: 'America/Sao_Paulo'
};

const COLUNAS = ['id', 'data', 'filha', 'tipo', 'disciplina', 'nota_pct', 'pontos_sugeridos', 'status', 'link_email', 'descricao'];
const TIPOS = ['nota', 'nota_sem_valor', 'ocorrencia_positiva', 'ocorrencia_negativa', 'ocorrencia', 'comunicado'];
const STATUS = ['PENDENTE', 'APROVADO', 'DESCARTADO'];

// Nome normalizado no e-mail → nome usado no app.
const DISCIPLINAS = [
  ['lingua portuguesa', 'Português'], ['portugues', 'Português'], ['producao de texto', 'Redação'], ['redacao', 'Redação'],
  ['matematica', 'Matemática'], ['ciencias', 'Ciências'], ['historia', 'História'], ['geografia', 'Geografia'],
  ['lingua inglesa', 'Inglês'], ['ingles', 'Inglês'], ['educacao fisica', 'Educação Física'], ['artes', 'Arte'], ['arte', 'Arte'],
  ['fisica', 'Física'], ['quimica', 'Química'], ['biologia', 'Biologia'], ['espanhol', 'Outra'], ['filosofia', 'Outra'], ['sociologia', 'Outra']
];

// Tipo da ocorrência (formato Galois: "Foi registrada a seguinte ocorrência: MONITORIA para o(a) aluno(a) ...").
const OC_POSITIVAS = /(monitoria|frequencia extra|resolve|elogio|parabens|destaque|merito|participacao|reconhecimento|aula extra|plantao)/;
const OC_NEGATIVAS = /(advertencia|indisciplina|falta de material|sem material|esqueceu|nao entregou|nao fez|nao realizou|tarefa|atraso|celular|uniforme|suspensao|comportamento|desrespeito)/;
const AUSENCIA = /(nao compareceu|faltou|ausente|nao participou|ausencia)/;

// Formato livre (ClassApp e outros avisos).
const POSITIVAS = /(elogio|parabens|destaque|merito|ocorrencia positiva|reconhecimento|excelente participacao)/;
const NEGATIVAS = /(advertencia|indisciplina|nao entregou|nao fez|sem tarefa|sem material|esqueceu|atraso|falta de material|ocorrencia disciplinar|notificacao disciplinar)/;
const NOTAS = /(nota|media|avaliacao|prova|boletim|resultado|simulado|teste)/;

/* ---------- 1. Instalação: rode uma vez ---------- */

function instalar() {
  const props = PropertiesService.getScriptProperties();
  if (!props.getProperty('SHEET_ID')) {
    const ss = SpreadsheetApp.create('Mesada+ Escola (privado)');
    props.setProperty('SHEET_ID', ss.getId());
  }
  if (!props.getProperty('API_TOKEN')) props.setProperty('API_TOKEN', Utilities.getUuid().replace(/-/g, ''));
  if (!props.getProperty('ALIASES')) props.setProperty('ALIASES', JSON.stringify({ 'NOME DA FILHA DE 14': 'F14', 'NOME DA FILHA DE 12': 'F12', 'NOME DA FILHA DE 9': 'F09' }));
  prepararPlanilha_();
  ScriptApp.getProjectTriggers().filter(t => t.getHandlerFunction() === 'verificarEscola').forEach(t => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('verificarEscola').timeBased().everyDays(1).atHour(CONFIG.horaDiaria).inTimezone(CONFIG.fuso).create();
  const ss = SpreadsheetApp.openById(props.getProperty('SHEET_ID'));
  console.log('Planilha: ' + ss.getUrl());
  console.log('Token (cole no app, em Escola › E-mails da escola): ' + props.getProperty('API_TOKEN'));
  console.log('Agora edite ALIASES em Configurações do projeto › Propriedades do script.');
}

function prepararPlanilha_() {
  const ss = SpreadsheetApp.openById(PropertiesService.getScriptProperties().getProperty('SHEET_ID'));
  let sh = ss.getSheetByName(CONFIG.aba);
  if (!sh) sh = ss.getSheets()[0].setName(CONFIG.aba);
  if (sh.getLastRow() === 0) {
    sh.appendRow(COLUNAS);
    sh.setFrozenRows(1);
  } else {
    // Planilha de uma versão anterior: acrescenta colunas novas no fim.
    const cab = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0].map(String);
    COLUNAS.filter(c => !cab.includes(c)).forEach((c, i) => sh.getRange(1, cab.length + i + 1).setValue(c));
  }
  const cab = cabecalho_(sh);
  sh.getRange(1, 1, 1, cab.length).setFontWeight('bold');
  const linhas = Math.max(sh.getMaxRows() - 1, 1);
  sh.getRange(2, cab.indexOf('status') + 1, linhas, 1)
    .setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(STATUS, true).build());
  sh.getRange(2, cab.indexOf('tipo') + 1, linhas, 1)
    .setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(TIPOS, true).build());
  return sh;
}
function cabecalho_(sh) { return sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0].map(String); }

/* ---------- 2. Rotina diária ---------- */

function consulta_() {
  const r = CONFIG.remetentes;
  // Inclui e-mails encaminhados à mão, que trazem o remetente original no corpo.
  return `(from:(${r.join(' OR ')}) OR ${r.map(x => `"${x}"`).join(' OR ')}) -subject:"Mesada+" newer_than:${CONFIG.diasParaTras}d`;
}

function verificarEscola() {
  const props = PropertiesService.getScriptProperties();
  const aliases = JSON.parse(props.getProperty('ALIASES') || '{}');
  const sh = prepararPlanilha_();
  const cab = cabecalho_(sh);
  const vistos = new Set(sh.getLastRow() > 1 ? sh.getRange(2, 1, sh.getLastRow() - 1, 1).getValues().flat().map(String) : []);
  const marcador = GmailApp.getUserLabelByName(CONFIG.marcador) || GmailApp.createUserLabel(CONFIG.marcador);
  const novos = [];

  GmailApp.search(consulta_(), 0, 50).forEach(thread => {
    thread.getMessages().forEach(msg => {
      const id = msg.getId();
      if (vistos.has(id)) return;
      const ev = extrair(msg.getSubject(), msg.getPlainBody(), aliases);
      const reg = {
        id,
        data: ev.data || Utilities.formatDate(msg.getDate(), CONFIG.fuso, 'yyyy-MM-dd'),
        filha: ev.filha, tipo: ev.tipo, disciplina: ev.disciplina,
        nota_pct: ev.pct === null ? '' : ev.pct, pontos_sugeridos: ev.pontos,
        status: ev.tipo === 'comunicado' ? 'DESCARTADO' : 'PENDENTE',
        link_email: 'https://mail.google.com/mail/u/0/#all/' + id,
        descricao: ev.descricao
      };
      sh.appendRow(cab.map(c => (c in reg ? reg[c] : '')));
      vistos.add(id);
      if (ev.tipo !== 'comunicado') novos.push(reg);
    });
    thread.addLabel(marcador);
  });

  if (novos.length) {
    const texto = novos.map(r => `• ${r.data} · ${r.filha} · ${r.descricao || r.tipo}${r.disciplina ? ' · ' + r.disciplina : ''}${r.nota_pct !== '' ? ' · ' + r.nota_pct + '%' : ''} · ${r.pontos_sugeridos} pts sugeridos`).join('\n');
    MailApp.sendEmail(Session.getEffectiveUser().getEmail(),
      `Mesada+: ${novos.length} anotação(ões) da escola para revisar`,
      `${texto}\n\nRevise e marque APROVADO ou DESCARTADO:\n${SpreadsheetApp.openById(props.getProperty('SHEET_ID')).getUrl()}\n\n` +
      'Depois, no app, abra Escola › E-mails da escola › Importar aprovados.\n' +
      'Tipo "ocorrencia" ainda não tem lado definido: troque para ocorrencia_positiva ou ocorrencia_negativa, ou classifique no app.\n' +
      'Notas sem valor aparecem como nota_sem_valor: preencha nota_pct e troque o tipo para nota.');
  }
  return novos.length;
}

// Nome antigo do gatilho, mantido para quem instalou a primeira versão.
function verificarClassApp() { return verificarEscola(); }

/* ---------- 3. Extração ---------- */

function norm_(s) {
  return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}
function rotulo_(s) {
  const t = String(s || '').trim().toLowerCase();
  return t ? t.charAt(0).toUpperCase() + t.slice(1) : '';
}

function lerDisciplina_(t) {
  const m = t.match(/disciplina:\s*([^\n]+?)\s*(?:observacao:|\n|$)/);
  const alvo = m ? m[1] : t;
  const d = DISCIPLINAS.find(([k]) => alvo.includes(k));
  return d ? d[1] : (m ? rotulo_(m[1]).slice(0, 30) : '');
}

function lerData_(t) {
  const m = t.match(/na data\s*(\d{2})\/(\d{2})\/(\d{4})/);
  return m ? `${m[3]}-${m[2]}-${m[1]}` : null;
}

function categoria_(texto) {
  const t = norm_(texto);
  if (/(monitoria|frequencia extra|resolve|participacao|aula extra|plantao)/.test(t)) return 'participacao';
  if (/destaque/.test(t)) return 'destaque';
  if (/ajud/.test(t)) return 'ajuda';
  return 'elogio';
}

function extrair(assunto, corpo, aliases) {
  const t = norm_(assunto + ' \n ' + corpo);
  let filha = 'INDEFINIDA';
  for (const [nome, apelido] of Object.entries(aliases || {})) {
    const n = norm_(nome).trim();
    if (n && new RegExp('\\b' + n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b').test(t)) { filha = apelido; break; }
  }
  const disciplina = lerDisciplina_(t);
  const data = lerData_(t);
  const base = { filha, disciplina, data, pct: null, pontos: 0, descricao: '' };

  // Formato Galois: o tipo da ocorrência vem escrito e decide o lado.
  const oc = t.match(/registrad[ao] a seguinte ocorrencia:?\s*(.+?)\s+para o\s*\(a\)\s*aluno/);
  if (oc) {
    const tipoOc = oc[1].trim();
    const obs = (t.match(/observacao:\s*([^\n]+)/) || [])[1] || '';
    const descricao = rotulo_(tipoOc);
    if (AUSENCIA.test(obs)) return { ...base, tipo: 'ocorrencia', descricao };
    if (OC_POSITIVAS.test(tipoOc)) return { ...base, tipo: 'ocorrencia_positiva', pontos: 10, descricao };
    if (OC_NEGATIVAS.test(tipoOc)) return { ...base, tipo: 'ocorrencia_negativa', descricao };
    return { ...base, tipo: 'ocorrencia', descricao };
  }

  if (POSITIVAS.test(t)) return { ...base, tipo: 'ocorrencia_positiva', pontos: 10, descricao: 'Elogio' };
  if (NEGATIVAS.test(t)) return { ...base, tipo: 'ocorrencia_negativa' };
  if (NOTAS.test(t)) {
    const pct = lerNota_(t);
    if (pct === null) return { ...base, tipo: 'nota_sem_valor' };
    return { ...base, tipo: 'nota', pct, pontos: pontosNota_(pct) };
  }
  return { ...base, tipo: 'comunicado' };
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
  const val = (r, nome) => (cab.indexOf(nome) >= 0 ? r[cab.indexOf(nome)] : '');
  const saida = dados
    .filter(r => String(val(r, 'status')).trim().toUpperCase() === 'APROVADO')
    .map(r => {
      const data = val(r, 'data'), pct = val(r, 'nota_pct'), descricao = String(val(r, 'descricao') || '');
      return {
        id: String(val(r, 'id')),
        data: data instanceof Date ? Utilities.formatDate(data, CONFIG.fuso, 'yyyy-MM-dd') : String(data),
        filha: String(val(r, 'filha')).trim(),
        tipo: String(val(r, 'tipo')).trim(),
        disciplina: String(val(r, 'disciplina') || ''),
        pct: pct === '' ? null : Number(String(pct).replace(',', '.')),
        descricao,
        categoria: categoria_(descricao)
      };
    });
  return json_(saida);
}
function json_(obj) { return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON); }
function iguais_(a, b) {
  if (a.length !== b.length) return false;
  let d = 0; for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}

/* ---------- 5. Ferramentas de ajuste ---------- */

// Mostra no registro remetente, assunto e leitura dos últimos e-mails da escola.
function diagnosticar() {
  const aliases = JSON.parse(PropertiesService.getScriptProperties().getProperty('ALIASES') || '{}');
  const threads = GmailApp.search(consulta_().replace(/newer_than:\d+d/, 'newer_than:60d'), 0, 15);
  if (!threads.length) console.log('Nenhum e-mail da escola nesta conta nos últimos 60 dias. Confira se ela recebe os avisos (ver LEIAME).');
  threads.forEach(th => {
    const m = th.getMessages().pop();
    const ev = extrair(m.getSubject(), m.getPlainBody(), aliases);
    console.log(`${m.getFrom()} | ${m.getSubject()} | tipo=${ev.tipo} ${ev.descricao} filha=${ev.filha} disciplina=${ev.disciplina} data=${ev.data} nota=${ev.pct}`);
  });
}

// Testa a extração com exemplos. Rode e confira o registro de execução.
function testarExtracao() {
  const aliases = { 'Leticia': 'F12', 'Ana': 'F14' };
  [
    ['FREQUÊNCIA EXTRA', 'Prezado responsável,\nFoi registrada a seguinte ocorrência: MONITORIA para o(a) aluno(a) 00000/24 LETÍCIA EXEMPLO na data 20/10/2026.\nDisciplina: LÍNGUA PORTUGUESA\nObservação: O (a) aluno (a) participou do Resolve de Texto.'],
    ['OCORRÊNCIA', 'Foi registrada a seguinte ocorrência: FALTA DE MATERIAL para o(a) aluno(a) 00000/24 ANA EXEMPLO na data 21/10/2026.\nDisciplina: MATEMÁTICA'],
    ['Nova nota publicada', 'Ana obteve nota 9,5 na avaliação de Matemática.'],
    ['Nova mensagem', 'Você recebeu uma nova mensagem. Acesse o ClassApp para ler.']
  ].forEach(([a, c]) => console.log(a + ' → ' + JSON.stringify(extrair(a, c, aliases))));
}
