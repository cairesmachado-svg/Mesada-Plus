/* Mesada+ Família · interface.
 * Protótipo sem backend: os dados ficam no localStorage deste navegador.
 * As regras e cálculos estão em js/rules.js.
 */
(() => {
  'use strict';
  const R = window.MesadaRules;
  const STORAGE = 'mesadaplus-prototipo-v1';
  const CLASSAPP_KEY = 'mesadaplus-classapp';
  const UNLOCK_KEY = 'mesadaplus-desbloqueado';

  /* ---------- Utilidades ---------- */

  const PATHS = {
    dashboard: '<rect x="3" y="3" width="8" height="8" rx="1.5"/><rect x="13" y="3" width="8" height="8" rx="1.5"/><rect x="3" y="13" width="8" height="8" rx="1.5"/><rect x="13" y="13" width="8" height="8" rx="1.5"/>',
    school: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
    routine: '<path d="M8 2v4M16 2v4M3 10h18"/><rect x="3" y="4" width="18" height="18" rx="2"/><path d="m8 16 2 2 5-5"/>',
    wallet: '<rect width="20" height="16" x="2" y="5" rx="2"/><path d="M2 10h20M16 15h2"/><path d="M7 2h12"/>',
    rules: '<path d="M9 12h6M9 16h6M7 3h10a2 2 0 0 1 2 2v16H5V5a2 2 0 0 1 2-2Z"/><path d="M9 7h6"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    arrow: '<path d="m9 18 6-6-6-6"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    alert: '<path d="M10.3 3.7 2 18.1a2 2 0 0 0 1.7 3h16.6a2 2 0 0 0 1.7-3L13.7 3.7a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4M12 17h.01"/>',
    stars: '<path d="m12 3 2.8 6 6.2.8-4.5 4.5 1.2 6.4-5.7-3.1-5.7 3.1 1.2-6.4L3 9.8 9.2 9Z"/>',
    coin: '<circle cx="12" cy="12" r="9"/><path d="M12 6v12M15 9.5c0-2-6-2-6 0s6 2 6 4.5-6 2.5-6 0"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    home: '<path d="m3 11 9-8 9 8"/><path d="M5 10v11h14V10M9 21v-7h6v7"/>',
    book: '<path d="M12 7v14m0-14C9 5 5 4 2 5v15c3-1 7 0 10 2 3-2 7-3 10-2V5c-3-1-7 0-10 2Z"/>',
    spark: '<path d="m12 3 1.7 6.3L20 11l-6.3 1.7L12 19l-1.7-6.3L4 11l6.3-1.7L12 3Z"/><path d="m20 19-1.5 1.5M4 3 2.5 4.5"/>',
    edit: '<path d="m16 5 3 3M4 20l4-.7L20 7a2 2 0 0 0-3-3L4.7 16Z"/>',
    calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M8 2v4M16 2v4M3 10h18"/>',
    pig: '<path d="M18 8c2-1 3-2 4-2v6c0 1-1 2-2 2-.4 2.2-1.9 4-4 4H8c-2 0-5-2-5-6s3-7 8-7h5l2 3Z"/><path d="M7 18v3M17 18v3M7 8h.01M11 8h4"/>',
    trash: '<path d="M3 6h18M8 6V4h8v2M6 6l1 15h10l1-15M10 10v7M14 10v7"/>',
    lock: '<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/>',
    flame: '<path d="M12 22c4 0 7-3 7-7 0-4-3-6-4-9-1 2-2 3-3 3 0-2 0-4-2-6-1 4-5 7-5 12 0 4 3 7 7 7Z"/>',
    heart: '<path d="M12 21s-8-5-8-11a4.5 4.5 0 0 1 8-3 4.5 4.5 0 0 1 8 3c0 6-8 11-8 11Z"/>',
    bag: '<path d="M5 8h14l-1 13H6L5 8Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
    download: '<path d="M12 3v12m0 0 4-4m-4 4-4-4M4 19h16"/>',
    upload: '<path d="M12 21V9m0 0 4 4m-4-4-4 4M4 5h16"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
    key: '<circle cx="8" cy="15" r="4"/><path d="m11 12 9-9m-3 3 3 3"/>',
    trophy: '<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4Z"/><path d="M7 6H4v2a3 3 0 0 0 3 3M17 6h3v2a3 3 0 0 1-3 3"/>'
  };
  const icon = (k, size = 18) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${PATHS[k] || PATHS.spark}</svg>`;
  const money = n => (Number(n || 0) / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const pts = n => `${n} pt${Math.abs(n) === 1 ? '' : 's'}`;
  const fmtD = d => new Date(`${d}T12:00:00`).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', '');
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const number = (v, min, max) => Math.max(min, Math.min(max, Math.round(Number(v) || 0)));
  const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
  const period = () => today().slice(0, 7);
  const uid = () => 'id_' + (globalThis.crypto?.randomUUID?.() || `${Date.now()}_${Math.random().toString(36).slice(2)}`);
  const monthLabel = m => new Date(`${m}-15T12:00:00`).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  const shiftMonth = (m, n) => { const d = new Date(Number(m.slice(0, 4)), Number(m.slice(5, 7)) - 1 + n, 15); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`; };
  const norm = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase();
  const cents = x => Math.round(Number(String(x).replace(',', '.')) * 100);
  const pick = (arr, seed) => arr[Math.abs(seed) % arr.length];

  const store = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); return true; } catch { return false; } }
  };
  let memUnlocked = false;
  const session = {
    get() { try { return sessionStorage.getItem(UNLOCK_KEY) === '1'; } catch { return memUnlocked; } },
    set(v) { memUnlocked = v; try { v ? sessionStorage.setItem(UNLOCK_KEY, '1') : sessionStorage.removeItem(UNLOCK_KEY); } catch { /* sem sessionStorage */ } }
  };

  /* ---------- Estado ---------- */

  function load() {
    let raw = null;
    try { raw = JSON.parse(store.get(STORAGE)); } catch { raw = null; }
    return R.migrate(raw) || R.migrate(R.seed(today()));
  }
  let state = load();
  if (!state.seenLevel || typeof state.seenLevel !== 'object') state.seenLevel = {};
  let modalHTML = '', activeMonth = period(), activeWeek = R.cycleOf(today()), schoolFilter = 'all', toastTimer;

  const save = () => { if (!store.set(STORAGE, JSON.stringify(state))) notify('Não foi possível salvar neste navegador.'); };
  const getChild = id => state.children.find(c => c.id === id) || state.children[0];
  const currentChild = () => getChild(state.selected);
  const unlocked = () => !state.config.pin || session.get();
  const isParent = () => state.role === 'parent' && unlocked();
  const isLocked = () => state.role === 'parent' && !unlocked();
  const viewerId = () => (state.role.startsWith('child:') ? state.role.slice(6) : null);
  const viewChildren = () => (isParent() ? state.children : [getChild(viewerId())].filter(Boolean));
  const isOwn = cid => viewerId() === cid;
  const can = {
    checkin: cid => isParent() || (isOwn(cid) && getChild(cid).age >= 11),
    submitGrade: cid => isParent() || (isOwn(cid) && getChild(cid).age >= 11),
    createGoal: cid => isParent() || isOwn(cid),
    move: cid => isParent() || isOwn(cid)
  };
  const monthClosed = (cid, m = activeMonth) => state.closures.some(x => x.childId === cid && x.month === m);
  const fin = (cid, m = activeMonth) => R.finances(state, cid, m);
  const level = c => R.levelInfo(R.xp(state, c.id), c.age);
  const mascot = lv => (lv.band === 'kid' ? lv.name.split(' ')[0] : lv.band === 'mid' ? '🧭' : '📈');
  const levelText = lv => (lv.band === 'kid' ? lv.name.replace(/^\S+\s/, '') : lv.name);
  const unlockedBadges = cid => { const got = R.badges(state, cid, today()); for (const id of state.seenBadges[cid] || []) got.add(id); return got; };
  const pendingCount = () => state.grades.filter(g => g.status === 'pending').length + state.occurrences.filter(o => o.status === 'pending').length;

  // Na primeira abertura, registra conquistas e níveis já existentes sem festa.
  (function prime() {
    let changed = false;
    for (const c of state.children) {
      if (!Array.isArray(state.seenBadges[c.id])) { state.seenBadges[c.id] = [...R.badges(state, c.id, today())]; changed = true; }
      if (!Number.isInteger(state.seenLevel[c.id])) { state.seenLevel[c.id] = level(c).level; changed = true; }
    }
    if (changed) save();
  })();

  function checkProgress(afterMessage = false) {
    const news = [];
    for (const c of state.children) {
      const seen = new Set(state.seenBadges[c.id] || []);
      for (const id of R.badges(state, c.id, today())) if (!seen.has(id)) { seen.add(id); news.push(`${R.BADGES.find(b => b.id === id).icon} ${c.name} desbloqueou "${R.BADGES.find(b => b.id === id).name}"`); }
      state.seenBadges[c.id] = [...seen];
      const lv = level(c);
      if (lv.level > (state.seenLevel[c.id] || 1)) news.unshift(`🎉 ${c.name} subiu para o nível ${lv.level}: ${levelText(lv)}!`);
      state.seenLevel[c.id] = Math.max(lv.level, state.seenLevel[c.id] || 1);
    }
    if (news.length) {
      save();
      const msg = news[0] + (news.length > 1 ? ` (+${news.length - 1})` : '');
      // Deixa a mensagem da ação aparecer antes da comemoração.
      setTimeout(() => celebrate(msg), afterMessage ? 1900 : 0);
    }
  }
  function commit(message) { save(); render(); if (message) notify(message); checkProgress(Boolean(message)); }

  /* ---------- Feedback ---------- */

  function notify(message) {
    const t = document.querySelector('#toast'); if (!t) return;
    t.textContent = message; t.classList.add('show'); clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 3800);
  }
  function confetti() {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    const box = document.createElement('div'); box.className = 'confetti'; box.setAttribute('aria-hidden', 'true');
    const colors = ['#695ce6', '#159773', '#f4bf68', '#e56e64', '#1c80ba', '#ff9fd0'];
    for (let i = 0; i < 46; i++) {
      const s = document.createElement('i');
      s.style.left = `${Math.random() * 100}%`; s.style.background = colors[i % colors.length];
      s.style.animationDelay = `${Math.random() * 0.5}s`; s.style.animationDuration = `${1.6 + Math.random() * 1.3}s`;
      box.appendChild(s);
    }
    document.body.appendChild(box); setTimeout(() => box.remove(), 3500);
  }
  function celebrate(message) { notify(message); confetti(); }

  /* ---------- Estrutura ---------- */

  const NAV = [['dashboard', 'Visão geral', 'Início'], ['school', 'Escola', 'Escola'], ['routine', 'Rotina e bônus', 'Rotina'], ['wallet', 'Cofrinhos', 'Cofres'], ['rules', 'Regras da casa', 'Regras']];
  const navCount = k => (k === 'school' && isParent() && pendingCount() ? `<span class="nav-count">${pendingCount()}</span>` : '');
  const navItem = ([k, label]) => `<button class="nav-btn ${state.view === k ? 'active' : ''}" data-act="nav" data-view="${k}">${icon(k)}<span>${label}</span>${navCount(k)}</button>`;
  const header = (eyebrow, title, description, action = '') => `<div class="page-heading"><div><div class="eyebrow">${eyebrow}</div><h1>${title}</h1><p>${description}</p></div>${action || periodChip()}</div>`;
  const periodChip = () => `<div class="period"><button data-act="month" data-dir="-1" aria-label="Mês anterior">‹</button>${icon('calendar')} ${esc(monthLabel(activeMonth))}<button data-act="month" data-dir="1" aria-label="Próximo mês" ${activeMonth >= period() ? 'disabled' : ''}>›</button></div>`;
  const sec = (title, desc, action = '') => `<div class="section-row"><div><h2 class="section-title">${title}</h2>${desc ? `<div class="section-hint">${desc}</div>` : ''}</div>${action}</div>`;
  const childPicker = () => `<div class="select-row">${viewChildren().map(c => `<button class="chip ${state.selected === c.id ? 'active' : ''}" data-act="child" data-child="${c.id}">${esc(c.name)}</button>`).join('')}</div>`;

  function render() {
    if (!isParent() && viewerId()) state.selected = viewerId();
    let content;
    if (isLocked()) content = renderLock();
    else if (state.view === 'school') content = renderSchool();
    else if (state.view === 'routine') content = renderRoutine();
    else if (state.view === 'wallet') content = renderWallet();
    else if (state.view === 'rules') content = renderRules();
    else content = renderDashboard();
    const parent = isParent();
    document.getElementById('app').innerHTML = `<div class="shell"><aside class="sidebar"><div class="brand"><span class="brand-mark">✳</span><div><div class="brand-name">mesada<span style="color:#b2a9ff">+</span></div><span class="brand-kicker">FAMÍLIA</span></div></div><div class="nav-group-label">SEU ESPAÇO</div><nav aria-label="Seções">${NAV.slice(0, 4).map(navItem).join('')}<div class="nav-gap"></div><div class="nav-group-label">CONFIGURAÇÕES</div>${navItem(NAV[4])}</nav><div class="side-bottom"><div class="side-tip"><strong>🌱 Esforço vale mais.</strong>Hábitos pesam mais que notas. Juntas, nunca umas contra as outras.</div><div class="demo-tag"><span class="demo-dot"></span> PROTÓTIPO LOCAL · DADOS NESTE NAVEGADOR</div></div></aside>
    <main class="content"><div class="topline"><div class="breadcrumbs">Início / <b>${esc(NAV.find(x => x[0] === state.view)?.[1])}</b></div><div class="top-actions"><label class="small-label" for="role">Visualizar como</label><select id="role" class="mode-select" aria-label="Visualizar como"><option value="parent" ${state.role === 'parent' ? 'selected' : ''}>👨‍👩‍👧 Responsável</option>${state.children.map(c => `<option value="child:${c.id}" ${state.role === `child:${c.id}` ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}</select>${parent && state.config.pin ? `<button class="btn secondary small" data-act="lock" aria-label="Bloquear área do responsável">${icon('lock')}</button>` : ''}</div></div>${content}<div class="footer">Mesada+ Família · Protótipo · Dados guardados apenas neste navegador</div></main></div><nav class="mobile-nav" aria-label="Navegação móvel">${NAV.map(([k, , short]) => `<button class="${state.view === k ? 'active' : ''}" data-act="nav" data-view="${k}">${icon(k)}<span>${short}</span>${navCount(k)}</button>`).join('')}</nav>${modalHTML}`;
  }

  function renderLock() {
    return `<div class="lock-screen"><div class="card lock-card"><div class="lock-emoji">🔐</div><h1>Área do responsável</h1><p>Digite o PIN para aprovar lançamentos e mudar regras.</p><form id="form-unlock"><div class="form-field"><label for="fm-pin">PIN</label><input id="fm-pin" name="pin" type="password" inputmode="numeric" autocomplete="off" maxlength="8" required /></div><button class="btn block" type="submit">${icon('key')} Entrar</button></form><hr class="divider" /><div class="small-label">OU ENTRE COMO</div><div class="select-row" style="justify-content:center;margin-top:10px">${state.children.map(c => `<button class="chip" data-act="enter-child" data-child="${c.id}">${esc(c.name)}</button>`).join('')}</div></div></div>`;
  }

  /* ---------- Visão geral ---------- */

  function childCard(c) {
    const f = fin(c.id), lv = level(c), st = R.streak(state, c.id, today());
    const cap = f.capHabits + f.capSchool, progress = Math.round((f.bonusCents / Math.max(1, cap)) * 100);
    return `<article class="card child-card" data-act="child" data-child="${c.id}" tabindex="0" role="button" aria-label="Ver dados de ${esc(c.name)}"><div class="${c.id === state.selected ? 'selected-mark' : 'hidden'}">SELECIONADA</div><div class="child-head"><div class="avatar" style="background:${c.bg};color:${c.color}">${lv.band === 'kid' ? mascot(lv) : esc(c.name.slice(0, 1).toUpperCase())}</div><div><div class="child-name">${esc(c.name)}</div><div class="child-age">${c.age} anos · Nível ${lv.level} · ${esc(levelText(lv))}</div></div></div><div class="child-finance"><div><span class="small-label">PREVISÃO DO MÊS</span><div class="child-big">${money(f.total)}</div></div><div style="text-align:right"><span class="small-label">COFRINHOS</span><b class="good" style="font-size:13px">${money(R.jarSave(state, c.id) + R.jarGive(state, c.id))}</b></div></div><div class="bar" title="Bônus do mês em relação ao teto"><span style="width:${number(progress, 0, 100)}%;background:${c.color}"></span></div><div class="child-foot"><span>Bônus <b class="good">+${money(f.bonusCents)}</b> de ${money(cap)}</span><span><span class="streak-chip ${st ? 'on' : ''}" title="Dias seguidos com hábitos">🔥 ${st}</span> 🏅 <b>${unlockedBadges(c.id).size}</b>/${R.BADGES.length}</span></div><div class="xp-line"><span>XP</span><div class="xp-bar"><span style="width:${lv.progress}%"></span></div><span>${lv.next ? `faltam ${lv.toNext}` : 'máximo'}</span></div></article>`;
  }

  function familyCard() {
    const fp = R.familyProgress(state, activeMonth), g = state.config.familyGoal;
    let room = 100;
    const segs = fp.byChild.map(x => { const c = getChild(x.childId), w = Math.min(room, (x.count / fp.target) * 100); room -= w; return `<span style="width:${w}%;background:${c.color}"></span>`; }).join('');
    return `<div class="card">${sec(`${esc(g.emoji)} Meta da família`, 'Dias de estudo ou leitura de todas, somados. Juntas, sem ranking.')}<div class="family-name">${esc(g.name)}</div><div class="seg-bar" role="img" aria-label="${fp.total} de ${fp.target} dias de estudo">${segs}</div><div class="child-foot"><span><b>${fp.total}</b> de ${fp.target} dias de estudo no mês</span><span>${fp.done ? '<b class="good">🎉 Meta batida!</b>' : `faltam <b>${fp.target - fp.total}</b>`}</span></div><div class="legend">${state.children.map(c => `<span><i style="background:${c.color}"></i>${esc(c.name)}</span>`).join('')}</div></div>`;
  }

  function badgesGrid(cid) {
    const got = unlockedBadges(cid);
    return `<div class="badges">${R.BADGES.map(b => `<div class="badge ${got.has(b.id) ? 'on' : ''}"><span class="badge-ico" aria-hidden="true">${b.icon}</span><b>${esc(b.name)}</b><small>${esc(b.desc)}</small>${got.has(b.id) ? '' : '<span class="sr-only">(bloqueada)</span>'}</div>`).join('')}</div>`;
  }

  function pendingList(limit = 6) {
    const rows = [
      ...state.grades.filter(g => g.status === 'pending').map(g => ({ date: g.date, html: gradeLine(g) })),
      ...state.occurrences.filter(o => o.status === 'pending').map(o => ({ date: o.date, html: occLine(o) }))
    ].sort((a, b) => b.date.localeCompare(a.date)).slice(0, limit);
    return rows.length ? `<div class="list">${rows.map(r => r.html).join('')}</div>` : `<div class="empty"><div class="empty-icon">✅</div>Nada esperando revisão.</div>`;
  }

  function renderDashboard() {
    if (!isParent()) return renderChildHome(viewChildren()[0]);
    const fins = state.children.map(c => fin(c.id)), sum = k => fins.reduce((a, f) => a + (f[k] || 0), 0);
    return `${header('PAINEL FAMILIAR', 'Uma mesada com propósito ✨', 'A base é garantida. Hábitos e escola rendem bônus. Ocorrências começam com conversa e nunca tocam na base.')}
    <div class="grid two sm-stack"><div class="card hero"><div class="welcome"><div><div class="hero-upper">TOTAL PREVISTO PARA A FAMÍLIA</div><div class="hero-number">${money(sum('total'))}</div><div class="hero-caption">${esc(monthLabel(activeMonth))} · valor final no fechamento</div></div><div class="welcome-illustration" aria-hidden="true">🪙</div></div><div class="hero-line"><div><b>${money(sum('base'))}</b><span>Mesadas-base</span></div><div><b>+ ${money(sum('habitsCents') + sum('schoolCents'))}</b><span>Bônus conquistado</span></div><div><b>− ${money(Math.min(sum('penaltyCents'), sum('habitsCents') + sum('schoolCents')))}</b><span>Ajustes no bônus</span></div></div></div>
    <div class="grid two metrics-mobile"><div class="card metric"><div class="metric-head">HÁBITOS <span class="metric-icon bg-purple purple">${icon('routine')}</span></div><div class="metric-number purple">+ ${money(sum('habitsCents'))}</div><div class="metric-sub">Estudo, organização e casa</div></div><div class="card metric"><div class="metric-head">ESCOLA <span class="metric-icon bg-good good">${icon('stars')}</span></div><div class="metric-number good">+ ${money(sum('schoolCents'))}</div><div class="metric-sub">Notas acima de 90% e elogios</div></div><div class="card metric"><div class="metric-head">COFRINHOS <span class="metric-icon bg-gold gold">${icon('pig')}</span></div><div class="metric-number">${money(state.children.reduce((a, c) => a + R.jarSave(state, c.id) + R.jarGive(state, c.id), 0))}</div><div class="metric-sub">Poupar e doar</div></div><div class="card metric" data-act="nav" data-view="school" role="button" tabindex="0" style="cursor:pointer"><div class="metric-head">PARA REVISAR <span class="metric-icon bg-bad bad">${icon('clock')}</span></div><div class="metric-number">${pendingCount()}</div><div class="metric-sub">Notas e ocorrências pendentes</div></div></div></div>
    ${sec('As meninas', 'Toque num cartão para selecionar. Cada uma tem saldo, nível e metas próprios.', `<button class="link-btn" data-act="modal-child">${icon('plus', 14)} Adicionar perfil</button>`)}
    <div class="grid ${state.children.length >= 3 ? 'three' : 'two'}">${state.children.map(childCard).join('')}</div>
    <div class="grid two sm-stack" style="margin-top:24px">${familyCard()}<div class="card">${sec('Para revisar', 'Nada vira ponto sem a sua aprovação.', `<button class="link-btn" data-act="nav" data-view="school">Escola ${icon('arrow', 14)}</button>`)}${pendingList()}</div></div>
    ${sec(`Conquistas de ${esc(currentChild().name)}`, 'Selecione outra filha nos cartões acima.')}${badgesGrid(currentChild().id)}
    <div class="alert-strip" style="margin-top:23px">${icon('shield')}<div><b>Ambiente demonstrativo.</b> Os saldos são virtuais e nenhum dinheiro é movimentado. Sem login real: o PIN só evita toques acidentais neste aparelho.</div></div>`;
  }

  const TIPS = {
    kid: ['Guardar um pouquinho de cada mesada faz o cofrinho crescer sozinho.', 'Antes de comprar, espere um dia. Se ainda quiser, é desejo de verdade.', 'Doar também é uma escolha com o seu dinheiro.'],
    mid: ['Compare preços em dois lugares antes de comprar.', 'Uma meta com foto e valor fica mais fácil de alcançar.', 'O pai paga juros no cofrinho de meta. Quanto antes guardar, mais rende.'],
    teen: ['Juros compostos: o rendimento de hoje também rende amanhã.', 'Orçamento é decidir antes de gastar, não explicar depois.', 'Metas de longo prazo pedem depósitos pequenos e constantes.']
  };

  function renderChildHome(c) {
    if (!c) return '';
    const f = fin(c.id), lv = level(c), st = R.streak(state, c.id, today()), goals = state.goals.filter(g => g.childId === c.id && !g.done).slice(0, 3);
    return `${header('MEU ESPAÇO', `Oi, ${esc(c.name)}! ${lv.band === 'kid' ? '🌈' : '✨'}`, 'Suas conquistas, seus hábitos e seus planos de poupança.')}
    <div class="grid two sm-stack"><div class="card hero level-hero"><div class="welcome"><div><div class="hero-upper">NÍVEL ${lv.level}</div><div class="hero-number">${esc(levelText(lv))}</div><div class="hero-caption">${lv.next ? `Faltam ${lv.toNext} XP para o nível ${lv.level + 1}` : 'Nível máximo alcançado!'}</div></div><div class="welcome-illustration" aria-hidden="true">${mascot(lv)}</div></div><div class="xp-bar light"><span style="width:${lv.progress}%"></span></div><div class="hero-line"><div><b>🔥 ${st} ${st === 1 ? 'dia' : 'dias'}</b><span>Sequência</span></div><div><b>${lv.xp} XP</b><span>Esforço acumulado</span></div><div><b>🏅 ${unlockedBadges(c.id).size}/${R.BADGES.length}</b><span>Conquistas</span></div></div></div>
    <div class="grid two metrics-mobile"><div class="card metric"><div class="metric-head">MESADA DO MÊS <span class="metric-icon bg-purple purple">${icon('coin')}</span></div><div class="metric-number">${money(f.total)}</div><div class="metric-sub">Base ${money(f.base)} garantida</div></div><div class="card metric"><div class="metric-head">BÔNUS <span class="metric-icon bg-good good">${icon('stars')}</span></div><div class="metric-number good">+ ${money(f.bonusCents)}</div><div class="metric-sub">Hábitos ${money(f.habitsCents)} · Escola ${money(f.schoolCents)}</div></div><div class="card metric"><div class="metric-head">PARA GASTAR <span class="metric-icon bg-gold gold">${icon('bag')}</span></div><div class="metric-number">${money(R.jarSpend(state, c.id))}</div><div class="metric-sub">Saldo livre</div></div><div class="card metric"><div class="metric-head">GUARDADO <span class="metric-icon bg-good good">${icon('pig')}</span></div><div class="metric-number">${money(R.jarSave(state, c.id))}</div><div class="metric-sub">Nas suas metas</div></div></div></div>
    ${sec('Minhas metas', 'Escolha um sonho e acompanhe a barra encher.', `<button class="link-btn" data-act="nav" data-view="wallet">Cofrinhos ${icon('arrow', 14)}</button>`)}
    <div class="grid ${goals.length > 1 ? 'two' : ''}">${goals.map(goalCard).join('') || `<div class="card empty"><div class="empty-icon">🎯</div>Crie sua primeira meta em Cofrinhos.</div>`}</div>
    ${sec('Minhas conquistas', 'Cada medalha marca um passo. Elas não somem.')}${badgesGrid(c.id)}
    <div class="grid two sm-stack" style="margin-top:24px">${familyCard()}<div class="card"><div class="tip-card"><span style="font-size:30px" aria-hidden="true">💡</span><div><h2 class="section-title" style="margin-bottom:6px">Dica do dia</h2><div class="list-meta" style="font-size:13px">${esc(pick(TIPS[lv.band], Number(today().slice(8))))}</div></div></div></div></div>`;
  }

  /* ---------- Escola ---------- */

  function gradeLine(g) {
    const c = getChild(g.childId), m = R.schoolMonth(state, g.childId, g.date.slice(0, 7)), info = m.perGrade[g.id];
    const effect = g.status === 'confirmed' ? (info && info.pts + info.improve ? `+${pts(info.pts + info.improve)}` : 'sem bônus') : `+${pts(R.gradePoints(g.pct))}`;
    return `<div class="list-row"><div class="event-ico bg-purple purple">${icon('book')}</div><div class="list-main"><div class="list-name">${esc(g.subject)} · ${esc(g.raw)} <span class="muted">(${g.pct}%)</span></div><div class="list-meta">${esc(c.name)} · ${fmtD(g.date)}${g.source === 'classapp' ? ' · e-mail da escola' : ''}${info && info.improve ? ' · 📈 melhora' : ''}</div></div><div style="text-align:right"><div class="list-price ${g.status === 'confirmed' ? 'good' : 'gold'}">${effect}</div>${gradeActions(g)}</div></div>`;
  }
  function gradeActions(g) {
    if (!isParent()) return `<span class="pill ${g.status === 'pending' ? 'pending' : 'justified'}">${g.status === 'pending' ? 'Aguardando' : 'Confirmada'}</span>`;
    if (monthClosed(g.childId, g.date.slice(0, 7))) return '<span class="pill justified">Fechado</span>';
    if (g.status === 'pending') return `<div class="btns" style="justify-content:flex-end;margin-top:4px"><button class="btn positive small" data-act="grade-approve" data-id="${g.id}">Aprovar</button><button class="btn secondary small" data-act="grade-delete" data-id="${g.id}">Recusar</button></div>`;
    return `<button class="btn secondary small" style="margin-top:4px" data-act="grade-delete" data-id="${g.id}" aria-label="Excluir nota">${icon('trash', 13)}</button>`;
  }
  function occEffect(o) {
    const m = R.schoolMonth(state, o.childId, o.date.slice(0, 7));
    if (o.status === 'justified') return { text: 'Abonada', cls: 'muted' };
    if (o.status === 'pending') return { text: 'Em análise', cls: 'gold' };
    if (o.polarity === 'pos') { const p = m.perPos[o.id] || 0; return { text: p ? `+${pts(p)}` : 'Acima do limite', cls: 'good' }; }
    const p = m.perNeg[o.id] || 0;
    return { text: p ? `−${pts(p)} no bônus` : 'Conversa', cls: p ? 'bad' : 'purple' };
  }
  function occTitle(o) { return o.polarity === 'pos' ? R.findPos(o.kind).title : R.findKind(o.kind).title; }
  function occLine(o) {
    const c = getChild(o.childId), e = occEffect(o), pos = o.polarity === 'pos';
    return `<div class="list-row"><div class="event-ico ${pos ? 'bg-good good' : 'bg-gold gold'}">${icon(pos ? 'stars' : 'school')}</div><div class="list-main"><div class="list-name">${esc(occTitle(o))}</div><div class="list-meta">${esc(c.name)} · ${fmtD(o.date)}${o.detail ? ` · ${esc(o.detail)}` : ''}</div></div><div style="text-align:right"><div class="list-price ${e.cls}">${e.text}</div>${occActions(o)}</div></div>`;
  }
  function occActions(o) {
    const pill = `<span class="pill ${o.status === 'pending' ? 'pending' : o.status === 'confirmed' ? (o.polarity === 'pos' ? 'justified' : 'confirmed') : 'restored'}">${o.status === 'pending' ? 'Aguardando' : o.status === 'confirmed' ? (o.recovered ? 'Recuperada' : 'Confirmada') : 'Abonada'}</span>`;
    if (!isParent()) return pill;
    if (monthClosed(o.childId, o.date.slice(0, 7))) return '<span class="pill justified">Fechado</span>';
    const b = [];
    if (o.status === 'pending') {
      b.push(o.kind === 'classificar' ? `<button class="btn positive small" data-act="modal-classify" data-id="${o.id}">Classificar</button>` : `<button class="btn positive small" data-act="approve" data-id="${o.id}">Aprovar</button>`);
      b.push(`<button class="btn secondary small" data-act="excuse" data-id="${o.id}">Abonar</button>`);
    } else if (o.status === 'confirmed') {
      if (o.polarity !== 'pos' && !o.recovered && R.findKind(o.kind).level <= 3 && (R.schoolMonth(state, o.childId, o.date.slice(0, 7)).perNeg[o.id] || 0) > 0) b.push(`<button class="btn soft small" data-act="recover" data-id="${o.id}">Recuperar 50%</button>`);
      b.push(`<button class="btn secondary small" data-act="excuse" data-id="${o.id}">Abonar</button>`);
    } else b.push(`<button class="btn secondary small" data-act="review" data-id="${o.id}">Revisar</button>`);
    return `<div class="btns" style="justify-content:flex-end;margin-top:4px">${b.join('')}</div>`;
  }

  function renderSchool() {
    const parent = isParent(), kids = viewChildren();
    if (!parent) schoolFilter = viewerId();
    const target = schoolFilter === 'all' ? kids : kids.filter(c => c.id === schoolFilter);
    const ids = new Set(target.map(c => c.id));
    const ms = target.map(c => R.schoolMonth(state, c.id, activeMonth)), fs = target.map(c => fin(c.id));
    const s = k => ms.reduce((a, m) => a + m[k], 0);
    const grades = state.grades.filter(g => ids.has(g.childId) && R.inMonth(g.date, activeMonth)).sort((a, b) => b.date.localeCompare(a.date));
    const occ = state.occurrences.filter(o => ids.has(o.childId) && R.inMonth(o.date, activeMonth)).sort((a, b) => b.date.localeCompare(a.date));
    const own = viewerId(), childCanGrade = own && can.submitGrade(own);
    const actions = parent ? `<div class="btns"><button class="btn" data-act="modal-grade">${icon('plus')} Lançar nota</button><button class="btn secondary" data-act="modal-occurrence">${icon('plus')} Ocorrência</button></div>` : childCanGrade ? `<button class="btn" data-act="modal-grade">${icon('plus')} Lançar nota</button>` : '';
    return `${header('VIDA ESCOLAR', 'Escola que rende 📚', 'Notas acima de 90%, melhoras e elogios viram bônus. A primeira ocorrência do mês vira conversa.', actions || '<span></span>')}
    ${parent ? `<div class="select-row"><button class="chip ${schoolFilter === 'all' ? 'active' : ''}" data-act="school-filter" data-child="all">Todas</button>${kids.map(c => `<button class="chip ${schoolFilter === c.id ? 'active' : ''}" data-act="school-filter" data-child="${c.id}">${esc(c.name)}</button>`).join('')}${periodChip()}</div>` : periodChip()}
    <div class="grid four metrics-mobile" style="margin-top:18px">${[
      ['BÔNUS ESCOLAR', `+ ${money(fs.reduce((a, f) => a + f.schoolCents, 0))}`, `teto ${money(fs.reduce((a, f) => a + f.capSchool, 0))}`, 'stars', 'good'],
      ['NOTAS ACIMA DE 90%', s('above90'), `${s('gradeCount')} nota(s) no mês`, 'book', 'purple'],
      ['ELOGIOS', s('posCount'), `até ${R.POSITIVE.maxMonth} por mês valem pontos`, 'heart', 'good'],
      ['A ORIENTAR', s('negCount'), `ajuste no bônus: ${pts(s('penaltyPts'))}`, 'school', 'gold']
    ].map(([l, n, sub, i, cls]) => `<div class="card metric"><div class="metric-head">${l} <span class="metric-icon bg-${cls} ${cls}">${icon(i)}</span></div><div class="metric-number ${cls}">${n}</div><div class="metric-sub">${sub}</div></div>`).join('')}</div>
    ${sec('Notas do mês', `${grades.length} registro(s)${childCanGrade ? ' · as notas que você lançar aguardam conferência' : ''}`)}
    <div class="card">${grades.length ? `<div class="list">${grades.map(gradeLine).join('')}</div>` : `<div class="empty"><div class="empty-icon">📝</div>Nenhuma nota lançada neste mês.</div>`}</div>
    ${sec('Ocorrências do mês', `${occ.length} registro(s)`)}
    <div class="card">${occ.length ? `<div class="list">${occ.map(occLine).join('')}</div>` : `<div class="empty"><div class="empty-icon">🌟</div>Nenhuma ocorrência neste mês.</div>`}</div>
    ${parent ? classAppCard() : ''}
    ${sec('Tabela do bônus escolar', 'Pontos pequenos e frequentes funcionam melhor que prêmios grandes e raros.')}
    <div class="grid two">
      <div class="card tight"><div class="small-label">NOTAS</div><div class="list">${R.GRADE_TIERS.map(t => `<div class="list-row"><div class="list-main"><div class="list-name">${t.label}</div></div><b class="good">+${pts(t.pts)}</b></div>`).join('')}<div class="list-row"><div class="list-main"><div class="list-name">Melhora de ${R.IMPROVE.delta} pontos na mesma disciplina</div><div class="list-meta">Até ${R.IMPROVE.maxMonth} por mês. Mantém no jogo quem ainda não passa de 90%.</div></div><b class="good">+${pts(R.IMPROVE.pts)}</b></div></div></div>
      <div class="card tight"><div class="small-label">OCORRÊNCIAS</div><div class="list"><div class="list-row"><div class="list-main"><div class="list-name">Ocorrência positiva</div><div class="list-meta">${R.POS_KINDS.map(k => k.title).join(', ')}. Até ${R.POSITIVE.maxMonth} por mês.</div></div><b class="good">+${pts(R.POSITIVE.pts)}</b></div><div class="list-row"><div class="list-main"><div class="list-name">Primeira negativa do mês</div><div class="list-meta">Conversa e combinado. Sem desconto.</div></div><b class="purple">0</b></div><div class="list-row"><div class="list-main"><div class="list-name">Da segunda em diante</div><div class="list-meta">Nível × ${R.NEGATIVE.ptsPerLevel} pts, só do bônus. Níveis 1 a 3 podem recuperar 50%.</div></div><b class="bad">−5 a −30</b></div></div></div>
    </div>
    <div class="grid two" style="margin-top:17px">${R.NEG_KINDS.map(k => `<div class="card tight"><div style="display:flex;justify-content:space-between;align-items:center;gap:8px"><div><div class="small-label">NÍVEL ${k.level}</div><b style="font-size:13px">${esc(k.title)}</b></div><b class="bad" style="white-space:nowrap">−${pts(k.level * R.NEGATIVE.ptsPerLevel)}</b></div><div class="list-meta">${esc(k.summary)}</div></div>`).join('')}</div>`;
  }

  function classAppCfg() { try { return JSON.parse(store.get(CLASSAPP_KEY)) || {}; } catch { return {}; } }
  function classAppCard() {
    const cfg = classAppCfg(), ready = cfg.url && cfg.token;
    const missing = state.children.filter(c => !c.alias).map(c => c.name);
    return `${sec('E-mails da escola', 'Avisos do Galois e do ClassApp lidos do Gmail por um Google Apps Script. Só entram os que você aprovou na planilha.')}
    <div class="card"><div class="grid two sm-stack"><form id="form-classapp"><div class="form-field"><label for="fm-ca-url">URL do Apps Script (termina em /exec)</label><input id="fm-ca-url" name="url" type="url" placeholder="https://script.google.com/macros/s/.../exec" value="${esc(cfg.url || '')}" /></div><div class="form-field"><label for="fm-ca-token">Token</label><input id="fm-ca-token" name="token" type="password" autocomplete="off" value="${esc(cfg.token || '')}" /></div><div class="btns"><button class="btn secondary" type="submit">Salvar</button><button class="btn" type="button" data-act="classapp-import" ${ready ? '' : 'disabled'}>${icon('mail')} Importar aprovados</button></div></form>
    <div class="hint-box">A URL e o token ficam só neste navegador. Não vão para o código nem para o backup.<br><br>Cada filha precisa de um apelido igual ao da planilha (${state.children.map(c => `<strong>${esc(c.name)}: ${esc(c.alias || 'sem apelido')}</strong>`).join(', ')}).${missing.length ? ` Defina em Regras › Perfis.` : ''}<br><br>Notas e ocorrências positivas (monitoria, elogio, destaque) entram confirmadas. As demais entram para você classificar. O guia de instalação está em <strong>apps-script/LEIAME.md</strong> no repositório.</div></div></div>`;
  }

  /* ---------- Rotina ---------- */

  function renderRoutine() {
    const c = currentChild(), m = activeMonth, w = activeWeek, days = R.datesForCycle(m, w), open = !monthClosed(c.id, m);
    const mark = can.checkin(c.id), st = R.streak(state, c.id, today()), f = fin(c.id), lv = level(c);
    const tasks = state.tasks.filter(t => t.active);
    const activeDays = new Set(state.checkins.filter(i => i.childId === c.id && days.includes(i.date)).map(i => i.date));
    const monthPts = state.bonuses.filter(b => b.childId === c.id && b.month === m).reduce((a, b) => a + b.pts, 0);
    const cards = tasks.map(t => {
      const credited = state.bonuses.some(b => b.childId === c.id && b.taskId === t.id && b.week === w && b.month === m);
      const done = t.streak ? [...activeDays] : state.checkins.filter(i => i.childId === c.id && i.taskId === t.id && days.includes(i.date)).map(i => i.date);
      const qualifies = done.length >= t.target, canGrant = isParent() && open && qualifies && !credited;
      const dayBtns = days.map(d => {
        const on = done.includes(d), disabled = t.streak || !mark || !open || d > today() || credited;
        return `<button class="day-check ${on ? 'done' : ''}" title="${d.split('-').reverse().join('/')}" ${t.streak ? '' : `data-act="checkin" data-day="${d}" data-task="${t.id}"`} ${disabled ? 'disabled' : ''} aria-label="${on ? 'Desmarcar' : 'Marcar'} ${esc(t.name)} em ${d}">${on ? icon('check', 13) : Number(d.slice(-2))}</button>`;
      }).join('');
      return `<article class="card habit-card ${t.streak ? 'streak-card' : ''}"><div class="habit-head"><div class="event-ico">${icon(t.icon)}</div><div class="list-main"><div class="list-name" style="font-size:14px">${esc(t.name)}</div><div class="list-meta">${esc(R.taskHelp(t, c.age))} · meta: ${t.target} ${t.target === 1 ? 'vez' : 'dias'} no ciclo</div></div><b class="good" style="white-space:nowrap">+${pts(t.pts)}</b></div><div class="habit-progress"><b>${done.length}</b> de ${t.target} ${t.streak ? 'dias com algum hábito' : 'dias cumpridos'}</div><div class="bar" style="margin:0"><span style="width:${Math.min(100, (done.length / t.target) * 100)}%"></span></div><div class="habit-days">${dayBtns}</div>${credited ? `<div class="habit-done">${icon('check', 13)} +${pts(t.pts)} já reconhecidos neste ciclo</div>` : qualifies ? (isParent() ? `<button class="btn ${canGrant ? 'positive' : 'secondary'} block" ${canGrant ? '' : 'disabled'} data-act="grant-bonus" data-task="${t.id}">${icon('stars')} ${canGrant ? `Aprovar +${pts(t.pts)}` : 'Mês fechado'}</button>` : `<div class="habit-done">🎯 Meta cumprida! Aguardando aprovação.</div>`) : `<div class="progress-note">Faltam ${t.target - done.length} para liberar o bônus.</div>`}</article>`;
    });
    const hint = isParent() ? 'Confira os dias marcados e aprove o bônus quando a meta do ciclo for atingida. Cada bônus vale uma vez por ciclo.'
      : mark ? 'Marque os dias em que você cumpriu. O responsável confere e aprova o bônus.'
        : 'O responsável marca os dias. Aqui você acompanha seu progresso.';
    return `${header('BONS HÁBITOS', 'Rotina que rende 🌱', 'Estudo é o hábito que mais vale. Constância rende mais que um dia perfeito.')}
    ${childPicker()}
    <div class="grid three metrics-mobile" style="margin-top:18px"><div class="card metric"><div class="metric-head">SEQUÊNCIA <span class="metric-icon bg-gold gold">${icon('flame')}</span></div><div class="metric-number gold">🔥 ${st} ${st === 1 ? 'dia' : 'dias'}</div><div class="metric-sub">1 dia de folga por semana não quebra</div></div><div class="card metric"><div class="metric-head">HÁBITOS NO MÊS <span class="metric-icon bg-purple purple">${icon('routine')}</span></div><div class="metric-number purple">${money(f.habitsCents)}</div><div class="metric-sub">${pts(monthPts)} · teto ${money(f.capHabits)}</div></div><div class="card metric"><div class="metric-head">NÍVEL ${lv.level} <span class="metric-icon bg-good good">${icon('trophy')}</span></div><div class="metric-number good">${lv.xp} XP</div><div class="metric-sub">${monthPts * state.config.centsPerPoint > f.capHabits ? 'Teto atingido: o esforço segue rendendo XP' : lv.next ? `faltam ${lv.toNext} XP` : 'nível máximo'}</div></div></div>
    <div class="section-row"><div><h2 class="section-title">Semana de hábitos</h2><div class="section-hint">Quatro ciclos por mês. O quarto inclui os dias restantes.</div></div></div>
    <div class="select-row">${[0, 1, 2, 3].map(i => { const ds = R.datesForCycle(m, i); return `<button class="chip ${w === i ? 'active' : ''}" data-act="week" data-week="${i}">Ciclo ${i + 1} <small>· ${Number(ds[0].slice(-2))}–${Number(ds.at(-1).slice(-2))}</small></button>`; }).join('')}</div>
    <div class="hint-box" style="margin:17px 0">${hint}</div>
    <div class="grid two">${cards.join('')}</div>
    ${sec('Bônus reconhecidos', 'Créditos de hábitos no mês.')}
    <div class="card"><div class="list">${state.bonuses.filter(b => b.month === m && b.childId === c.id).sort((a, b) => b.date.localeCompare(a.date)).map(b => `<div class="list-row"><div class="event-ico bg-good good">${icon('stars')}</div><div class="list-main"><div class="list-name">${esc(state.tasks.find(t => t.id === b.taskId)?.name || 'Bônus')}</div><div class="list-meta">Ciclo ${b.week + 1} · ${fmtD(b.date)}</div></div><b class="good">+${pts(b.pts)}</b></div>`).join('') || '<div class="empty">Nenhum bônus aprovado neste mês.</div>'}</div></div>`;
  }

  /* ---------- Cofrinhos ---------- */

  function goalCard(g) {
    const saved = R.goalSaved(state, g.id), pct = Math.min(100, Math.round((saved / g.target) * 100)), reached = saved >= g.target;
    let actions = '';
    if (g.done) actions = `<div class="habit-done">🏆 Sonho realizado em ${fmtD(g.done)}</div>`;
    else if (can.move(g.childId)) actions = `<div class="goal-bottom"><button class="btn soft" data-act="modal-save" data-goal="${g.id}">+ Guardar</button><button class="btn secondary" data-act="modal-unsave" data-goal="${g.id}" ${saved ? '' : 'disabled'}>Resgatar</button></div>${reached ? (isParent() ? `<button class="btn positive block" data-act="redeem" data-goal="${g.id}">${icon('trophy')} Realizar o sonho</button>` : '<div class="habit-done">🎉 Meta alcançada! Peça ao responsável para realizar.</div>') : ''}`;
    return `<div class="card goal-card ${g.done ? 'done-goal' : ''}"><div class="goal-top"><span class="goal-emoji">${esc(g.emoji)}</span><span class="pill justified">${pct}% da meta</span></div><div><div class="list-name" style="font-size:15px">${esc(g.name)}</div><div class="goal-value">${money(saved)} <small>de ${money(g.target)}</small></div>${!g.done && !reached && state.config.interestPct ? `<div class="list-meta">Rende ${state.config.interestPct}% ao mês com os juros do pai.</div>` : ''}</div><div class="bar" style="margin:0"><span style="width:${pct}%"></span></div>${actions}</div>`;
  }

  function renderWallet() {
    const c = currentChild(), f = fin(c.id), parent = isParent(), mine = can.move(c.id);
    const spend = R.jarSpend(state, c.id), saveJ = R.jarSave(state, c.id), give = R.jarGive(state, c.id);
    const goals = state.goals.filter(g => g.childId === c.id), active = goals.filter(g => !g.done), done = goals.filter(g => g.done);
    const split = { ...R.DEFAULT_SPLIT, ...c.split }, closed = monthClosed(c.id);
    const preview = R.payoutSplit(state, c, f.total);
    const ledger = state.ledger.filter(l => l.childId === c.id).sort((a, b) => b.date.localeCompare(a.date) || 0).slice(0, 12);
    const LABEL = { opening: 'Entrada de saldo', payout: 'Mesada creditada', save: 'Gastar → Poupar', unsave: 'Poupar → Gastar', spend: 'Gasto', give: 'Gastar → Doar', donate: 'Doação feita', interest: 'Juros do pai', redeem: 'Sonho realizado' };
    const CREDIT = ['opening', 'payout', 'unsave', 'interest'];
    return `${header('EDUCAÇÃO FINANCEIRA', 'Meu dinheiro, minhas escolhas', 'Três cofrinhos: gastar, poupar e doar. Cada real com um destino.')}${childPicker()}
    <div class="grid three" style="margin-top:20px">
      <div class="card jar"><div class="jar-top"><span class="jar-emoji" aria-hidden="true">🛍️</span><span class="small-label">GASTAR</span></div><div class="jar-value">${money(spend)}</div><div class="list-meta">Livre para usar. Pense antes de comprar.</div><div class="jar-actions">${parent ? `<button class="btn secondary small" data-act="modal-spend">${icon('bag')} Registrar gasto</button>` : ''}${mine ? `<button class="btn soft small" data-act="modal-give" ${spend > 0 ? '' : 'disabled'}>${icon('heart')} Separar para doar</button>` : ''}</div></div>
      <div class="card jar"><div class="jar-top"><span class="jar-emoji" aria-hidden="true">🐷</span><span class="small-label">POUPAR</span></div><div class="jar-value good">${money(saveJ)}</div><div class="list-meta">Guardado nas metas${state.config.interestPct ? `, rendendo ${state.config.interestPct}% ao mês` : ''}.</div><div class="jar-actions">${can.createGoal(c.id) ? `<button class="btn soft small" data-act="modal-goal">${icon('plus')} Nova meta</button>` : ''}</div></div>
      <div class="card jar"><div class="jar-top"><span class="jar-emoji" aria-hidden="true">💛</span><span class="small-label">DOAR</span></div><div class="jar-value gold">${money(give)}</div><div class="list-meta">Para uma causa escolhida por ${esc(c.name)}.</div><div class="jar-actions">${parent ? `<button class="btn secondary small" data-act="modal-donate" ${give > 0 ? '' : 'disabled'}>${icon('heart')} Registrar doação</button>` : ''}</div></div>
    </div>
    <div class="hint-box" style="margin-top:17px"><b>Quando a mesada cair:</b> ${split.save}% vai para Poupar (primeira meta aberta), ${split.give}% para Doar e o resto para Gastar. ${closed ? `<br>${esc(monthLabel(activeMonth))} já foi fechado para ${esc(c.name)}.` : `<br>Previsão de ${esc(monthLabel(activeMonth))}: ${money(f.total)} → Gastar ${money(preview.spend)} · Poupar ${money(preview.save)} · Doar ${money(preview.give)}.`}${parent ? ` <button class="btn soft small" style="margin-left:6px" data-act="modal-edit-child" data-id="${c.id}">${icon('edit')} Ajustar divisão</button>` : ''}</div>
    ${sec('Metas', 'Poupar é dar tempo aos sonhos.')}
    <div class="grid two">${active.map(goalCard).join('') || `<div class="card empty"><div class="empty-icon">🎯</div>Nenhuma meta aberta.${can.createGoal(c.id) ? ' Crie uma no cofrinho Poupar.' : ''}</div>`}</div>
    ${done.length ? `${sec('Sonhos realizados', '')}<div class="grid two">${done.map(goalCard).join('')}</div>` : ''}
    ${c.age >= 12 ? simulatorCard() : ''}
    ${sec('Movimentações', 'Tudo fica registrado. O saldo é a soma do histórico.')}
    <div class="card"><div class="list">${ledger.map(x => { const credit = CREDIT.includes(x.type); return `<div class="list-row"><div class="event-ico ${credit ? 'bg-good good' : 'bg-purple purple'}">${icon(credit ? 'coin' : x.type === 'give' || x.type === 'donate' ? 'heart' : 'wallet')}</div><div class="list-main"><div class="list-name">${esc(x.description)}</div><div class="list-meta">${fmtD(x.date)} · ${LABEL[x.type] || x.type}</div></div><b class="${credit ? 'good' : 'purple'}">${credit ? '+' : '−'}${money(x.amount)}</b></div>`; }).join('') || '<div class="empty">Sem movimentações.</div>'}</div></div>
    ${parent ? `<div class="hint-box" style="margin-top:20px"><b>Fechamento de ${esc(monthLabel(activeMonth))}:</b> credita a mesada, divide entre os cofrinhos e paga os juros do pai. ${closed ? 'Já encerrado para este perfil.' : `<button class="btn soft small" style="margin-left:8px" data-act="close-month">${icon('lock')} Encerrar mês</button>`}</div>` : ''}`;
  }

  function simulatorCard() {
    return `${sec('Simulador de juros', 'Quanto vira um depósito mensal com juros compostos?')}<div class="card"><form id="form-sim" class="rules-grid"><div class="rule-field"><label for="sim-m">Depósito por mês (R$)</label><input id="sim-m" name="monthly" type="number" min="0" max="10000" step="1" value="20" /></div><div class="rule-field"><label for="sim-n">Por quantos meses</label><input id="sim-n" name="months" type="number" min="1" max="120" step="1" value="12" /></div><div class="rule-field"><label for="sim-i">Juros ao mês (%)</label><input id="sim-i" name="pct" type="number" min="0" max="10" step="0.1" value="${state.config.interestPct}" /></div><div class="rule-field"><label>Resultado</label><div id="sim-out" class="sim-out">${simText(2000, 12, state.config.interestPct)}</div></div></form></div>`;
  }
  function simText(monthlyCents, months, pct) {
    const fv = R.futureValue(monthlyCents, months, pct), put = monthlyCents * months;
    return `${money(fv)} <small>(${money(put)} seus + ${money(fv - put)} de juros)</small>`;
  }

  /* ---------- Regras ---------- */

  function renderRules() {
    const c = state.config, parent = isParent(), dis = parent ? '' : 'disabled';
    const weekPts = state.tasks.filter(t => t.active).reduce((a, t) => a + t.pts, 0);
    const monthHab = weekPts * 4 * c.centsPerPoint, capHab = Math.round(c.base * c.habitsPct / 100), capSch = Math.round(c.base * c.schoolPct / 100);
    return `${header('REGULAMENTO FAMILIAR', 'Os combinados da casa', 'Regras claras tornam a mesada previsível e justa. Todas podem ver. Só o responsável altera.', '<span></span>')}
    <form id="settings">
    <div class="grid two sm-stack"><div class="card"><h2 class="section-title" style="margin-bottom:7px">Parâmetros</h2><p class="section-hint">Valem para meses ainda abertos.</p><div class="rules-grid" style="margin-top:18px">${[
      ['base', 'Mesada-base padrão (R$)', Math.round(c.base / 100), 'min="0" max="999" step="1"'],
      ['habitsPct', 'Teto de hábitos (% da base)', c.habitsPct, 'min="0" max="100" step="1"'],
      ['schoolPct', 'Teto escolar (% da base)', c.schoolPct, 'min="0" max="100" step="1"'],
      ['centsPerPoint', 'Valor de 1 ponto (centavos)', c.centsPerPoint, 'min="1" max="100" step="1"'],
      ['interestPct', 'Juros do pai (% ao mês)', c.interestPct, 'min="0" max="10" step="0.5"']
    ].map(([k, l, v, o]) => `<div class="rule-field"><label for="cfg-${k}">${l}</label><input id="cfg-${k}" name="${k}" type="number" ${o} value="${v}" ${dis} /></div>`).join('')}</div>
    <div class="hint-box" style="margin-top:16px">Com base de ${money(c.base)}: hábitos até <strong>${money(capHab)}</strong> e escola até <strong>${money(capSch)}</strong> por mês. Hábitos pesam ${capHab + capSch ? Math.round(capHab / (capHab + capSch) * 100) : 0}% do bônus possível.</div></div>
    <div class="card"><h2 class="section-title" style="margin-bottom:7px">Hábitos e pontos</h2><p class="section-hint">Quatro semanas completas rendem ${money(monthHab)}${monthHab === capHab ? ', exatamente o teto' : monthHab > capHab ? `, acima do teto de ${money(capHab)}` : `, abaixo do teto de ${money(capHab)}`}.</p><div class="tablewrap" style="margin-top:12px"><table class="data-table tasks-table"><thead><tr><th>Ativo</th><th>Hábito</th><th>Dias/ciclo</th><th>Pontos</th></tr></thead><tbody>${state.tasks.map(t => `<tr><td><input type="checkbox" name="active-${t.id}" ${t.active ? 'checked' : ''} ${dis} aria-label="Ativar ${esc(t.name)}" /></td><td><b>${esc(t.name)}</b></td><td><input class="field" type="number" name="target-${t.id}" min="1" max="7" value="${t.target}" ${dis} aria-label="Dias por ciclo" /></td><td><input class="field" type="number" name="pts-${t.id}" min="0" max="200" value="${t.pts}" ${dis} aria-label="Pontos" /></td></tr>`).join('')}</tbody></table></div></div></div>
    <div class="grid two sm-stack" style="margin-top:17px"><div class="card"><h2 class="section-title" style="margin-bottom:7px">Meta da família</h2><p class="section-hint">Conta os dias de estudo ou leitura de todas no mês.</p><div class="rules-grid" style="margin-top:16px"><div class="rule-field"><label for="cfg-fg-name">Recompensa</label><input id="cfg-fg-name" name="fgName" type="text" maxlength="40" value="${esc(c.familyGoal.name)}" ${dis} /></div><div class="rule-field"><label for="cfg-fg-emoji">Ícone</label><input id="cfg-fg-emoji" name="fgEmoji" type="text" maxlength="4" value="${esc(c.familyGoal.emoji)}" ${dis} /></div><div class="rule-field"><label for="cfg-fg-target">Dias de estudo somados</label><input id="cfg-fg-target" name="fgTarget" type="number" min="1" max="300" value="${c.familyGoal.target}" ${dis} /></div></div></div>
    <div class="card"><h2 class="section-title" style="margin-bottom:15px">Princípios</h2><div class="list">${[
      ['shield', 'Base garantida', 'A mesada-base ensina a administrar dinheiro. Ocorrências só ajustam o bônus.'],
      ['routine', 'Esforço pesa mais que nota', 'Pagar só por resultado costuma não funcionar. Pagar por hábitos de estudo funciona melhor (Fryer, 2011).'],
      ['clock', 'Recompensa rápida', 'Bônus aprovado na semana. Prêmio com um mês de atraso perde a força (Levitt et al., 2016).'],
      ['stars', 'Elogio específico', 'Diga o que ela fez bem. Feedback informativo preserva o gosto por aprender (Deci, Koestner e Ryan, 1999).'],
      ['heart', 'Juntas, não contra', 'Meta cooperativa no lugar de ranking entre irmãs.']
    ].map(([i, t, d]) => `<div class="list-row"><div class="event-ico bg-purple purple">${icon(i)}</div><div class="list-main"><div class="list-name">${t}</div><div class="list-meta">${d}</div></div></div>`).join('')}</div></div></div>
    ${parent ? `<div class="form-actions"><button class="btn" type="submit">Salvar regras</button></div>` : ''}
    </form>
    ${sec('Perfis', 'O apelido liga cada filha à planilha dos e-mails da escola sem expor nomes.', parent ? `<button class="btn secondary small" data-act="modal-child">${icon('plus')} Novo perfil</button>` : '')}
    <div class="grid ${viewChildren().length >= 3 ? 'three' : 'two'}">${viewChildren().map(p => { const sp = { ...R.DEFAULT_SPLIT, ...p.split }; return `<div class="card tight"><div class="child-head" style="margin-bottom:10px"><div class="avatar" style="background:${p.bg};color:${p.color}">${esc(p.name.slice(0, 1).toUpperCase())}</div><div class="list-main"><div class="child-name">${esc(p.name)}</div><div class="child-age">${p.age} anos · apelido ${esc(p.alias || '—')}</div></div>${parent ? `<button class="btn secondary small" data-act="modal-edit-child" data-id="${p.id}" aria-label="Editar ${esc(p.name)}">${icon('edit')}</button>` : ''}</div><div class="list-meta">Base ${money(R.childBase(state, p))}${Number.isSafeInteger(p.base) ? '' : ' (padrão)'} · Poupar ${sp.save}% · Doar ${sp.give}%</div></div>`; }).join('')}</div>
    ${parent ? `${sec('Segurança e backup', 'Sem servidor: o backup é a sua cópia de segurança.')}
    <div class="grid two sm-stack"><div class="card"><h2 class="section-title" style="margin-bottom:7px">PIN do responsável</h2><p class="section-hint">${c.pin ? 'PIN ativo. Ao trocar de perfil, a área do responsável pede o PIN.' : 'Sem PIN, qualquer pessoa neste aparelho pode aprovar bônus.'}</p><form id="form-pin" style="margin-top:14px"><div class="rules-grid"><div class="rule-field"><label for="pin-new">${c.pin ? 'Novo PIN' : 'PIN'} (4 a 8 dígitos)</label><input id="pin-new" name="pin" type="password" inputmode="numeric" pattern="[0-9]{4,8}" autocomplete="new-password" required /></div><div class="rule-field"><label for="pin-again">Repita o PIN</label><input id="pin-again" name="again" type="password" inputmode="numeric" pattern="[0-9]{4,8}" autocomplete="new-password" required /></div></div><div class="form-actions"><button class="btn" type="submit">${icon('key')} ${c.pin ? 'Trocar PIN' : 'Criar PIN'}</button>${c.pin ? `<button class="btn secondary" type="button" data-act="pin-remove">Remover PIN</button>` : ''}</div></form><div class="list-meta" style="margin-top:8px">Proteção leve para um aparelho compartilhado. Não substitui login.</div></div>
    <div class="card"><h2 class="section-title" style="margin-bottom:7px">Backup</h2><p class="section-hint">Exporte toda semana. Se o navegador limpar os dados, você importa de volta.</p><div class="form-actions" style="justify-content:flex-start"><button class="btn" data-act="export">${icon('download')} Exportar backup</button><button class="btn secondary" data-act="import">${icon('upload')} Importar backup</button><input id="import-file" type="file" accept="application/json,.json" class="hidden" /></div><hr class="divider" /><div class="teacher-note"><b>Atenção:</b> o site é público no GitHub Pages. Use apelidos e não registre nomes completos, escola, turma ou fotos.</div><div class="form-actions"><button class="btn secondary" data-act="reset-demo">${icon('alert')} Restaurar dados fictícios</button></div></div></div>` : ''}`;
  }

  /* ---------- Modais ---------- */

  function shellModal(title, description, body, submitLabel = 'Salvar', formId = 'modal-form') {
    modalHTML = `<div class="modal-backdrop" data-act="close-modal-bg"><section class="modal" role="dialog" aria-modal="true" aria-label="${esc(title)}"><button class="modal-close" type="button" data-act="close-modal" aria-label="Fechar">×</button><h2>${esc(title)}</h2><p>${esc(description)}</p><form id="${formId}">${body}<div class="form-actions"><button type="button" class="btn secondary" data-act="close-modal">Cancelar</button><button class="btn" type="submit">${submitLabel}</button></div></form></section></div>`;
    render(); document.querySelector('.modal input:not([type=hidden]),.modal select,.modal textarea')?.focus();
  }
  const input = (name, label, opts = '') => `<div class="form-field"><label for="fm-${name}">${label}</label><input id="fm-${name}" name="${name}" ${opts} required /></div>`;
  const childOptions = (sel = state.selected) => state.children.map(c => `<option value="${c.id}" ${c.id === sel ? 'selected' : ''}>${esc(c.name)}</option>`).join('');
  const dateLimits = () => { const max = activeMonth === period() ? today() : `${activeMonth}-${String(R.monthDays(activeMonth)).padStart(2, '0')}`; return `type="date" min="${activeMonth}-01" max="${max}" value="${max}"`; };

  function openModal(which, id = '') {
    const parentOnly = ['occurrence', 'child', 'edit-child', 'spend', 'donate', 'classify'];
    if (parentOnly.includes(which) && !isParent()) return notify('Esta ação exige o responsável.');
    if (which === 'occurrence') {
      shellModal('Registrar ocorrência', 'Positivas viram pontos. Negativas começam com conversa. Tudo entra pendente até você aprovar.', `<div class="form-field"><label for="fm-child">Filha</label><select id="fm-child" name="child" required>${childOptions()}</select></div><div class="form-field"><label for="fm-kind">Tipo</label><select id="fm-kind" name="kind"><optgroup label="Positivas (+${R.POSITIVE.pts} pts)">${R.POS_KINDS.map(k => `<option value="pos:${k.id}">${esc(k.title)}</option>`).join('')}</optgroup><optgroup label="Para orientar">${R.NEG_KINDS.map(k => `<option value="neg:${k.id}">Nível ${k.level} · ${esc(k.title)}</option>`).join('')}</optgroup></select></div>${input('date', 'Data', dateLimits())}<div class="form-field"><label for="fm-detail">Descrição (opcional)</label><textarea id="fm-detail" name="detail" maxlength="300" placeholder="Ex.: elogio pela apresentação de ciências"></textarea></div>`, 'Registrar pendente', 'form-occurrence');
    } else if (which === 'grade') {
      const own = viewerId();
      if (!isParent() && !(own && can.submitGrade(own))) return notify('Peça ao responsável para lançar a nota.');
      shellModal('Lançar nota', isParent() ? 'Aceita 9,5 · 95 · 95% · 38/40 · conceitos (A, MB, B...).' : 'Sua nota fica aguardando a conferência do responsável.', `${isParent() ? `<div class="form-field"><label for="fm-child">Filha</label><select id="fm-child" name="child" required>${childOptions()}</select></div>` : `<input type="hidden" name="child" value="${own}" />`}<div class="form-field"><label for="fm-subject">Disciplina</label><select id="fm-subject" name="subject">${R.SUBJECTS.map(s => `<option>${s}</option>`).join('')}</select></div><div class="rules-grid"><div class="form-field"><label for="fm-raw">Nota</label><input id="fm-raw" name="raw" type="text" inputmode="decimal" maxlength="12" placeholder="9,5" required /></div><div class="form-field"><label for="fm-scale">Escala</label><select id="fm-scale" name="scale"><option value="auto">Automática</option><option value="10">0 a 10</option><option value="100">0 a 100</option></select></div></div><div id="grade-preview" class="grade-preview" aria-live="polite"></div>${input('date', 'Data da avaliação', dateLimits())}`, isParent() ? 'Lançar nota' : 'Enviar para conferência', 'form-grade');
    } else if (which === 'classify') {
      const o = state.occurrences.find(x => x.id === id); if (!o) return;
      shellModal('Classificar ocorrência', `${getChild(o.childId).name} · ${fmtD(o.date)}. Veio do e-mail da escola. Confira e escolha o tipo.`, `<input type="hidden" name="id" value="${o.id}" /><div class="form-field"><label for="fm-kind">Tipo</label><select id="fm-kind" name="kind"><optgroup label="Positivas">${R.POS_KINDS.map(k => `<option value="pos:${k.id}">${esc(k.title)}</option>`).join('')}</optgroup><optgroup label="Para orientar">${R.NEG_KINDS.map(k => `<option value="neg:${k.id}" ${k.level === 1 ? 'selected' : ''}>Nível ${k.level} · ${esc(k.title)}</option>`).join('')}</optgroup></select></div>`, 'Classificar e aprovar', 'form-classify');
    } else if (which === 'child') {
      shellModal('Adicionar perfil', 'Use um apelido curto para ligar aos e-mails da escola, como F09.', `${input('name', 'Nome ou apelido', 'type="text" maxlength="25"')}${input('age', 'Idade', 'type="number" min="6" max="19" value="12"')}<div class="form-field"><label for="fm-alias">Apelido na planilha (opcional)</label><input id="fm-alias" name="alias" type="text" maxlength="6" placeholder="F12" /></div>`, 'Adicionar', 'form-child');
    } else if (which === 'edit-child') {
      const c = getChild(id), sp = { ...R.DEFAULT_SPLIT, ...c.split };
      shellModal('Editar perfil', `Dados de ${c.name}. Deixe a base vazia para usar o padrão da casa.`, `<input type="hidden" name="id" value="${c.id}" />${input('name', 'Nome ou apelido', `type="text" maxlength="25" value="${esc(c.name)}"`)}<div class="rules-grid">${input('age', 'Idade', `type="number" min="6" max="19" value="${c.age}"`)}<div class="form-field"><label for="fm-alias">Apelido na planilha</label><input id="fm-alias" name="alias" type="text" maxlength="6" value="${esc(c.alias || '')}" placeholder="F12" /></div><div class="form-field"><label for="fm-base">Mesada-base própria (R$)</label><input id="fm-base" name="base" type="number" min="0" max="999" step="1" value="${Number.isSafeInteger(c.base) ? c.base / 100 : ''}" placeholder="${state.config.base / 100}" /></div><div class="form-field"><label for="fm-save">Poupar (% da mesada)</label><input id="fm-save" name="save" type="number" min="0" max="100" value="${sp.save}" required /></div><div class="form-field"><label for="fm-give">Doar (% da mesada)</label><input id="fm-give" name="give" type="number" min="0" max="100" value="${sp.give}" required /></div></div>`, 'Salvar', 'form-edit-child');
    } else if (which === 'goal') {
      const c = currentChild();
      if (!can.createGoal(c.id)) return notify('Ação indisponível neste perfil.');
      shellModal('Nova meta', 'Escolha algo que você quer muito. O cofrinho é virtual.', `${isParent() ? `<div class="form-field"><label>Filha</label><select name="child">${childOptions(c.id)}</select></div>` : `<input type="hidden" name="child" value="${c.id}" />`}${input('name', 'O que deseja?', 'type="text" maxlength="38" placeholder="Ex.: Bicicleta"')}${input('amount', 'Quanto custa (R$)', 'type="number" min="1" max="100000" step="0.01" value="150"')}<div class="form-field"><label for="fm-emoji">Ícone</label><select id="fm-emoji" name="emoji">${['🎯 Meta', '📚 Livros', '🚲 Bicicleta', '🎧 Fone', '🎮 Jogo', '🎡 Passeio', '🎨 Arte', '⚽ Esporte', '👟 Tênis', '🎁 Presente'].map(x => `<option value="${x.split(' ')[0]}">${x}</option>`).join('')}</select></div>`, 'Criar meta', 'form-goal');
    } else if (which === 'save' || which === 'unsave') {
      const g = state.goals.find(x => x.id === id); if (!g || !can.move(g.childId)) return;
      const max = which === 'save' ? R.jarSpend(state, g.childId) : R.goalSaved(state, g.id);
      if (max <= 0) return notify(which === 'save' ? 'Não há saldo livre para guardar.' : 'Nada guardado nesta meta.');
      shellModal(which === 'save' ? 'Guardar na meta' : 'Resgatar da meta', `${g.name} · máximo ${money(max)}.`, `<input type="hidden" name="goal" value="${g.id}" />${input('amount', 'Valor (R$)', `type="number" min="0.01" max="${(max / 100).toFixed(2)}" step="0.01" value="${(Math.min(1000, max) / 100).toFixed(2)}"`)}`, 'Confirmar', which === 'save' ? 'form-save' : 'form-unsave');
    } else if (which === 'give') {
      const c = currentChild(), max = R.jarSpend(state, c.id); if (!can.move(c.id) || max <= 0) return;
      shellModal('Separar para doar', `Sai do cofrinho Gastar e vai para Doar. Máximo ${money(max)}.`, `<input type="hidden" name="child" value="${c.id}" />${input('amount', 'Valor (R$)', `type="number" min="0.01" max="${(max / 100).toFixed(2)}" step="0.01" value="${(Math.min(500, max) / 100).toFixed(2)}"`)}`, 'Separar', 'form-give');
    } else if (which === 'spend') {
      const c = currentChild(), max = R.jarSpend(state, c.id); if (max <= 0) return notify('Sem saldo livre.');
      shellModal('Registrar gasto', `Saldo livre de ${c.name}: ${money(max)}.`, `<input type="hidden" name="child" value="${c.id}" />${input('amount', 'Valor (R$)', `type="number" min="0.01" max="${(max / 100).toFixed(2)}" step="0.01" value="5"`)}${input('description', 'Com o quê?', 'type="text" maxlength="70" placeholder="Ex.: Lanche"')}`, 'Registrar', 'form-spend');
    } else if (which === 'donate') {
      const c = currentChild(), max = R.jarGive(state, c.id); if (max <= 0) return;
      shellModal('Registrar doação', `Cofrinho Doar de ${c.name}: ${money(max)}.`, `<input type="hidden" name="child" value="${c.id}" />${input('amount', 'Valor (R$)', `type="number" min="0.01" max="${(max / 100).toFixed(2)}" step="0.01" value="${(max / 100).toFixed(2)}"`)}${input('description', 'Para quem ou para qual causa?', 'type="text" maxlength="70" placeholder="Ex.: Abrigo de animais"')}`, 'Registrar doação', 'form-donate');
    }
  }
  function closeModal() { modalHTML = ''; render(); }

  /* ---------- Ações ---------- */

  const openMonth = (cid, m = activeMonth) => !monthClosed(cid, m);

  function dayToggle(cid, taskId, d) {
    if (!can.checkin(cid) || !openMonth(cid)) return notify('Registro indisponível neste perfil ou mês.');
    if (d > today() || !R.inMonth(d, activeMonth)) return notify('Escolha uma data válida, não futura.');
    const w = R.cycleOf(d);
    if (state.bonuses.some(b => b.childId === cid && b.taskId === taskId && b.month === activeMonth && b.week === w)) return notify('Bônus já aprovado. Os registros deste ciclo estão consolidados.');
    const idx = state.checkins.findIndex(i => i.childId === cid && i.taskId === taskId && i.date === d);
    if (idx >= 0) state.checkins.splice(idx, 1);
    else state.checkins.push({ id: uid(), childId: cid, taskId, week: w, month: activeMonth, date: d, by: isParent() ? 'parent' : 'child' });
    commit();
  }

  function grantBonus(cid, taskId) {
    if (!isParent() || !openMonth(cid)) return;
    const t = state.tasks.find(x => x.id === taskId); if (!t) return;
    const w = activeWeek, m = activeMonth, days = R.datesForCycle(m, w);
    if (state.bonuses.some(b => b.childId === cid && b.taskId === taskId && b.week === w && b.month === m)) return notify('Este bônus já foi aprovado.');
    const done = new Set(state.checkins.filter(i => i.childId === cid && (t.streak || i.taskId === taskId) && days.includes(i.date)).map(i => i.date)).size;
    if (done < t.target) return notify('A meta do ciclo ainda não foi atingida.');
    state.bonuses.push({ id: uid(), childId: cid, taskId, week: w, month: m, pts: t.pts, date: today() });
    commit(`+${pts(t.pts)} para ${getChild(cid).name}. Diga o que ela fez bem!`);
  }

  function reviewOccurrence(id, status) {
    const o = state.occurrences.find(x => x.id === id);
    if (!o || !isParent() || !openMonth(o.childId, o.date.slice(0, 7))) return notify('Ocorrência indisponível para alteração.');
    if (status === 'confirmed' && o.kind === 'classificar') return openModal('classify', id);
    o.status = status; o.recovered = false;
    commit(status === 'confirmed' ? (o.polarity === 'pos' ? 'Ocorrência positiva aprovada. Comemore com ela!' : 'Ocorrência confirmada. Hora de conversar.') : status === 'justified' ? 'Registro abonado, sem efeito.' : 'Registro devolvido para análise.');
  }

  function recoverOccurrence(id) {
    const o = state.occurrences.find(x => x.id === id);
    if (!o || !isParent() || !openMonth(o.childId, o.date.slice(0, 7)) || o.status !== 'confirmed' || o.recovered) return;
    if (R.findKind(o.kind).level > 3) return notify('A recuperação vale para os níveis 1 a 3.');
    if (!confirm('Confirmar a medida corretiva? O ajuste desta ocorrência cai pela metade.')) return;
    o.recovered = true; commit('Recuperação registrada. Reconheça a reparação.');
  }

  function gradeApprove(id) {
    const g = state.grades.find(x => x.id === id); if (!g || !isParent() || !openMonth(g.childId, g.date.slice(0, 7))) return;
    g.status = 'confirmed'; commit(R.gradePoints(g.pct) ? `Nota aprovada: +${pts(R.gradePoints(g.pct))}.` : 'Nota aprovada.');
  }
  function gradeDelete(id) {
    const g = state.grades.find(x => x.id === id); if (!g || !isParent() || !openMonth(g.childId, g.date.slice(0, 7))) return;
    if (!confirm(g.status === 'pending' ? 'Recusar esta nota?' : 'Excluir esta nota?')) return;
    state.grades = state.grades.filter(x => x.id !== id); commit('Nota removida.');
  }

  function redeemGoal(gid) {
    const g = state.goals.find(x => x.id === gid); if (!g || !isParent() || g.done) return;
    const saved = R.goalSaved(state, g.id); if (saved < g.target) return;
    if (!confirm(`Realizar "${g.name}"? ${money(g.target)} saem do cofrinho${saved > g.target ? ` e ${money(saved - g.target)} voltam para Gastar` : ''}.`)) return;
    const d = today();
    state.ledger.push({ id: uid(), childId: g.childId, goalId: g.id, type: 'redeem', amount: g.target, date: d, description: `Sonho realizado: ${g.name}` });
    if (saved > g.target) state.ledger.push({ id: uid(), childId: g.childId, goalId: g.id, type: 'unsave', amount: saved - g.target, date: d, description: `Sobra da meta ${g.name}` });
    g.done = d; save(); render(); celebrate(`🏆 ${getChild(g.childId).name} realizou o sonho: ${g.name}!`); checkProgress();
  }

  function closeMonth(cid) {
    if (!isParent() || monthClosed(cid)) return;
    const c = getChild(cid), f = fin(cid), split = R.payoutSplit(state, c, f.total);
    const interest = state.goals.filter(g => g.childId === cid && !g.done).map(g => ({ g, amount: R.interestFor(state, g) })).filter(x => x.amount > 0);
    const intTotal = interest.reduce((a, x) => a + x.amount, 0);
    if (!confirm(`Encerrar ${monthLabel(activeMonth)} para ${c.name}?\n\nMesada: ${money(f.total)}\nGastar ${money(split.spend)} · Poupar ${money(split.save)} · Doar ${money(split.give)}\nJuros do pai: ${money(intTotal)}\n\nNão dá para desfazer.`)) return;
    const d = today(), label = monthLabel(activeMonth);
    state.closures.push({ id: uid(), childId: cid, month: activeMonth, base: f.base, habitsCents: f.habitsCents, schoolCents: f.schoolCents, penaltyCents: f.penaltyCents, bonusCents: f.bonusCents, total: f.total, closedAt: d });
    for (const x of interest) state.ledger.push({ id: uid(), childId: cid, goalId: x.g.id, type: 'interest', amount: x.amount, date: d, description: `Juros do pai em ${x.g.name}` });
    state.ledger.push({ id: uid(), childId: cid, type: 'payout', amount: f.total, date: d, description: `Mesada de ${label}` });
    if (split.save > 0) state.ledger.push({ id: uid(), childId: cid, goalId: split.goalId, type: 'save', amount: split.save, date: d, description: 'Poupança automática' });
    if (split.give > 0) state.ledger.push({ id: uid(), childId: cid, type: 'give', amount: split.give, date: d, description: 'Separado para doar' });
    save(); render(); celebrate(`💸 Mesada de ${c.name} creditada: ${money(f.total)}.`); checkProgress();
  }

  async function hashPin(pin, salt) {
    const data = new TextEncoder().encode(`${salt}:${pin}`);
    if (globalThis.crypto?.subtle) {
      const buf = await crypto.subtle.digest('SHA-256', data);
      return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
    }
    let h = 2166136261; for (const b of data) { h ^= b; h = Math.imul(h, 16777619) >>> 0; }
    return `fnv${h.toString(16)}`;
  }

  function exportBackup() {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `mesada-plus-backup-${today()}.json`;
    document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
    notify('Backup exportado.');
  }
  function importBackup(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      let next = null; try { next = R.migrate(JSON.parse(reader.result)); } catch { next = null; }
      if (!next) return notify('Arquivo inválido. Use um backup do Mesada+.');
      if (!confirm(`Substituir os dados deste navegador pelo backup com ${next.children.length} perfil(is)?`)) return;
      state = next; if (!state.seenLevel) state.seenLevel = {};
      session.set(true); state.role = 'parent'; commit('Backup restaurado.');
    };
    reader.readAsText(file);
  }

  const matchSubject = s => R.SUBJECTS.find(x => norm(x) === norm(s)) || (s ? String(s).slice(0, 1).toUpperCase() + String(s).slice(1, 30) : 'Outra');
  function isoLocal(v) {
    if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
    const d = new Date(v); if (Number.isNaN(d.getTime())) return null;
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }
  // Ex.: "Monitoria · Português · e-mail da escola". Sem nomes nem matrícula.
  function importDetail(it) {
    const parts = [String(it?.descricao || '').trim().slice(0, 60), it?.disciplina ? matchSubject(it.disciplina) : ''].filter(Boolean);
    return [...parts, 'e-mail da escola'].join(' · ');
  }
  function applyImport(items) {
    const seen = new Set(state.importedIds); let added = 0, skipped = 0;
    for (const it of items) {
      const extId = String(it?.id || '');
      const child = state.children.find(c => c.alias && String(it?.filha || '').trim().toUpperCase() === c.alias.trim().toUpperCase());
      const date = isoLocal(it?.data);
      if (!extId || seen.has(extId) || !child || !date || date > today() || monthClosed(child.id, date.slice(0, 7))) { skipped++; continue; }
      const base = { id: uid(), childId: child.id, date, source: 'classapp', extId };
      if (it.tipo === 'nota') {
        const pct = Number(it.pct); if (!Number.isFinite(pct) || pct < 0 || pct > 100) { skipped++; continue; }
        state.grades.push({ ...base, subject: matchSubject(it.disciplina), raw: `${Math.round(pct * 10) / 10}%`, pct: Math.round(pct * 10) / 10, status: 'confirmed' });
      } else if (it.tipo === 'ocorrencia_positiva') {
        const kind = R.POS_KINDS.some(k => k.id === it.categoria) ? it.categoria : 'elogio';
        state.occurrences.push({ ...base, polarity: 'pos', kind, detail: importDetail(it), status: 'confirmed' });
      } else if (it.tipo === 'ocorrencia_negativa' || it.tipo === 'ocorrencia') state.occurrences.push({ ...base, polarity: 'neg', kind: 'classificar', detail: importDetail(it), status: 'pending', recovered: false });
      else { skipped++; continue; }
      seen.add(extId); added++;
    }
    state.importedIds = [...seen];
    return { added, skipped };
  }
  async function importClassApp() {
    const cfg = classAppCfg(); let url;
    try { url = new URL(cfg.url); } catch { return notify('Salve uma URL válida do Apps Script.'); }
    if (url.protocol !== 'https:' || !cfg.token) return notify('Use a URL https e o token configurados no script.');
    url.searchParams.set('token', cfg.token);
    notify('Buscando lançamentos aprovados...');
    let items;
    try { const r = await fetch(url.toString(), { redirect: 'follow' }); items = await r.json(); } catch { return notify('Não consegui ler o Apps Script. Confira a URL e se a implantação está ativa.'); }
    if (!Array.isArray(items)) return notify(items && items.erro ? `Apps Script: ${items.erro}` : 'Resposta inesperada do Apps Script.');
    const res = applyImport(items);
    commit(`E-mails da escola: ${res.added} novo(s), ${res.skipped} ignorado(s) ou já importado(s).`);
  }

  /* ---------- Eventos ---------- */

  document.addEventListener('click', e => {
    const b = e.target.closest('[data-act]'); if (!b || b.disabled) return;
    const a = b.dataset.act;
    if (a === 'close-modal-bg') { if (e.target === b) closeModal(); return; }
    if (a === 'close-modal') { closeModal(); return; }
    if (a === 'nav') { state.view = b.dataset.view; save(); render(); window.scrollTo(0, 0); return; }
    if (a === 'child') { if (!isParent() && !isOwn(b.dataset.child)) return; state.selected = b.dataset.child; save(); render(); return; }
    if (a === 'school-filter') { schoolFilter = b.dataset.child; render(); return; }
    if (a === 'week') { activeWeek = Number(b.dataset.week); render(); return; }
    if (a === 'month') { const next = shiftMonth(activeMonth, Number(b.dataset.dir)); if (next > period()) return; activeMonth = next; activeWeek = next === period() ? R.cycleOf(today()) : 0; render(); return; }
    if (a.startsWith('modal-')) { openModal(a.slice(6), b.dataset.id || b.dataset.goal); return; }
    if (a === 'checkin') { dayToggle(state.selected, b.dataset.task, b.dataset.day); return; }
    if (a === 'grant-bonus') { grantBonus(state.selected, b.dataset.task); return; }
    if (a === 'approve' || a === 'excuse' || a === 'review') { reviewOccurrence(b.dataset.id, a === 'approve' ? 'confirmed' : a === 'excuse' ? 'justified' : 'pending'); return; }
    if (a === 'recover') { recoverOccurrence(b.dataset.id); return; }
    if (a === 'grade-approve') { gradeApprove(b.dataset.id); return; }
    if (a === 'grade-delete') { gradeDelete(b.dataset.id); return; }
    if (a === 'redeem') { redeemGoal(b.dataset.goal); return; }
    if (a === 'close-month') { closeMonth(state.selected); return; }
    if (a === 'lock') { session.set(false); state.role = `child:${state.selected}`; save(); render(); notify('Área do responsável bloqueada.'); return; }
    if (a === 'enter-child') { state.role = `child:${b.dataset.child}`; state.selected = b.dataset.child; state.view = 'dashboard'; save(); render(); return; }
    if (a === 'pin-remove') { if (!isParent() || !confirm('Remover o PIN do responsável?')) return; state.config.pin = null; commit('PIN removido.'); return; }
    if (a === 'export') { if (isParent()) exportBackup(); return; }
    if (a === 'import') { if (isParent()) document.getElementById('import-file')?.click(); return; }
    if (a === 'classapp-import') { if (isParent()) importClassApp(); return; }
    if (a === 'reset-demo') {
      if (!isParent() || !confirm('Restaurar os dados fictícios? Isso apaga tudo o que foi salvo neste navegador.')) return;
      state = R.migrate(R.seed(today())); state.seenLevel = {}; activeMonth = period(); activeWeek = R.cycleOf(today());
      for (const c of state.children) { state.seenBadges[c.id] = [...R.badges(state, c.id, today())]; state.seenLevel[c.id] = level(c).level; }
      commit('Demonstração restaurada.');
    }
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modalHTML) closeModal();
    if ((e.key === 'Enter' || e.key === ' ') && e.target.matches?.('[role=button][data-act]')) { e.preventDefault(); e.target.click(); }
  });
  document.addEventListener('change', e => {
    if (e.target.id === 'role') {
      state.role = e.target.value;
      if (state.role !== 'parent') state.selected = state.role.slice(6);
      save(); render(); return;
    }
    if (e.target.id === 'import-file') { importBackup(e.target.files?.[0]); e.target.value = ''; }
  });
  document.addEventListener('input', e => {
    const form = e.target.form;
    if (form?.getAttribute('id') === 'form-grade') {
      const d = Object.fromEntries(new FormData(form)), pct = R.parseGrade(d.raw, d.scale), out = document.getElementById('grade-preview');
      if (out) out.textContent = !d.raw ? '' : pct == null ? 'Formato não reconhecido. Ex.: 9,5 · 95% · 38/40 · MB' : `= ${pct}% · ${R.gradePoints(pct) ? `+${pts(R.gradePoints(pct))} de bônus` : 'sem bônus de nota (melhora ainda pode contar)'}`;
    }
    if (form?.getAttribute('id') === 'form-sim') {
      const d = Object.fromEntries(new FormData(form)), out = document.getElementById('sim-out');
      if (out) out.innerHTML = simText(number(cents(d.monthly || 0), 0, 1000000), number(d.months, 1, 120), Math.max(0, Math.min(10, Number(d.pct) || 0)));
    }
  });

  document.addEventListener('submit', async e => {
    // getAttribute: um campo name="id" sobrescreve form.id no DOM.
    const form = e.target, fid = form.getAttribute('id'); if (!fid) return; e.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    if (fid === 'form-sim') return;
    if (fid === 'form-unlock') {
      const pin = state.config.pin;
      if (pin && await hashPin(String(data.pin || ''), pin.salt) === pin.hash) { session.set(true); render(); notify('Bem-vindo, responsável.'); }
      else { notify('PIN incorreto.'); form.reset(); }
      return;
    }
    // Ações das filhas (no próprio perfil)
    if (fid === 'form-grade') {
      const cid = data.child, child = getChild(cid);
      if (!(isParent() || (isOwn(cid) && can.submitGrade(cid)))) return;
      if (!openMonth(cid)) return notify('O mês desta filha está fechado.');
      if (!R.inMonth(data.date, activeMonth) || data.date > today()) return notify('Use uma data deste mês, até hoje.');
      const pct = R.parseGrade(data.raw, data.scale); if (pct == null) return notify('Nota em formato não reconhecido.');
      state.grades.push({ id: uid(), childId: cid, date: data.date, subject: matchSubject(data.subject), raw: String(data.raw).trim().slice(0, 12), pct, status: isParent() ? 'confirmed' : 'pending', source: isParent() ? 'manual' : 'filha' });
      modalHTML = '';
      return commit(isParent() ? (R.gradePoints(pct) ? `Nota de ${child.name}: +${pts(R.gradePoints(pct))}. Elogie o esforço por trás dela.` : `Nota de ${child.name} registrada.`) : 'Nota enviada. O responsável vai conferir.');
    }
    if (fid === 'form-goal') {
      const cid = data.child; if (!can.createGoal(cid)) return;
      const amount = cents(data.amount), name = String(data.name || '').trim().slice(0, 38);
      if (!name || !Number.isSafeInteger(amount) || amount < 100 || amount > 10000000) return notify('Informe um nome e um valor válidos.');
      state.goals.push({ id: uid(), childId: cid, name, emoji: data.emoji || '🎯', target: amount }); state.selected = cid; modalHTML = '';
      return commit('Meta criada. Agora é encher o cofrinho!');
    }
    if (fid === 'form-save' || fid === 'form-unsave') {
      const g = state.goals.find(x => x.id === data.goal); if (!g || !can.move(g.childId) || g.done) return;
      const amount = cents(data.amount), isSave = fid === 'form-save', max = isSave ? R.jarSpend(state, g.childId) : R.goalSaved(state, g.id);
      if (!Number.isSafeInteger(amount) || amount <= 0 || amount > max) return notify('Saldo insuficiente ou valor inválido.');
      state.ledger.push({ id: uid(), childId: g.childId, goalId: g.id, type: isSave ? 'save' : 'unsave', amount, date: today(), description: isSave ? `Reserva para ${g.name}` : `Resgate da meta ${g.name}` });
      modalHTML = ''; save(); render();
      if (isSave && R.goalSaved(state, g.id) >= g.target) celebrate(`🎉 Meta "${g.name}" alcançada!`); else notify(isSave ? 'Guardado no cofrinho.' : 'Valor devolvido para Gastar.');
      return checkProgress();
    }
    if (fid === 'form-give') {
      const cid = data.child, amount = cents(data.amount); if (!can.move(cid)) return;
      if (!Number.isSafeInteger(amount) || amount <= 0 || amount > R.jarSpend(state, cid)) return notify('Saldo insuficiente ou valor inválido.');
      state.ledger.push({ id: uid(), childId: cid, type: 'give', amount, date: today(), description: 'Separado para doar' }); modalHTML = '';
      return commit('💛 Separado para doar.');
    }
    if (!isParent()) return;
    // Ações do responsável
    if (fid === 'settings') {
      const c = state.config;
      c.base = number(cents(data.base), 0, 99900); c.habitsPct = number(data.habitsPct, 0, 100); c.schoolPct = number(data.schoolPct, 0, 100);
      c.centsPerPoint = number(data.centsPerPoint, 1, 100); c.interestPct = Math.max(0, Math.min(10, Math.round((Number(data.interestPct) || 0) * 2) / 2));
      c.familyGoal = { name: String(data.fgName || '').trim().slice(0, 40) || 'Passeio em família', emoji: String(data.fgEmoji || '🎡').trim().slice(0, 4) || '🎡', target: number(data.fgTarget, 1, 300) };
      state.tasks = state.tasks.map(t => ({ ...t, active: data[`active-${t.id}`] === 'on', target: number(data[`target-${t.id}`], 1, 7), pts: number(data[`pts-${t.id}`], 0, 200) }));
      return commit('Regras salvas para os meses abertos.');
    }
    if (fid === 'form-pin') {
      const pin = String(data.pin || '');
      if (!/^\d{4,8}$/.test(pin)) return notify('Use de 4 a 8 dígitos.');
      if (pin !== data.again) return notify('Os PINs não conferem.');
      const salt = uid(); state.config.pin = { salt, hash: await hashPin(pin, salt) }; session.set(true);
      return commit('PIN salvo. Use o cadeado no topo para bloquear.');
    }
    if (fid === 'form-classapp') {
      const url = String(data.url || '').trim(), token = String(data.token || '').trim();
      if (url && !/^https:\/\/script\.google(usercontent)?\.com\//.test(url)) return notify('A URL deve ser do Google Apps Script (https://script.google.com/...).');
      store.set(CLASSAPP_KEY, JSON.stringify({ url, token })); render(); return notify('Configuração dos e-mails da escola salva neste navegador.');
    }
    if (fid === 'form-occurrence' || fid === 'form-classify') {
      const [polarity, kind] = String(data.kind || '').split(':');
      const valid = polarity === 'pos' ? R.POS_KINDS.some(k => k.id === kind) : polarity === 'neg' && R.NEG_KINDS.some(k => k.id === kind);
      if (!valid) return;
      if (fid === 'form-classify') {
        const o = state.occurrences.find(x => x.id === data.id); if (!o || !openMonth(o.childId, o.date.slice(0, 7))) return;
        o.polarity = polarity; o.kind = kind; o.status = 'confirmed'; modalHTML = '';
        return commit('Ocorrência classificada e aprovada.');
      }
      if (!openMonth(data.child)) return notify('O mês desta filha está fechado.');
      if (!R.inMonth(data.date, activeMonth) || data.date > today()) return notify('Use uma data deste mês, até hoje.');
      state.occurrences.push({ id: uid(), childId: data.child, polarity, kind, date: data.date, detail: String(data.detail || '').trim().slice(0, 300), status: 'pending', recovered: false });
      modalHTML = ''; return commit('Registrada. Aprove na lista para valer.');
    }
    if (fid === 'form-child' || fid === 'form-edit-child') {
      const name = String(data.name || '').trim().slice(0, 25), age = number(data.age, 6, 19), alias = String(data.alias || '').trim().toUpperCase().slice(0, 6);
      if (!name) return;
      if (alias && state.children.some(c => c.id !== data.id && (c.alias || '').toUpperCase() === alias)) return notify('Este apelido já está em uso.');
      if (fid === 'form-child') {
        const palette = [['#dc8a51', '#fff0e5'], ['#1c80ba', '#e8f4fe'], ['#8056d9', '#f0eaff'], ['#0d9c92', '#dcf7f3']];
        const [color, bg] = palette[state.children.length % palette.length], id = uid();
        state.children.push({ id, name, age, alias, color, bg, base: null, split: { ...R.DEFAULT_SPLIT } });
        state.seenBadges[id] = []; state.seenLevel[id] = 1; state.selected = id;
      } else {
        const p = state.children.find(c => c.id === data.id); if (!p) return;
        const sv = number(data.save, 0, 100), gv = number(data.give, 0, 100);
        if (sv + gv > 100) return notify('Poupar + Doar não pode passar de 100%.');
        p.name = name; p.age = age; p.alias = alias; p.split = { save: sv, give: gv };
        p.base = String(data.base ?? '').trim() === '' ? null : number(cents(data.base), 0, 99900);
      }
      modalHTML = ''; return commit('Perfil salvo.');
    }
    if (fid === 'form-spend' || fid === 'form-donate') {
      const cid = data.child, amount = cents(data.amount), spend = fid === 'form-spend';
      const max = spend ? R.jarSpend(state, cid) : R.jarGive(state, cid);
      if (!Number.isSafeInteger(amount) || amount <= 0 || amount > max) return notify('Saldo insuficiente ou valor inválido.');
      const desc = String(data.description || '').trim().slice(0, 70); if (!desc) return notify('Informe a descrição.');
      state.ledger.push({ id: uid(), childId: cid, type: spend ? 'spend' : 'donate', amount, date: today(), description: spend ? desc : `Doação: ${desc}` });
      modalHTML = ''; save(); render();
      if (spend) notify('Gasto registrado.'); else celebrate(`💛 Doação de ${money(amount)} registrada. Que bonito!`);
      return checkProgress();
    }
  });

  render();
})();
