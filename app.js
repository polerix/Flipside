// ── FLIPSIDE BAR MANAGEMENT ─────────────────────────────────
'use strict';

// ── EDIT MODE ─────────────────────────────────────────────────
let editMode = false;
let positions = {};     // { [id]: { x, y } } — overrides ENTITIES defaults
let dragState = null;   // { id, el, startMouseX, startMouseY, startX, startY }

function loadPositions() {
  try {
    const raw = localStorage.getItem('flipside_positions');
    if (raw) positions = JSON.parse(raw);
  } catch(e) {}
}

function savePositions() {
  localStorage.setItem('flipside_positions', JSON.stringify(positions));
}

function getEntityPos(e) {
  return positions[e.id] || { x: e.x, y: e.y };
}

// ── SERVERS ───────────────────────────────────────────────────
const SERVERS = [
  { id: 0, name: 'Alex',  color: '#5b8dee' },
  { id: 1, name: 'Jordan', color: '#a855f7' },
  { id: 2, name: 'Sam',   color: '#f59e0b' },
  { id: 3, name: 'Riley', color: '#22c55e' },
  { id: 4, name: 'Morgan', color: '#ef4444' },
  { id: 5, name: 'Casey', color: '#06b6d4' },
];

// ── ENTITY DEFINITIONS ────────────────────────────────────────
// Positions are expressed as % of floor plan image dimensions (1227×816)
// so they scale with the responsive image. Adjust these to match your real layout.
const ENTITIES = [
  // ── INDOOR DINING TABLES ──
  { id:'T1', type:'table', zone:'indoor',  icon:'SVG/DiningTable.svg', x:19.0, y:54.0, w:52, h:52 },
  { id:'T2', type:'table', zone:'indoor',  icon:'SVG/DiningTable.svg', x:25.5, y:54.0, w:52, h:52 },
  { id:'T3', type:'table', zone:'indoor',  icon:'SVG/DiningTable.svg', x:32.0, y:54.0, w:52, h:52 },
  { id:'T4', type:'table', zone:'indoor',  icon:'SVG/DiningTable.svg', x:19.0, y:65.0, w:52, h:52 },
  { id:'T5', type:'table', zone:'indoor',  icon:'SVG/DiningTable.svg', x:25.5, y:65.0, w:52, h:52 },
  { id:'T6', type:'table', zone:'indoor',  icon:'SVG/DiningTable.svg', x:32.0, y:65.0, w:52, h:52 },
  { id:'T7', type:'table', zone:'indoor',  icon:'SVG/DiningTable.svg', x:38.5, y:54.0, w:52, h:52 },
  { id:'T8', type:'table', zone:'indoor',  icon:'SVG/DiningTable.svg', x:38.5, y:65.0, w:52, h:52 },

  // ── PATIO TABLES ──
  { id:'P1', type:'table', zone:'patio',   icon:'SVG/DiningTable.svg', x:55.0, y:72.0, w:52, h:52 },
  { id:'P2', type:'table', zone:'patio',   icon:'SVG/DiningTable.svg', x:63.0, y:72.0, w:52, h:52 },
  { id:'P3', type:'table', zone:'patio',   icon:'SVG/DiningTable.svg', x:71.0, y:72.0, w:52, h:52 },
  { id:'P4', type:'table', zone:'patio',   icon:'SVG/DiningTable.svg', x:79.0, y:72.0, w:52, h:52 },
  { id:'P5', type:'table', zone:'patio',   icon:'SVG/DiningTable.svg', x:87.0, y:72.0, w:52, h:52 },
  { id:'P6', type:'table', zone:'patio',   icon:'SVG/DiningTable.svg', x:55.0, y:84.0, w:52, h:52 },
  { id:'P7', type:'table', zone:'patio',   icon:'SVG/DiningTable.svg', x:63.0, y:84.0, w:52, h:52 },
  { id:'P8', type:'table', zone:'patio',   icon:'SVG/DiningTable.svg', x:71.0, y:84.0, w:52, h:52 },

  // ── BAR STOOLS ──
  { id:'A', type:'stool', zone:'bar', icon:'SVG/BarStool.svg', x:55.0, y:18.0, w:28, h:28 },
  { id:'B', type:'stool', zone:'bar', icon:'SVG/BarStool.svg', x:58.5, y:18.0, w:28, h:28 },
  { id:'C', type:'stool', zone:'bar', icon:'SVG/BarStool.svg', x:62.0, y:18.0, w:28, h:28 },
  { id:'D', type:'stool', zone:'bar', icon:'SVG/BarStool.svg', x:65.5, y:18.0, w:28, h:28 },
  { id:'E', type:'stool', zone:'bar', icon:'SVG/BarStool.svg', x:69.0, y:18.0, w:28, h:28 },
  { id:'F', type:'stool', zone:'bar', icon:'SVG/BarStool.svg', x:72.5, y:18.0, w:28, h:28 },
  { id:'G', type:'stool', zone:'bar', icon:'SVG/BarStool.svg', x:76.0, y:18.0, w:28, h:28 },
  { id:'H', type:'stool', zone:'bar', icon:'SVG/BarStool.svg', x:79.5, y:18.0, w:28, h:28 },
  { id:'I', type:'stool', zone:'bar', icon:'SVG/BarStool.svg', x:83.0, y:18.0, w:28, h:28 },
  { id:'J', type:'stool', zone:'bar', icon:'SVG/BarStool.svg', x:86.5, y:18.0, w:28, h:28 },

  // ── DJ BOOTH ──
  { id:'DJ', type:'dj', zone:'bar', icon:'SVG/DiningChair.svg', x:91.0, y:28.0, w:40, h:40 },

  // ── BATHROOM FIXTURES ──
  { id:'WC-T1', type:'fixture', zone:'restroom', icon:'SVG/BathroomToilet.svg',  x:5.0, y:52.0, w:28, h:28, label:'Toilet M' },
  { id:'WC-T2', type:'fixture', zone:'restroom', icon:'SVG/BathroomToilet.svg',  x:5.0, y:59.0, w:28, h:28, label:'Toilet F' },
  { id:'WC-U1', type:'fixture', zone:'restroom', icon:'SVG/BathroomUrinal.svg',  x:5.0, y:44.0, w:24, h:24, label:'Urinal' },
  { id:'WC-S1', type:'fixture', zone:'restroom', icon:'SVG/BathroomSink.svg',    x:5.0, y:66.0, w:26, h:26, label:'Sink M' },
  { id:'WC-S2', type:'fixture', zone:'restroom', icon:'SVG/BathroomSink.svg',    x:5.0, y:73.0, w:26, h:26, label:'Sink F' },
];

// ── STATE ──────────────────────────────────────────────────────
let state = {};
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

// ── RENDER SERVER ROSTER ───────────────────────────────────────
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

// ── BUILD ENTITY ELEMENT ────────────────────────────────────────
function buildEntity(e) {
  const st = state[e.id];
  const el = document.createElement('div');
  el.className = 'entity';
  el.dataset.id = e.id;
  el.dataset.status = st.reserved && e.type !== 'fixture' ? 'reserved' : st.status;
  if (st.server !== null) el.dataset.server = st.server;

  const iconWrap = document.createElement('div');
  iconWrap.className = 'entity-icon';

  const img = document.createElement('img');
  img.src = e.icon;
  img.width = e.w; img.height = e.h;
  img.draggable = false;

  // tint patio tables green
  if (e.zone === 'patio') img.style.filter = 'hue-rotate(120deg) saturate(1.5) brightness(.9)';
  // tint DJ chair purple
  if (e.type === 'dj') img.style.filter = 'hue-rotate(240deg) saturate(1.8) brightness(.85)';
  // fixtures
  if (e.type === 'fixture') img.style.filter = 'brightness(0) invert(.6)';

  iconWrap.appendChild(img);

  // reserved badge
  if (st.reserved && e.type !== 'fixture') {
    const badge = document.createElement('div');
    badge.className = 'reserve-badge'; badge.textContent = 'R';
    iconWrap.appendChild(badge);
  }

  el.appendChild(iconWrap);

  // label
  const lbl = document.createElement('div');
  lbl.className = 'entity-label';
  lbl.textContent = e.label || e.id;
  el.appendChild(lbl);

  // position — use saved override or default
  const pos = getEntityPos(e);
  el.style.left = `${pos.x}%`;
  el.style.top  = `${pos.y}%`;
  el.style.transform = 'translate(-50%, -50%)';

  el.addEventListener('click', (ev) => {
    if (editMode) return;   // clicks suppressed in edit mode
    openPanel(e.id);
  });

  // drag: attach in edit mode via delegation (see wireEditMode)
  el.addEventListener('mousedown', (ev) => {
    if (!editMode) return;
    ev.preventDefault();
    const canvas = document.getElementById('floor-canvas');
    const rect   = canvas.getBoundingClientRect();
    dragState = {
      id:          e.id,
      el,
      startMouseX: ev.clientX,
      startMouseY: ev.clientY,
      startX:      pos.x,
      startY:      pos.y,
      rectW:       rect.width,
      rectH:       rect.height,
    };
    el.classList.add('dragging');
  });

  return el;
}

// ── RENDER ALL ENTITIES ─────────────────────────────────────────
function renderEntities() {
  const container = document.getElementById('entities');
  container.innerHTML = '';
  ENTITIES.forEach(e => container.appendChild(buildEntity(e)));
}

function refreshEntity(id) {
  const existing = document.querySelector(`.entity[data-id="${id}"]`);
  const e = ENTITIES.find(x => x.id === id);
  if (!e || !existing) return;
  const fresh = buildEntity(e);
  existing.replaceWith(fresh);
}

// ── STATS CHIPS ────────────────────────────────────────────────
function updateChips() {
  const tables  = ENTITIES.filter(e => e.type === 'table' && e.zone === 'indoor');
  const patio   = ENTITIES.filter(e => e.type === 'table' && e.zone === 'patio');
  const stools  = ENTITIES.filter(e => e.type === 'stool');

  const seated  = id => ['seated','ordered','bill'].includes(state[id]?.status);
  const openSt  = id => state[id]?.status === 'open' && !state[id]?.reserved;

  const tSeat   = tables.filter(e => seated(e.id)).length;
  const pSeat   = patio.filter(e => seated(e.id)).length;
  const bOpen   = stools.filter(e => openSt(e.id)).length;

  document.getElementById('chip-indoor').textContent = `Indoor: ${tSeat}/${tables.length}`;
  document.getElementById('chip-patio').textContent  = `Patio: ${pSeat}/${patio.length}`;
  document.getElementById('chip-bar').textContent    = `Bar: ${bOpen} open`;
}

// ── BATHROOM DOCK ───────────────────────────────────────────────
function renderBathDock() {
  const fixtures = ENTITIES.filter(e => e.type === 'fixture');
  const dock = document.getElementById('bath-fixtures');
  dock.innerHTML = fixtures.map(e => {
    const out = state[e.id]?.status === 'outofservice';
    return `<div class="bath-fixture" data-fid="${e.id}">
      <img src="${e.icon}" alt="">
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
      toast(st.status === 'outofservice' ? `⚠️ ${fid} marked Out of Service` : `✅ ${fid} back in service`);
    });
  });
}

// ── PANEL ───────────────────────────────────────────────────────
function openPanel(id) {
  activeId = id;
  const e  = ENTITIES.find(x => x.id === id);
  const st = state[id];

  // header
  document.getElementById('panel-title').textContent = e.label || e.id;
  document.getElementById('panel-zone').textContent  =
    { indoor:'Indoor Dining', patio:'Patio', bar:'Bar', restroom:'Restroom', dj:'DJ Booth' }[e.zone] || e.zone;

  const iconWrap = document.getElementById('panel-icon');
  iconWrap.innerHTML = `<img src="${e.icon}" alt="">`;

  // status buttons
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

  // server select
  const sel = document.getElementById('server-select');
  sel.value = st.server !== null ? String(st.server) : '';
  const serverSec = document.getElementById('server-select').closest('.panel-section');
  serverSec.style.display = (e.type === 'fixture' || e.type === 'dj') ? 'none' : '';

  // reserved
  const resSec = document.getElementById('reserved-section');
  resSec.style.display = (e.type === 'fixture' || e.type === 'dj' || e.type === 'stool') ? 'none' : '';
  const resBtn = document.getElementById('reserve-btn');
  resBtn.textContent = st.reserved ? '✅ Reserved — Click to Clear' : '🔴 Mark Reserved';
  resBtn.classList.toggle('active', st.reserved);

  // order section
  const ordSec = document.getElementById('order-section');
  ordSec.style.display = e.type === 'fixture' ? 'none' : '';
  renderOrderList(id);

  // notes
  document.getElementById('panel-notes').value = st.notes || '';

  // show
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
  if (!orders.length) { list.innerHTML = '<div style="color:var(--text3);font-size:11px;padding:4px 0">No orders yet</div>'; return; }
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

// ── EVENT WIRING ────────────────────────────────────────────────
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
    toast(state[activeId].reserved ? `🔴 ${activeId} reserved` : `✅ ${activeId} reservation cleared`);
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

// ── EDIT MODE ENGINE ─────────────────────────────────────────────
function wireEditMode() {
  const btn      = document.getElementById('edit-mode-btn');
  const resetBtn = document.getElementById('reset-pos-btn');

  btn.addEventListener('click', () => {
    editMode = !editMode;
    document.body.classList.toggle('edit-mode', editMode);
    btn.classList.toggle('active', editMode);
    btn.textContent = editMode ? '💾 Save Layout' : '✏️ Edit Layout';
    resetBtn.style.display = editMode ? '' : 'none';

    if (!editMode) {
      savePositions();
      toast('✅ Layout saved!');
    } else {
      closePanel();
      toast('✏️ Edit Mode — drag entities to position them');
    }
  });

  resetBtn.addEventListener('click', () => {
    if (!confirm('Reset all entity positions to defaults?')) return;
    positions = {};
    savePositions();
    renderEntities();
    toast('↺ Positions reset to defaults');
  });

  // Global mouse move — update dragged entity position live
  document.addEventListener('mousemove', (ev) => {
    if (!dragState) return;
    const canvas = document.getElementById('floor-canvas');
    const rect   = canvas.getBoundingClientRect();
    const dx = ((ev.clientX - dragState.startMouseX) / dragState.rectW) * 100;
    const dy = ((ev.clientY - dragState.startMouseY) / dragState.rectH) * 100;
    const newX = Math.max(1, Math.min(99, dragState.startX + dx));
    const newY = Math.max(1, Math.min(99, dragState.startY + dy));
    dragState.el.style.left = `${newX}%`;
    dragState.el.style.top  = `${newY}%`;
  });

  // Global mouse up — commit position
  document.addEventListener('mouseup', (ev) => {
    if (!dragState) return;
    const canvas = document.getElementById('floor-canvas');
    const rect   = canvas.getBoundingClientRect();
    const dx = ((ev.clientX - dragState.startMouseX) / dragState.rectW) * 100;
    const dy = ((ev.clientY - dragState.startMouseY) / dragState.rectH) * 100;
    const newX = +Math.max(1, Math.min(99, dragState.startX + dx)).toFixed(2);
    const newY = +Math.max(1, Math.min(99, dragState.startY + dy)).toFixed(2);
    positions[dragState.id] = { x: newX, y: newY };
    dragState.el.classList.remove('dragging');
    dragState.el.style.transform = 'translate(-50%, -50%)';
    dragState = null;
  });
}

// ── TOAST ───────────────────────────────────────────────────────
let toastTimer = null;
function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2400);
}

// ── INIT ────────────────────────────────────────────────────────
function init() {
  loadPositions();
  loadState();
  renderRoster();
  renderEntities();
  renderBathDock();
  updateChips();
  wireEvents();
  wireEditMode();
  tickClock();
  setInterval(tickClock, 30000);
}

document.addEventListener('DOMContentLoaded', init);
