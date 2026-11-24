'use strict';

/* ===== Helpers ===== */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const money = n => `S/ ${Number(n).toFixed(2)}`;
const byId = id => EVENTS.find(e => e.id === Number(id));
const norm = s => String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
const MONTHS = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
const fmtDate = iso => { const [, m, d] = String(iso).split('-'); return `${d || ''} ${MONTHS[(+m || 1) - 1] || ''}`; };
const stockLabel = sold => (sold >= 85 ? ['Últimas entradas', true] : sold >= 70 ? ['Pocas entradas', false] : ['Disponible', false]);
const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const debounce = (fn, ms = 180) => { let t; return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); }; };
const uid = (p = 'id') => `${p}-${Math.random().toString(36).slice(2, 9)}`;
const escapeHTML = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/* ===== Toast ===== */
let toastTimer;
function toast(msg, type = 'ok') {
  const el = $('#toast');
  if (!el) return;
  el.textContent = msg;
  el.dataset.type = type;
  el.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.hidden = true; }, 3600);
}

/* ===== Mobile nav ===== */
function initNav() {
  const toggle = $('#nav-toggle');
  const nav = $('#site-nav');
  if (!toggle || !nav) return;
  const close = () => { toggle.setAttribute('aria-expanded', 'false'); toggle.setAttribute('aria-label', 'Abrir menú'); nav.classList.remove('is-open'); document.body.classList.remove('nav-open'); };
  const open = () => { toggle.setAttribute('aria-expanded', 'true'); toggle.setAttribute('aria-label', 'Cerrar menú'); nav.classList.add('is-open'); document.body.classList.add('nav-open'); };
  toggle.addEventListener('click', () => (nav.classList.contains('is-open') ? close() : open()));
  nav.addEventListener('click', e => { if (e.target.closest('a')) close(); });
  document.addEventListener('click', e => { if (nav.classList.contains('is-open') && !nav.contains(e.target) && !toggle.contains(e.target)) close(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && nav.classList.contains('is-open')) { close(); toggle.focus(); } });
  window.addEventListener('resize', () => { if (window.innerWidth > 1024) close(); });

  const path = location.pathname.split('/').pop() || 'index.html';
  $$('a[data-nav]', nav).forEach(a => {
    const href = (a.getAttribute('href') || '').split('#')[0] || 'index.html';
    const active = href === path || (path === '' && href === 'index.html');
    a.classList.toggle('is-current', active);
    if (active) a.setAttribute('aria-current', 'page');
  });
}

/* ===== Reveal animations ===== */
function initReveal() {
  const items = $$('.reveal');
  if (!items.length) return;
  if (reduceMotion() || !('IntersectionObserver' in window)) {
    items.forEach(el => el.classList.add('is-visible'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  items.forEach(el => io.observe(el));
}

/* ===== Modals ===== */
let lastFocus = null;
function openModal(modal) {
  if (!modal) return;
  lastFocus = document.activeElement;
  modal.hidden = false;
  document.body.style.overflow = 'hidden';
  const focusable = $('[data-close], button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])', modal);
  if (focusable) focusable.focus();
}
function closeModal(modal) {
  if (!modal || modal.hidden) return;
  modal.hidden = true;
  if (!$$('.modal:not([hidden])').length) document.body.style.overflow = '';
  if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
}
function initModals() {
  $$('.modal').forEach(m => {
    m.addEventListener('click', ev => { if (ev.target === m || ev.target.closest('[data-close]')) closeModal(m); });
  });
  document.addEventListener('keydown', ev => {
    if (ev.key === 'Escape') $$('.modal:not([hidden])').forEach(closeModal);
  });
  $$('[data-open]').forEach(b => b.addEventListener('click', () => {
    const id = b.dataset.open;
    const modal = document.getElementById(id);
    if (modal) openModal(modal);
  }));
}

/* ===== Seat modal ===== */
let seatEvent = null;
let seatZone = 'vip';
function renderZones() {
  const wrap = $('#zones');
  if (!wrap || !seatEvent) return;
  wrap.innerHTML = Object.entries(ZONES).map(([key, z]) => `
    <button class="zone-btn${key === seatZone ? ' is-active' : ''}" type="button" data-zone="${key}" aria-pressed="${key === seatZone}">
      <b>${z.name}</b><span>${money(seatEvent.price * z.mult)}</span>
    </button>`).join('');
}
function selectZone(key) {
  const z = ZONES[key];
  if (!z || !seatEvent) return;
  seatZone = key;
  $$('.zone-btn').forEach(b => { const on = b.dataset.zone === key; b.classList.toggle('is-active', on); b.setAttribute('aria-pressed', on); });
  const vp = $('#viewport');
  if (vp) { vp.style.setProperty('--bg-mid', z.mid); vp.style.setProperty('--bg-top', z.top); vp.style.setProperty('--zone', z.top); }
  const stage = $('#vp-stage'); if (stage) stage.style.transform = `scale(${z.scale})`;
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  set('vp-zone', z.name); set('vp-energy', z.energy); set('vp-distance', `Distancia: ${z.dist}`); set('vp-desc', z.desc);
}
function openSeat(id) {
  seatEvent = byId(id);
  const modal = $('#seat-modal');
  if (!seatEvent || !modal) return;
  const title = $('#seat-title'); if (title) title.textContent = seatEvent.title;
  seatZone = 'vip';
  renderZones();
  selectZone('vip');
  openModal(modal);
}
function initSeatModal() {
  const zones = $('#zones');
  if (zones) zones.addEventListener('click', ev => { const b = ev.target.closest('[data-zone]'); if (b) selectZone(b.dataset.zone); });
  const confirm = $('#confirm-seat');
  if (confirm) confirm.addEventListener('click', () => {
    if (!seatEvent) return;
    const name = ZONES[seatZone]?.name || 'zona seleccionada';
    closeModal($('#seat-modal'));
    toast(`Entrada reservada en ${name} para ${seatEvent.title}. Te enviamos el QR a tu correo.`);
  });
  document.addEventListener('click', ev => {
    const b = ev.target.closest('[data-seat]');
    if (b) { ev.preventDefault(); openSeat(b.dataset.seat); }
  });
}

/* ===== Event card ===== */
function cardHTML(e, opts = {}) {
  const [stock, hot] = stockLabel(e.sold);
  const tag = (e.tags || [])[0];
  return `
  <article class="card reveal" data-mood="${e.mood}">
    <div class="thumb" data-title="${escapeHTML(e.title)}">
      <img src="${IMG(e.img)}" alt="${escapeHTML(e.title)}" loading="lazy" onerror="this.closest('.thumb').classList.add('img-fail');this.remove();">
      <span class="mood-tag">${MOODS[e.mood] || ''}</span>
      <span class="match-tag">${e.match}% match</span>
    </div>
    <div class="card-body">
      <div class="card-meta"><span>${fmtDate(e.date)} · ${e.time}</span><span class="status${hot ? ' hot' : ''}">${stock}</span></div>
      <h3>${escapeHTML(e.title)}</h3>
      <p class="venue">${escapeHTML(e.venue)}</p>
      ${tag ? `<div class="tag-row"><span class="tag">${escapeHTML(TAGS[tag] || tag)}</span>${e.tags.slice(1,2).map(t => `<span class="tag">${escapeHTML(TAGS[t] || t)}</span>`).join('')}</div>` : ''}
      <div class="meter">
        <div class="meter-row"><span>Aforo vendido</span><b>${e.sold}%</b></div>
        <div class="bar"><i style="width:${e.sold}%"></i></div>
      </div>
      <div class="card-foot">
        <div class="price"><small>Desde</small><strong>${money(e.price)}</strong></div>
        <button class="card-btn" type="button" data-seat="${e.id}">Elegir asiento</button>
      </div>
    </div>
  </article>`;
}

/* ===== Form helpers ===== */
function setFieldError(input, msg) {
  const field = input.closest('.field');
  let err = field ? $('.field-error', field) : null;
  if (!err) {
    const wrap = input.closest('label')?.parentElement || input.parentElement;
    err = wrap ? $('.field-error', wrap) : null;
  }
  if (err) err.textContent = msg || '';
  input.setAttribute('aria-invalid', msg ? 'true' : 'false');
  if (field) field.classList.toggle('has-error', !!msg);
  const check = input.closest('.field-check');
  if (check) check.classList.toggle('has-error', !!msg);
}
function clearFormErrors(form) { $$('.field-error', form).forEach(e => e.textContent = ''); $$('input,select,textarea', form).forEach(i => { i.setAttribute('aria-invalid', 'false'); i.closest('.field')?.classList.remove('has-error'); }); }
function validateEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v); }
function validateField(input) {
  const v = input.value.trim();
  const name = input.name;
  let msg = '';
  if (input.required && !v) msg = 'Este campo es obligatorio.';
  else if (input.type === 'email' && v && !validateEmail(v)) msg = 'Ingresa un correo válido (ej. nombre@correo.com).';
  else if (input.minLength > 0 && v.length < input.minLength) msg = `Debe tener al menos ${input.minLength} caracteres.`;
  else if (input.maxLength > 0 && input.maxLength < 10000 && v.length > input.maxLength) msg = `Máximo ${input.maxLength} caracteres.`;
  else if (input.type === 'checkbox' && input.required && !input.checked) msg = 'Debes aceptar para continuar.';
  else if (name === 'precio' && v) { const n = Number(v); if (!Number.isFinite(n) || n <= 0) msg = 'Ingresa un precio válido.'; }
  else if (name === 'cantidad' && v) { const n = Number(v); const min = Number(input.min||1); const max = Number(input.max||99); if (!Number.isInteger(n) || n < min || n > max) msg = `Ingresa una cantidad entre ${min} y ${max}.`; }
  setFieldError(input, msg);
  return !msg;
}
function validateForm(form) {
  clearFormErrors(form);
  let firstInvalid = null;
  $$('input,select,textarea', form).forEach(input => {
    if (input.disabled || input.type === 'submit' || input.type === 'button' || input.type === 'hidden') return;
    const ok = validateField(input);
    if (!ok && !firstInvalid) firstInvalid = input;
  });
  if (firstInvalid) { firstInvalid.focus(); return false; }
  return true;
}
function bindFormValidation(form) {
  $$('input,select,textarea', form).forEach(input => {
    const ev = input.type === 'checkbox' || input.tagName === 'SELECT' ? 'change' : 'blur';
    input.addEventListener(ev, () => validateField(input));
    input.addEventListener('input', () => { if (input.getAttribute('aria-invalid') === 'true') validateField(input); });
  });
}
async function simulateSubmit(btn, fn) {
  if (!btn || btn.disabled) return;
  const orig = btn.textContent;
  btn.disabled = true;
  btn.classList.add('is-loading');
  btn.textContent = 'Procesando...';
  try {
    await new Promise(r => setTimeout(r, reduceMotion() ? 0 : 650));
    await fn();
  } finally {
    btn.disabled = false;
    btn.classList.remove('is-loading');
    btn.textContent = orig;
  }
}

/* ===== Storage ===== */
const store = {
  get(key, fallback) { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; } },
  set(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* ignore quota */ } }
};

/* ===== Tabs ===== */
function initTabs(root = document) {
  $$('[data-tabs]', root).forEach(group => {
    const tabs = $$('[role="tab"]', group);
    const panels = tabs.map(t => document.getElementById(t.getAttribute('aria-controls'))).filter(Boolean);
    const activate = (tab, focus = false) => {
      tabs.forEach(t => { const on = t === tab; t.setAttribute('aria-selected', on); t.tabIndex = on ? 0 : -1; t.classList.toggle('is-active', on); });
      panels.forEach(p => { const on = p.id === tab.getAttribute('aria-controls'); p.hidden = !on; p.classList.toggle('is-active', on); });
      if (focus) tab.focus();
    };
    tabs.forEach((tab, i) => {
      tab.addEventListener('click', () => activate(tab));
      tab.addEventListener('keydown', e => {
        let n = i;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') n = (i + 1) % tabs.length;
        else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') n = (i - 1 + tabs.length) % tabs.length;
        else if (e.key === 'Home') n = 0;
        else if (e.key === 'End') n = tabs.length - 1;
        else return;
        e.preventDefault(); activate(tabs[n], true);
      });
    });
    const initial = tabs.find(t => t.classList.contains('is-active')) || tabs[0];
    if (initial) activate(initial);
  });
}

/* ===== Accordions ===== */
function initAccordions(root = document) {
  $$('[data-accordion]', root).forEach(acc => {
    $$('.acc-trigger', acc).forEach(btn => {
      if (btn.dataset.accBound) return;
      btn.dataset.accBound = '1';
      const panel = document.getElementById(btn.getAttribute('aria-controls'));
      btn.addEventListener('click', () => {
        const open = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', String(!open));
        btn.classList.toggle('is-open', !open);
        if (panel) { panel.hidden = open; panel.classList.toggle('is-open', !open); }
      });
    });
  });
}

/* ===== Boot ===== */
document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initModals();
  initSeatModal();
  initTabs();
  initAccordions();
  initReveal();
  document.body.classList.add('is-ready');
});
