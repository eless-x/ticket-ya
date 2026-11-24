'use strict';

document.addEventListener('DOMContentLoaded', () => {
  /* ===== Hero panels ===== */
  const hero = $('#hero-visual');
  if (hero) {
    hero.innerHTML = HERO_IDS.map(id => {
      const e = byId(id);
      if (!e) return '';
      return `
      <article class="panel reveal" tabindex="0" data-id="${id}" aria-label="${escapeHTML(e.title)}">
        <img src="${IMG(e.img)}" alt="${escapeHTML(e.title)}" onerror="this.style.display='none'">
        <span class="match">${e.match}% match</span>
        <span class="panel-rail">${escapeHTML(e.title)}</span>
        <div class="panel-info">
          <div><small>${fmtDate(e.date)} · ${escapeHTML(e.venue)}</small><h3>${escapeHTML(e.title)}</h3></div>
          <button class="btn btn-primary" type="button" data-seat="${e.id}">Elegir asiento</button>
        </div>
      </article>`;
    }).join('');

    const panels = $$('.panel', hero);
    let active = 0;
    let timer = null;
    const activate = (i) => { active = i; panels.forEach((p, n) => p.classList.toggle('is-active', n === i)); };
    const stopAuto = () => clearInterval(timer);
    const startAuto = () => { if (reduceMotion()) return; stopAuto(); timer = setInterval(() => activate((active + 1) % panels.length), 4500); };
    panels.forEach((p, i) => {
      p.addEventListener('mouseenter', () => activate(i));
      p.addEventListener('focus', () => activate(i));
      p.addEventListener('click', e => { if (!e.target.closest('[data-seat]')) activate(i); });
      p.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { if (!e.target.closest('[data-seat]')) { e.preventDefault(); activate(i); } } });
    });
    hero.addEventListener('mouseenter', stopAuto);
    hero.addEventListener('mouseleave', () => { hero.style.setProperty('--mx', 0); hero.style.setProperty('--my', 0); startAuto(); });
    hero.addEventListener('focusin', stopAuto);
    hero.addEventListener('focusout', e => { if (!hero.contains(e.relatedTarget)) startAuto(); });
    hero.addEventListener('mousemove', ev => {
      if (reduceMotion()) return;
      const r = hero.getBoundingClientRect();
      hero.style.setProperty('--mx', (((ev.clientX - r.left) / r.width) * 2 - 1).toFixed(2));
      hero.style.setProperty('--my', (((ev.clientY - r.top) / r.height) * 2 - 1).toFixed(2));
    });
    if (panels.length) { activate(0); startAuto(); }
  }

  /* ===== Home preview grid ===== */
  const preview = $('#home-events');
  if (preview) {
    const items = EVENTS.slice(0, 4);
    preview.innerHTML = items.map(cardHTML).join('');
    initReveal();
  }

  /* ===== Mood quick filter -> cartelera ===== */
  $$('.chip[data-mood-link]').forEach(chip => {
    chip.addEventListener('click', () => {
      const mood = chip.dataset.moodLink;
      const url = mood && mood !== 'todos' ? `cartelera.html?mood=${encodeURIComponent(mood)}` : 'cartelera.html';
      window.location.href = url;
    });
  });

  /* ===== Armar parche ===== */
  const splitSelect = $('#split-event');
  let people = 4;
  if (splitSelect) {
    splitSelect.innerHTML = EVENTS.map(e => `<option value="${e.id}">${escapeHTML(e.title)} (${money(e.price)} c/u)</option>`).join('');
    const pre = new URLSearchParams(location.search).get('event');
    if (pre && byId(pre)) splitSelect.value = String(pre);
    else splitSelect.value = '2';

    const updateSplit = () => {
      const ev = byId(splitSelect.value);
      if (!ev) return;
      const each = ev.price * 0.9;
      $('#split-count').textContent = String(people);
      $('#split-per').textContent = money(each);
      $('#split-total').textContent = `Total del grupo: ${money(each * people)}`;
    };
    $('#split-minus')?.addEventListener('click', () => { people = Math.max(2, people - 1); updateSplit(); });
    $('#split-plus')?.addEventListener('click', () => { people = Math.min(10, people + 1); updateSplit(); });
    splitSelect.addEventListener('change', updateSplit);
    $('#copy-link')?.addEventListener('click', async () => {
      const link = `${location.origin}${location.pathname.replace(/[^/]*$/, '')}experiencias.html?tab=fan-to-fan&event=${splitSelect.value}&people=${people}`;
      try { await navigator.clipboard.writeText(link); toast('Enlace copiado. Compártelo con tu grupo y cada uno paga su parte.'); }
      catch { toast('No pudimos copiar automáticamente. Copia el enlace desde la barra del navegador.', 'error'); }
    });
    updateSplit();
  }

  /* ===== Resale preview ===== */
  const resaleList = $('#resale-list');
  if (resaleList) {
    const items = (store.get('ty_resale', RESALE_DEFAULT)).slice(0, 3);
    resaleList.innerHTML = items.map(r => {
      const e = byId(r.eventId);
      if (!e) return '';
      return `<li>
        <div>
          <h4>${escapeHTML(e.title)}</h4>
          <p class="small"><span class="price-tag">${money(r.price)} sin recargo</span> · ${escapeHTML(r.zone)} · Liberada por ${escapeHTML(r.user)}</p>
        </div>
        <a class="btn btn-primary btn-sm" href="experiencias.html?tab=fan-to-fan">Ver en Fan-to-Fan</a>
      </li>`;
    }).join('');
  }

  /* ===== Chat assistant ===== */
  const chatWin = $('#chat-window');
  const chatToggle = $('#chat-toggle');
  const messages = $('#chat-messages');
  if (chatWin && chatToggle && messages) {
    const setChat = (open) => { chatWin.hidden = !open; chatToggle.setAttribute('aria-expanded', String(open)); if (open) $('#chat-input')?.focus(); };
    chatToggle.addEventListener('click', () => setChat(chatWin.hidden));
    $('#chat-close')?.addEventListener('click', () => setChat(false));
    $$('[data-open-chat]').forEach(b => b.addEventListener('click', () => setChat(true)));

    const addMsg = (who, text) => { const div = document.createElement('div'); div.className = `msg ${who}`; div.textContent = text; messages.appendChild(div); messages.scrollTop = messages.scrollHeight; return div; };
    const listEvents = arr => arr.map(e => `- ${e.title}, ${fmtDate(e.date)}, ${e.venue} (${money(e.price)})`).join('\n');
    const reply = (query) => {
      const q = norm(query);
      const topMatch = list => [...list].sort((a, b) => b.match - a.match);
      if (/finde|fin de semana|proximo|pronto/.test(q)) return `Estos son los próximos eventos:\n${listEvents(EVENTS.slice(0, 3))}`;
      if (/\d+|presupuesto|barato|economico/.test(q)) {
        const budget = +(q.match(/\d+/) || [100])[0];
        const fit = topMatch(EVENTS.filter(e => e.price <= budget)).slice(0, 3);
        return fit.length ? `Con ${money(budget)} te alcanza para:\n${listEvents(fit)}` : `Las entradas más económicas empiezan en ${money(Math.min(...EVENTS.map(e => e.price)))}.`;
      }
      if (/vista|360|asiento|zona/.test(q)) return 'Pulsa "Elegir asiento" en cualquier evento. Puedes alternar entre VIP, Campo y Tribuna para ver distancia, energía y precio antes de comprar.';
      if (/parche|amigos|grupal|dividir/.test(q)) return 'En "Armar parche" eliges evento y de 2 a 10 personas. Cada una paga su parte con 10% de descuento mediante enlace.';
      if (/fan|reventa|qr/.test(q)) return 'En Experiencias > Fan-to-Fan puedes comprar entradas liberadas al precio original o publicar la tuya si no puedes asistir.';
      if (/meet|artista|famoso/.test(q)) return 'En Experiencias > Meet & Greet puedes solicitar pases con artistas y famosos, con cupos limitados y confirmación por correo.';
      const moodKey = /fiesta|euforia|musica|concierto/.test(q) ? 'euforia' : /teatro|cultura|relax|chill/.test(q) ? 'cultura' : /adrenalina|deporte|gamer|esports/.test(q) ? 'adrenalina' : /aprender|taller|gastronom|libro/.test(q) ? 'aprender' : null;
      if (moodKey) return `Opciones de ${MOODS[moodKey].toLowerCase()}:\n${listEvents(topMatch(EVENTS.filter(e => e.mood === moodKey)).slice(0, 3))}`;
      return `Te recomiendo estos eventos:\n${listEvents(topMatch(EVENTS).slice(0, 3))}`;
    };
    const ask = (text) => {
      addMsg('user', text);
      const wait = addMsg('bot', 'Buscando opciones...');
      setTimeout(() => { wait.textContent = reply(text); messages.scrollTop = messages.scrollHeight; }, reduceMotion() ? 0 : 450);
    };
    $('#chat-form')?.addEventListener('submit', ev => { ev.preventDefault(); const input = $('#chat-input'); const text = input.value.trim(); if (!text) return; input.value = ''; ask(text); });
    $$('[data-prompt]').forEach(b => b.addEventListener('click', () => ask(b.dataset.prompt)));
  }
});
