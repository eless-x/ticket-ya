'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const grid = $('#catalog-grid');
  const search = $('#catalog-search');
  const count = $('#results-count');
  const empty = $('#empty-state');
  const clearBtn = $('#clear-filters');
  const moodWrap = $('#mood-filters');
  const tagWrap = $('#tag-filters');
  const priceWrap = $('#price-filters');
  if (!grid) return;

  const params = new URLSearchParams(location.search);
  const state = {
    q: params.get('q') || '',
    mood: params.get('mood') || 'todos',
    tags: new Set((params.get('tags') || '').split(',').filter(Boolean)),
    price: params.get('price') || 'todos'
  };

  const PRICE_RANGES = {
    todos: { label: 'Todos', test: () => true },
    u50: { label: 'Hasta S/ 50', test: p => p <= 50 },
    u100: { label: 'Hasta S/ 100', test: p => p <= 100 },
    over100: { label: 'Más de S/ 100', test: p => p > 100 }
  };

  if (search) search.value = state.q;

  function renderChips() {
    if (moodWrap) {
      moodWrap.innerHTML = ['todos', ...Object.keys(MOODS)].map(m => {
        const label = m === 'todos' ? 'Todos' : MOODS[m];
        const active = state.mood === m;
        return `<button type="button" class="chip${active ? ' is-active' : ''}" data-mood="${m}" aria-pressed="${active}">${label}</button>`;
      }).join('');
    }
    if (tagWrap) {
      tagWrap.innerHTML = Object.entries(TAGS).map(([k, label]) => {
        const active = state.tags.has(k);
        return `<button type="button" class="chip${active ? ' is-active' : ''}" data-tag="${k}" aria-pressed="${active}">${label}</button>`;
      }).join('');
    }
    if (priceWrap) {
      priceWrap.innerHTML = Object.entries(PRICE_RANGES).map(([k, v]) => {
        const active = state.price === k;
        return `<button type="button" class="chip${active ? ' is-active' : ''}" data-price="${k}" aria-pressed="${active}">${v.label}</button>`;
      }).join('');
    }
  }

  function syncURL() {
    const p = new URLSearchParams();
    if (state.q) p.set('q', state.q);
    if (state.mood !== 'todos') p.set('mood', state.mood);
    if (state.tags.size) p.set('tags', [...state.tags].join(','));
    if (state.price !== 'todos') p.set('price', state.price);
    const qs = p.toString();
    history.replaceState(null, '', qs ? `${location.pathname}?${qs}` : location.pathname);
  }

  function filtered() {
    const q = norm(state.q.trim());
    return EVENTS.filter(e => {
      if (state.mood !== 'todos' && e.mood !== state.mood) return false;
      if (state.tags.size && ![...state.tags].every(t => e.tags.includes(t))) return false;
      if (!(PRICE_RANGES[state.price] || PRICE_RANGES.todos).test(e.price)) return false;
      if (q) {
        const hay = norm(`${e.title} ${e.venue} ${e.district} ${MOODS[e.mood]} ${e.tags.map(t => TAGS[t] || t).join(' ')}`);
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }

  function render() {
    const list = filtered();
    grid.innerHTML = list.map(cardHTML).join('');
    count.textContent = list.length ? `Mostrando ${list.length} de ${EVENTS.length} eventos` : '';
    empty.hidden = list.length > 0;
    grid.hidden = list.length === 0;
    syncURL();
    initReveal();
  }

  renderChips();
  render();

  moodWrap?.addEventListener('click', e => { const b = e.target.closest('[data-mood]'); if (!b) return; state.mood = b.dataset.mood; renderChips(); render(); });
  tagWrap?.addEventListener('click', e => { const b = e.target.closest('[data-tag]'); if (!b) return; const t = b.dataset.tag; state.tags.has(t) ? state.tags.delete(t) : state.tags.add(t); renderChips(); render(); });
  priceWrap?.addEventListener('click', e => { const b = e.target.closest('[data-price]'); if (!b) return; state.price = b.dataset.price; renderChips(); render(); });

  search?.addEventListener('input', debounce(e => { state.q = e.target.value; render(); }, 120));
  clearBtn?.addEventListener('click', () => {
    state.q = ''; state.mood = 'todos'; state.tags.clear(); state.price = 'todos';
    if (search) search.value = '';
    renderChips(); render();
    toast('Filtros limpiados. Mostrando toda la cartelera.');
  });

  $('#filter-toggle')?.addEventListener('click', () => {
    const panel = $('#filters-panel');
    const open = panel.classList.toggle('is-open');
    $('#filter-toggle').setAttribute('aria-expanded', String(open));
  });
});
