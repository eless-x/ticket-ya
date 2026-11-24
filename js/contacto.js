'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(location.search);
  const tab = params.get('tab');
  if (tab === 'publicar') {
    const t = document.querySelector('[role="tab"][aria-controls="panel-publicar"]');
    if (t) t.click();
  }
  if (tab === 'faq' || location.hash === '#faq') {
    const t = document.querySelector('[role="tab"][aria-controls="panel-faq"]');
    if (t) t.click();
  }

  /* Support form */
  const supportForm = $('#support-form');
  if (supportForm) {
    bindFormValidation(supportForm);
    supportForm.addEventListener('submit', async e => {
      e.preventDefault();
      if (!validateForm(supportForm)) return;
      await simulateSubmit($('[type="submit"]', supportForm), () => {
        const fd = new FormData(supportForm);
        toast(`Gracias, ${String(fd.get('nombre')).split(' ')[0] || 'fan'}. Recibimos tu mensaje y responderemos en menos de 24 horas hábiles.`);
        supportForm.reset();
        clearFormErrors(supportForm);
        const ok = $('#support-success');
        if (ok) { ok.hidden = false; ok.textContent = 'Mensaje enviado correctamente. Revisa tu correo para la confirmación.'; setTimeout(() => { ok.hidden = true; }, 6000); }
      });
    });
  }

  /* Publish event form */
  const publishEventForm = $('#event-publish-form');
  if (publishEventForm) {
    bindFormValidation(publishEventForm);
    publishEventForm.addEventListener('submit', async e => {
      e.preventDefault();
      if (!validateForm(publishEventForm)) return;
      await simulateSubmit($('[type="submit"]', publishEventForm), () => {
        toast('Solicitud recibida. Nuestro equipo comercial te contactará para validar tu evento.');
        publishEventForm.reset();
        clearFormErrors(publishEventForm);
        const ok = $('#publish-success');
        if (ok) { ok.hidden = false; ok.textContent = 'Propuesta enviada. Te responderemos en 1 a 2 días hábiles con los siguientes pasos.'; setTimeout(() => { ok.hidden = true; }, 7000); }
      });
    });
  }

  /* FAQ render */
  const faqWrap = $('#faq-list');
  if (faqWrap) {
    faqWrap.innerHTML = FAQS.map((f, i) => {
      const id = `faq-${i}`;
      return `<div class="acc-item">
        <h3 class="acc-heading">
          <button class="acc-trigger" type="button" aria-expanded="false" aria-controls="${id}-panel" id="${id}-btn">
            <span>${escapeHTML(f.q)}</span>
            <svg class="acc-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>
          </button>
        </h3>
        <div class="acc-panel" id="${id}-panel" role="region" aria-labelledby="${id}-btn" hidden>
          <p>${escapeHTML(f.a)}</p>
        </div>
      </div>`;
    }).join('');
    initAccordions(faqWrap);
  }
});
