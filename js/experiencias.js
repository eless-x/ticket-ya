'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(location.search);
  const tabParam = params.get('tab');

  /* ===== Tabs activation by URL/hash ===== */
  const activateTabById = (id) => {
    const tab = document.querySelector(`[role="tab"][aria-controls="${id}"]`);
    if (tab) tab.click();
  };
  if (tabParam === 'fan-to-fan') activateTabById('panel-fan');
  if (tabParam === 'meet-greet' || location.hash === '#meet-greet') activateTabById('panel-meet');
  if (location.hash === '#fan-to-fan') activateTabById('panel-fan');

  /* ===== Fan-to-Fan ===== */
  const resaleKey = 'ty_resale';
  const getResale = () => store.get(resaleKey, RESALE_DEFAULT.slice());
  const setResale = (items) => store.set(resaleKey, items);

  const resaleList = $('#resale-list');
  const resaleSearch = $('#resale-search');
  const resaleZone = $('#resale-zone');
  const resaleEmpty = $('#resale-empty');
  const resaleCount = $('#resale-count');
  const resaleState = { q: '', zone: 'todas' };

  function renderResale() {
    if (!resaleList) return;
    const items = getResale();
    const q = norm(resaleState.q);
    const list = items.filter(r => {
      const e = byId(r.eventId);
      if (!e) return false;
      if (resaleState.zone !== 'todas' && r.zone !== resaleState.zone) return false;
      if (q) {
        const hay = norm(`${e.title} ${e.venue} ${r.zone} ${r.user} ${MOODS[e.mood]}`);
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    resaleList.innerHTML = list.map(r => {
      const e = byId(r.eventId);
      return `<article class="resale-card reveal">
        <div class="resale-main">
          <span class="mood-tag mood-tag-${e.mood}">${MOODS[e.mood]}</span>
          <h4>${escapeHTML(e.title)}</h4>
          <p class="small">${fmtDate(e.date)} · ${escapeHTML(e.venue)}</p>
          <p class="small"><span class="price-tag">${money(r.price)} sin recargo</span> · ${escapeHTML(r.zone)} · Liberada por ${escapeHTML(r.user)}</p>
        </div>
        <div class="resale-actions">
          <button class="btn btn-primary btn-sm" type="button" data-buy-resale="${r.id}">Adquirir QR</button>
        </div>
      </article>`;
    }).join('');
    resaleCount.textContent = list.length ? `${list.length} entrada(s) disponible(s)` : '';
    resaleEmpty.hidden = list.length > 0;
    resaleList.hidden = list.length === 0;
    initReveal();
  }

  resaleSearch?.addEventListener('input', debounce(e => { resaleState.q = e.target.value; renderResale(); }, 120));
  resaleZone?.addEventListener('change', e => { resaleState.zone = e.target.value; renderResale(); });
  renderResale();

  /* Buy resale modal/form */
  const buyModal = $('#buy-modal');
  const buyForm = $('#buy-form');
  let buyingResale = null;
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-buy-resale]');
    if (!b) return;
    buyingResale = getResale().find(r => r.id === b.dataset.buyResale);
    if (!buyingResale) return;
    const ev = byId(buyingResale.eventId);
    $('#buy-event-name').textContent = ev ? ev.title : 'Evento';
    $('#buy-event-detail').textContent = ev ? `${buyingResale.zone} · ${money(buyingResale.price)} sin recargo` : '';
    buyForm?.reset();
    clearFormErrors(buyForm);
    openModal(buyModal);
  });
  buyForm?.addEventListener('submit', async e => {
    e.preventDefault();
    if (!validateForm(buyForm) || !buyingResale) return;
    await simulateSubmit($('[type="submit"]', buyForm), () => {
      const items = getResale().filter(r => r.id !== buyingResale.id);
      setResale(items);
      closeModal(buyModal);
      renderResale();
      toast('Entrada adquirida. Se generó un nuevo QR a tu nombre y el anterior fue anulado.');
      buyForm.reset();
    });
  });
  bindFormValidation(buyForm);

  /* Publish resale */
  const publishForm = $('#publish-form');
  const publishEvent = $('#publish-event');
  if (publishEvent) {
    publishEvent.innerHTML = '<option value="">Selecciona un evento</option>' + EVENTS.map(e => `<option value="${e.id}">${escapeHTML(e.title)} — ${money(e.price)}</option>`).join('');
  }
  publishForm?.addEventListener('submit', async e => {
    e.preventDefault();
    if (!validateForm(publishForm)) return;
    const fd = new FormData(publishForm);
    const eventId = Number(fd.get('eventId'));
    const ev = byId(eventId);
    const price = Number(fd.get('precio'));
    if (ev && price > ev.price) {
      setFieldError($('#publish-precio'), `El precio no puede superar el valor original (${money(ev.price)}).`);
      $('#publish-precio').focus();
      return;
    }
    await simulateSubmit($('[type="submit"]', publishForm), () => {
      const items = getResale();
      items.unshift({ id: uid('r'), eventId, user: '@fan_ticketya', zone: String(fd.get('zona')), price });
      setResale(items);
      renderResale();
      publishForm.reset();
      clearFormErrors(publishForm);
      toast('Tu entrada fue publicada en Fan-to-Fan al precio original. Te avisaremos cuando se venda.');
    });
  });
  if (publishForm) {
    bindFormValidation(publishForm);
    $('#publish-precio')?.addEventListener('input', () => {
      const ev = byId(publishEvent?.value);
      const hint = $('#publish-price-hint');
      if (hint) hint.textContent = ev ? `Precio máximo permitido: ${money(ev.price)} (precio original).` : 'Selecciona un evento para ver el precio máximo.';
    });
    publishEvent?.addEventListener('change', () => $('#publish-precio')?.dispatchEvent(new Event('input')));
  }

  /* ===== Meet & Greet ===== */
  const meetGrid = $('#meet-grid');
  const meetSearch = $('#meet-search');
  const meetCat = $('#meet-category');
  const meetEmpty = $('#meet-empty');
  const meetCount = $('#meet-count');
  const meetState = { q: '', cat: 'todas' };

  function renderMeet() {
    if (!meetGrid) return;
    const q = norm(meetState.q);
    const list = MEET_GREET.filter(m => {
      if (meetState.cat !== 'todas' && m.category !== meetState.cat) return false;
      if (q) {
        const ev = byId(m.eventId);
        const hay = norm(`${m.artist} ${m.role} ${m.category} ${ev?.title || ''} ${m.perks.join(' ')}`);
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    meetGrid.innerHTML = list.map(m => {
      const ev = byId(m.eventId);
      return `<article class="meet-card reveal">
        <div class="meet-media">
          <img src="${IMG(m.img)}" alt="${escapeHTML(m.artist)}" loading="lazy" onerror="this.style.display='none'">
          <span class="mood-tag">${escapeHTML(m.category)}</span>
        </div>
        <div class="meet-body">
          <h3>${escapeHTML(m.artist)}</h3>
          <p class="venue">${escapeHTML(m.role)} · ${ev ? escapeHTML(ev.title) : 'Evento'}</p>
          <ul class="perk-list">${m.perks.map(p => `<li>${escapeHTML(p)}</li>`).join('')}</ul>
          <div class="meet-foot">
            <div class="price"><small>${m.slots} cupos disponibles</small><strong>${money(m.price)}</strong></div>
            <button class="btn btn-primary btn-sm" type="button" data-meet="${m.id}">Solicitar pase</button>
          </div>
        </div>
      </article>`;
    }).join('');
    meetCount.textContent = list.length ? `${list.length} experiencia(s)` : '';
    meetEmpty.hidden = list.length > 0;
    meetGrid.hidden = list.length === 0;
    initReveal();
  }

  meetSearch?.addEventListener('input', debounce(e => { meetState.q = e.target.value; renderMeet(); }, 120));
  meetCat?.addEventListener('change', e => { meetState.cat = e.target.value; renderMeet(); });
  renderMeet();

  /* Meet modal */
  const meetModal = $('#meet-modal');
  const meetForm = $('#meet-form');
  let currentMeet = null;
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-meet]');
    if (!b) return;
    currentMeet = MEET_GREET.find(m => m.id === b.dataset.meet);
    if (!currentMeet) return;
    const ev = byId(currentMeet.eventId);
    $('#meet-artist-name').textContent = currentMeet.artist;
    $('#meet-artist-detail').textContent = `${currentMeet.role} · ${ev ? ev.title : ''} · ${money(currentMeet.price)}`;
    $('#meet-id').value = currentMeet.id;
    meetForm?.reset();
    $('#meet-id').value = currentMeet.id;
    clearFormErrors(meetForm);
    openModal(meetModal);
  });
  meetForm?.addEventListener('submit', async e => {
    e.preventDefault();
    if (!validateForm(meetForm) || !currentMeet) return;
    await simulateSubmit($('[type="submit"]', meetForm), () => {
      closeModal(meetModal);
      toast(`Solicitud enviada para Meet & Greet con ${currentMeet.artist}. Te confirmaremos por correo.`);
      meetForm.reset();
    });
  });
  bindFormValidation(meetForm);
});
