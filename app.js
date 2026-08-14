// ── FLIPSIDE BAR MANAGEMENT ─────────────────────────────────
'use strict';

// SVG coordinate space: viewBox 0 0 1570.35 945.01
// All cx/cy values are in those units — they scale perfectly with the SVG.

// ── SERVERS ───────────────────────────────────────────────────
const SERVERS = [
  { id: 0, name: 'Alex',   color: '#5b8dee' },
  { id: 1, name: 'Jordan', color: '#a855f7' },
  { id: 2, name: 'Sam',    color: '#f59e0b' },
  { id: 3, name: 'Riley',  color: '#22c55e' },
  { id: 4, name: 'Morgan', color: '#ef4444' },
  { id: 5, name: 'Casey',  color: '#06b6d4' },
];

// ── ENTITY DEFINITIONS ────────────────────────────────────────
// cx / cy are SVG user-space coordinates (viewBox 0 0 1570.35 945.01)
// Mapped directly from CompleteLayout.svg geometry — no % math needed.
const ENTITIES = [

  // ── BAR STOOLS (along the bar top, y ≈ 250) ──
  { id:'A',  type:'stool', zone:'bar',     icon:'🪑', cx: 587,  cy: 250 },
  { id:'B',  type:'stool', zone:'bar',     icon:'🪑', cx: 628,  cy: 250 },
  { id:'C',  type:'stool', zone:'bar',     icon:'🪑', cx: 668,  cy: 250 },
  { id:'D',  type:'stool', zone:'bar',     icon:'🪑', cx: 709,  cy: 250 },
  { id:'E',  type:'stool', zone:'bar',     icon:'🪑', cx: 749,  cy: 250 },
  { id:'F',  type:'stool', zone:'bar',     icon:'🪑', cx: 789,  cy: 250 },
  { id:'G',  type:'stool', zone:'bar',     icon:'🪑', cx: 830,  cy: 250 },
  { id:'H',  type:'stool', zone:'bar',     icon:'🪑', cx: 870,  cy: 250 },
  { id:'I',  type:'stool', zone:'bar',     icon:'🪑', cx: 910,  cy: 250 },
  { id:'J',  type:'stool', zone:'bar',     icon:'🪑', cx: 951,  cy: 250 },
  { id:'K',  type:'stool', zone:'bar',     icon:'🪑', cx: 991,  cy: 250 },
  { id:'L',  type:'stool', zone:'bar',     icon:'🪑', cx:1031,  cy: 250 },
  { id:'M',  type:'stool', zone:'bar',     icon:'🪑', cx:1072,  cy: 250 },

  // ── INDOOR ROUND TABLES (row 1, y ≈ 450) ──
  { id:'T1', type:'table', zone:'indoor',  icon:'🍽️', cx: 609,  cy: 450 },
  { id:'T2', type:'table', zone:'indoor',  icon:'🍽️', cx: 781,  cy: 450 },
  { id:'T3', type:'table', zone:'indoor',  icon:'🍽️', cx: 954,  cy: 450 },

  // ── INDOOR ROUND TABLES (row 2, y ≈ 619) ──
  { id:'T4', type:'table', zone:'indoor',  icon:'🍽️', cx: 695,  cy: 619 },
  { id:'T5', type:'table', zone:'indoor',  icon:'🍽️', cx: 867,  cy: 619 },
  { id:'T6', type:'table', zone:'indoor',  icon:'🍽️', cx:1040,  cy: 619 },

  // ── PATIO TABLES ──
  { id:'P1', type:'table', zone:'patio',   icon:'🍽️', cx: 609,  cy: 783 },
  { id:'P2', type:'table', zone:'patio',   icon:'🍽️', cx: 878,  cy: 716 },
  { id:'P3', type:'table', zone:'patio',   icon:'🍽️', cx:1091,  cy: 716 },
  { id:'P4', type:'table', zone:'patio',   icon:'🍽️', cx: 781,  cy: 831 },
  { id:'P5', type:'table', zone:'patio',   icon:'🍽️', cx: 994,  cy: 831 },

  // ── DJ BOOTH ──
  { id:'DJ', type:'dj',    zone:'bar',     icon:'🎵', cx: 254,  cy: 286 },

  // ── BATHROOM FIXTURES ──
  { id:'WC-T1', type:'fixture', zone:'restroom', icon:'🚽', label:'Toilet M',  cx: 111, cy: 494 },
  { id:'WC-T2', type:'fixture', zone:'restroom', icon:'🚽', label:'Toilet F',  cx: 111, cy: 558 },
  { id:'WC-U1', type:'fixture', zone:'restroom', icon:'🚿', label:'Urinal 1',  cx: 279, cy: 456 },
  { id:'WC-U2', type:'fixture', zone:'restroom', icon:'🚿', label:'Urinal 2',  cx: 279, cy: 498 },
  { id:'WC-S1', type:'fixture', zone:'restroom', icon:'🪣', label:'Sink',      cx: 349, cy: 561 },
];

// SVG namespace
const SVG_NS = 'http://www.w3.org/2000/svg';

// ── STATE ──────────────────────────────────────────────────────
let state   = {};
let activeId = null;

function defaultEntityState(e) {
  const isFixture = e.type === 'fixture';
  const isDj      = e.type === 'dj';
  return {
    status:   isFixture ? 'ok' : (isDj ? 'empty' : 'open'),
    server:   null,
    reserved: false,
    orders:   [],
    notes:    '',
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem('flipside_state');
    if (raw) state = JSON.parse(raw);
  } catch(e) {}
  ENTITIES.forEach(e => { if (!state[e.id]) state[e.id] = defaultEntityState(e); });
}

function saveState() {
  localStorage.setItem('flipside_state', JSON.stringify(state));
}

// ── CLOCK ──────────────────────────────────────────────────────
function tickClock() {
  const now = new Date();
  const h = String(now.getHours()).padStart(2,'0');
  const m = String(now.getMinutes()).padStart(2,'0');
  document.getElementById('clock').textContent = `${h}:${m}`;
}

// ── SERVER ROSTER ──────────────────────────────────────────────
function renderRoster() {
  const roster = document.getElementById('server-roster');
  roster.innerHTML = SERVERS.map(s => `
    <div class="server-token" title="${s.name}">
      <div class="server-dot" style="background:${s.color}"></div>
      <span class="server-name" style="color:${s.color}">${s.name}</span>
    </div>
  `).join('');

  const sel = document.getElementById('server-select');
  sel.innerHTML = '<option value="">— Unassigned —</option>' +
    SERVERS.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
}

// ── SVG OVERLAY BUILDER ────────────────────────────────────────
// Each entity gets a <g class="ov-entity"> inside #interactive-layer.
// It contains: server halo circle, status ring circle, label rect+text,
// optional reserved badge.

function makeSVGEl(tag, attrs = {}) {
  const el = document.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  return el;
}

function buildOverlay(e) {
  const st = state[e.id];
  const effectiveStatus = (st.reserved && e.type !== 'fixture') ? 'reserved' : st.status;

  const g = makeSVGEl('g', {
    class:          'ov-entity',
    'data-id':      e.id,
    'data-type':    e.type,
    'data-status':  effectiveStatus,
    ...(st.server !== null ? { 'data-server': String(st.server) } : {}),
  });

  // Server halo (outer glow ring — coloured by server)
  const halo = makeSVGEl('circle', {
    class: 'ov-halo',
    cx: e.cx,
    cy: e.cy,
  });
  g.appendChild(halo);

  // Status ring
  const ring = makeSVGEl('circle', {
    class: 'ov-ring',
    cx: e.cx,
    cy: e.cy,
  });
  g.appendChild(ring);

  // Label pill background + text
  const labelText = e.label || e.id;
  const pillW = Math.max(labelText.length * 6.5 + 8, 24);
  const pillH = 14;
  const pillX = e.cx - pillW / 2;
  const pillY = e.cy + (e.type === 'stool' ? 17 : 24);

  const pillBg = makeSVGEl('rect', {
    class: 'ov-label-bg',
    x: pillX, y: pillY,
    width: pillW, height: pillH,
    rx: 4,
    fill: 'rgba(13,15,26,.82)',
  });
  g.appendChild(pillBg);

  const pillTxt = makeSVGEl('text', {
    class: 'ov-label-text',
    x: e.cx,
    y: pillY + pillH / 2,
    'font-size': '11',
    'font-weight': '700',
    fill: '#e8eaf6',
    'dominant-baseline': 'middle',
    'text-anchor': 'middle',
  });
  pillTxt.textContent = labelText;
  g.appendChild(pillTxt);

  // Reserved badge (red R dot, top-right of ring)
  if (st.reserved && e.type !== 'fixture') {
    const badgeR = e.type === 'stool' ? 7 : 9;
    const badgeX = e.cx + (e.type === 'stool' ? 13 : 18);
    const badgeY = e.cy - (e.type === 'stool' ? 13 : 18);

    const badgeBg = makeSVGEl('circle', {
      cx: badgeX, cy: badgeY, r: badgeR,
      fill: '#ef4444',
    });
    g.appendChild(badgeBg);

    const badgeTxt = makeSVGEl('text', {
      x: badgeX, y: badgeY,
      'font-size': '8', 'font-weight': '900',
      fill: '#fff',
      'dominant-baseline': 'middle',
      'text-anchor': 'middle',
    });
    badgeTxt.textContent = 'R';
    g.appendChild(badgeTxt);
  }

  // Click handler
  g.addEventListener('click', () => openPanel(e.id));

  return g;
}

// ── RENDER ALL OVERLAYS ────────────────────────────────────────
function renderEntities() {
  const layer = document.getElementById('interactive-layer');
  layer.innerHTML = '';
  ENTITIES.forEach(e => layer.appendChild(buildOverlay(e)));
}

function refreshEntity(id) {
  const existing = document.querySelector(`[data-id="${id}"]`);
  const e = ENTITIES.find(x => x.id === id);
  if (!e || !existing) return;
  const fresh = buildOverlay(e);
  existing.replaceWith(fresh);
}

// ── STATS CHIPS ────────────────────────────────────────────────
function updateChips() {
  const tables = ENTITIES.filter(e => e.type === 'table' && e.zone === 'indoor');
  const patio  = ENTITIES.filter(e => e.type === 'table' && e.zone === 'patio');
  const stools = ENTITIES.filter(e => e.type === 'stool');

  const seated = id => ['seated','ordered','bill'].includes(state[id]?.status);
  const openSt = id => state[id]?.status === 'open' && !state[id]?.reserved;

  document.getElementById('chip-indoor').textContent = `Indoor: ${tables.filter(e=>seated(e.id)).length}/${tables.length}`;
  document.getElementById('chip-patio').textContent  = `Patio: ${patio.filter(e=>seated(e.id)).length}/${patio.length}`;
  document.getElementById('chip-bar').textContent    = `Bar: ${stools.filter(e=>openSt(e.id)).length} open`;
}

// ── BATHROOM DOCK ──────────────────────────────────────────────
function renderBathDock() {
  const fixtures = ENTITIES.filter(e => e.type === 'fixture');
  const dock = document.getElementById('bath-fixtures');
  dock.innerHTML = fixtures.map(e => {
    const out = state[e.id]?.status === 'outofservice';
    return `<div class="bath-fixture" data-fid="${e.id}">
      <span class="bath-fixture-icon">${e.icon}</span>
      <span class="bath-fixture-name">${e.label || e.id}</span>
      <div class="bath-status-dot ${out ? 'out' : ''}"></div>
    </div>`;
  }).join('');

  dock.querySelectorAll('.bath-fixture').forEach(el => {
    el.addEventListener('click', () => {
      const fid = el.dataset.fid;
      const st = state[fid];
      st.status = st.status === 'outofservice' ? 'ok' : 'outofservice';
      saveState();
      renderBathDock();
      refreshEntity(fid);
      toast(st.status === 'outofservice' ? `⚠️ ${fid} out of service` : `✅ ${fid} back in service`);
    });
  });
}

// ── PANEL ──────────────────────────────────────────────────────
function openPanel(id) {
  activeId = id;
  const e  = ENTITIES.find(x => x.id === id);
  const st = state[id];

  // Header
  document.getElementById('panel-title').textContent = e.label || e.id;
  document.getElementById('panel-zone').textContent =
    { indoor:'Indoor Dining', patio:'Patio', bar:'Bar', restroom:'Restroom' }[e.zone] || e.zone;

  // Icon: emoji + coloured ring
  const effectiveStatus = (st.reserved && e.type !== 'fixture') ? 'reserved' : st.status;
  const iconWrap = document.getElementById('panel-icon');
  iconWrap.textContent = e.icon;
  iconWrap.dataset.status = effectiveStatus;

  // Status buttons
  const statuses = e.type === 'fixture'
    ? [{ s:'ok', label:'✅ OK' }, { s:'outofservice', label:'🔴 Out of Service' }]
    : e.type === 'dj'
    ? [{ s:'active', label:'🎵 Active' }, { s:'empty', label:'💤 Empty' }]
    : e.type === 'stool'
    ? [{ s:'open', label:'🟢 Open' }, { s:'seated', label:'🟡 Occupied' }]
    : [
        { s:'open',    label:'🟢 Open'    },
        { s:'seated',  label:'🟡 Seated'  },
        { s:'ordered', label:'🔵 Ordered' },
        { s:'bill',    label:'🔴 Bill Out' },
      ];

  const sbWrap = document.getElementById('status-buttons');
  sbWrap.innerHTML = statuses.map(s =>
    `<button class="status-btn ${st.status === s.s ? 'active' : ''}" data-s="${s.s}">${s.label}</button>`
  ).join('');
  sbWrap.querySelectorAll('.status-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      state[activeId].status = btn.dataset.s;
      saveState(); updateChips(); renderBathDock();
      refreshEntity(activeId); openPanel(activeId);
    });
  });

  // Server
  const sel = document.getElementById('server-select');
  sel.value = st.server !== null ? String(st.server) : '';
  sel.closest('.panel-section').style.display =
    (e.type === 'fixture' || e.type === 'dj') ? 'none' : '';

  // Reserved
  const resSec = document.getElementById('reserved-section');
  resSec.style.display = (e.type === 'fixture' || e.type === 'dj' || e.type === 'stool') ? 'none' : '';
  const resBtn = document.getElementById('reserve-btn');
  resBtn.textContent = st.reserved ? '✅ Reserved — Click to Clear' : '🔴 Mark Reserved';
  resBtn.classList.toggle('active', st.reserved);

  // Orders
  document.getElementById('order-section').style.display = e.type === 'fixture' ? 'none' : '';
  renderOrderList(id);

  // Notes
  document.getElementById('panel-notes').value = st.notes || '';

  // Show panel
  document.getElementById('side-panel').classList.add('open');
  document.getElementById('overlay').classList.add('show');
}

function closePanel() {
  document.getElementById('side-panel').classList.remove('open');
  document.getElementById('overlay').classList.remove('show');
  activeId = null;
}

function renderOrderList(id) {
  const list = document.getElementById('order-list');
  const orders = state[id]?.orders || [];
  if (!orders.length) {
    list.innerHTML = '<div style="color:var(--text3);font-size:11px;padding:4px 0">No orders yet</div>';
    return;
  }
  list.innerHTML = orders.map((item, i) =>
    `<div class="order-item"><span>${item}</span><button class="order-item-remove" data-i="${i}">×</button></div>`
  ).join('');
  list.querySelectorAll('.order-item-remove').forEach(btn => {
    btn.addEventListener('click', () => {
      state[activeId].orders.splice(Number(btn.dataset.i), 1);
      saveState(); renderOrderList(activeId);
    });
  });
}

// ── EVENT WIRING ───────────────────────────────────────────────
function wireEvents() {
  document.getElementById('panel-close').addEventListener('click', closePanel);
  document.getElementById('overlay').addEventListener('click', closePanel);

  document.getElementById('server-select').addEventListener('change', e => {
    if (!activeId) return;
    state[activeId].server = e.target.value !== '' ? Number(e.target.value) : null;
    saveState(); refreshEntity(activeId);
  });

  document.getElementById('reserve-btn').addEventListener('click', () => {
    if (!activeId) return;
    state[activeId].reserved = !state[activeId].reserved;
    saveState(); refreshEntity(activeId); openPanel(activeId);
    toast(state[activeId].reserved ? `🔴 ${activeId} reserved` : `✅ ${activeId} cleared`);
  });

  document.querySelectorAll('.order-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (!activeId) return;
      state[activeId].orders.push(btn.dataset.item);
      saveState(); renderOrderList(activeId);
    });
  });

  document.getElementById('clear-order').addEventListener('click', () => {
    if (!activeId) return;
    state[activeId].orders = [];
    saveState(); renderOrderList(activeId);
  });

  document.getElementById('panel-notes').addEventListener('input', e => {
    if (!activeId) return;
    state[activeId].notes = e.target.value;
    saveState();
  });
}

// ── TOAST ──────────────────────────────────────────────────────
let toastTimer = null;
function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2400);
}

// ── INIT ───────────────────────────────────────────────────────
function init() {
  loadState();
  renderRoster();
  renderEntities();
  renderBathDock();
  updateChips();
  wireEvents();
  tickClock();
  setInterval(tickClock, 30000);
}

document.addEventListener('DOMContentLoaded', init);
