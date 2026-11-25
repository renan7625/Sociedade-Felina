/* ==========================================================================
   TRACKING.JS — Consentimento (LGPD), tags de rastreamento e UTMs
   --------------------------------------------------------------------------
   O que este arquivo faz:
   1. Mostra o banner de cookies (Aceitar tudo / Recusar / Gerenciar).
   2. SÓ carrega GA4, Meta Pixel e Clarity DEPOIS do consentimento da categoria:
        • Estatísticas  → GA4 + Microsoft Clarity (mapas de calor/gravações)
        • Marketing     → Meta Pixel
   3. Guarda as UTMs da visita e as repassa aos links de checkout da Hotmart.
   4. Expõe window.SF.track(...) para disparar eventos de forma segura.
   A COMPRA (conversão) NÃO é medida aqui: fica com o rastreamento nativo da Hotmart.

   Você NÃO precisa editar este arquivo: os IDs ficam em config.js.
   ========================================================================== */
(function () {
  'use strict';

  var C = window.SITE_CONFIG || {};
  var T = C.tracking || {};
  var KEY = 'sf_consent_v1';          // chave do consentimento no localStorage
  var UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
  var loaded = { ga: false, px: false, cl: false };

  /* ---------------------------- utilidades ---------------------------- */
  function idle(fn) {                 // roda fora do caminho crítico de renderização
    if ('requestIdleCallback' in window) requestIdleCallback(fn, { timeout: 2500 });
    else setTimeout(fn, 800);
  }
  function loadScript(src) {
    var s = document.createElement('script');
    s.async = true; s.src = src;
    document.head.appendChild(s);
  }
  function read() { try { return JSON.parse(localStorage.getItem(KEY)); } catch (e) { return null; } }
  function write(c) { try { localStorage.setItem(KEY, JSON.stringify(c)); } catch (e) {} }

  /* ------------------------------ UTMs -------------------------------- */
  // Guardadas em sessionStorage (só dura a aba aberta). Novas UTMs na URL sobrescrevem.
  var utm = {};
  try { utm = JSON.parse(sessionStorage.getItem('sf_utm') || '{}'); } catch (e) {}
  var qs = new URLSearchParams(location.search);
  UTM_KEYS.forEach(function (k) { if (qs.get(k)) utm[k] = qs.get(k); });
  try { sessionStorage.setItem('sf_utm', JSON.stringify(utm)); } catch (e) {}

  // Devolve a URL do checkout com as UTMs anexadas.
  // Hotmart usa 'src' (origem) e 'sck' (até 100 caracteres) para relatórios de vendas,
  // então enviamos também esses dois, montados a partir das UTMs.
  function decorate(url) {
    try {
      var u = new URL(url, location.href);
      for (var k in utm) u.searchParams.set(k, utm[k]);
      u.searchParams.set('src', utm.utm_source || 'site');
      var sck = [utm.utm_medium, utm.utm_campaign, utm.utm_content].filter(Boolean).join('|');
      if (sck) u.searchParams.set('sck', sck.slice(0, 100));
      return u.href;
    } catch (e) { return url; }
  }

  /* ----------------------- carregamento das tags ---------------------- */
  function loadGA(marketing) {
    if (!T.ga4 || loaded.ga) return;
    loaded.ga = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { dataLayer.push(arguments); };
    // Consent Mode: começa negado e libera só o que o visitante aceitou
    gtag('consent', 'default', { analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
    gtag('consent', 'update', {
      analytics_storage: 'granted',
      ad_storage: marketing ? 'granted' : 'denied',
      ad_user_data: marketing ? 'granted' : 'denied',
      ad_personalization: marketing ? 'granted' : 'denied'
    });
    gtag('js', new Date());
    gtag('config', T.ga4);
    loadScript('https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(T.ga4));
  }

  function loadPixel() {
    if (!T.pixel || loaded.px) return;
    loaded.px = true;
    /* Snippet oficial do Meta Pixel (formatado) */
    !function (f, b, e, v, n, t, s) {
      if (f.fbq) return;
      n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
      if (!f._fbq) f._fbq = n;
      n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = [];
      t = b.createElement(e); t.async = !0; t.src = v;
      s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
    }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', T.pixel);
    fbq('track', 'PageView');
  }

  function loadClarity() {
    if (!T.clarity || loaded.cl) return;
    loaded.cl = true;
    /* Snippet oficial do Microsoft Clarity (formatado) */
    (function (c, l, a, r, i, t, y) {
      c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
      t = l.createElement(r); t.async = 1; t.src = 'https://www.clarity.ms/tag/' + i;
      y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
    })(window, document, 'clarity', 'script', T.clarity);
    // Clarity Consent API v2: informa que o visitante autorizou
    window.clarity('consentv2', { ad_Storage: 'granted', analytics_Storage: 'granted' });
  }

  /* Aplica o consentimento salvo: carrega o que foi aceito; reinicia a página
     se algo já carregado foi revogado (única forma segura de "descarregar" tags). */
  function apply(c) {
    if ((loaded.ga && !c.analytics) || (loaded.cl && !c.analytics) || (loaded.px && !c.marketing)) {
      location.reload(); return;
    }
    idle(function () {
      if (c.analytics) { loadGA(c.marketing); loadClarity(); }
      if (c.marketing) loadPixel();
    });
  }

  /* --------------------------- API pública ---------------------------- */
  /* SF.track(gaEvento, gaParams, fbEvento, fbParams, fbCustom)
     Dispara em GA4 e/ou Meta Pixel SOMENTE se a tag estiver carregada (ou seja,
     se o visitante consentiu). Sem consentimento, nada é enviado.
     fbCustom = true usa trackCustom (evento próprio, que não se mistura com os
     eventos padrão que a Hotmart já envia, como InitiateCheckout e Purchase). */
  function track(ga, gaParams, fb, fbParams, fbCustom) {
    try {
      if (ga && window.gtag && loaded.ga) gtag('event', ga, gaParams || {});
      if (fb && window.fbq && loaded.px) fbq(fbCustom ? 'trackCustom' : 'track', fb, fbParams || {});
    } catch (e) {}
  }

  /* ---------------------------- banner UI ----------------------------- */
  var css =
    '.sf-ck{position:fixed;left:12px;right:12px;bottom:12px;z-index:60;max-width:640px;max-height:82vh;overflow:auto;' +
    'background:var(--card,#14161D);color:var(--tx,#F5F5F7);border:1px solid var(--line,#262936);border-radius:12px;' +
    'padding:16px;font:400 .88rem/1.55 Inter,system-ui,sans-serif;box-shadow:0 12px 40px rgba(0,0,0,.55)}' +
    'body.sticky-on .sf-ck{bottom:84px}' +
    '.sf-ck[hidden]{display:none}.sf-ck p{margin:0 0 12px}.sf-ck a{color:var(--ac2,#DDB255)}' +
    '.sf-ck .row{display:flex;flex-wrap:wrap;gap:8px}' +
    '.sf-ck button{font:700 .85rem Inter,system-ui,sans-serif;padding:10px 16px;border-radius:8px;cursor:pointer;' +
    'border:1px solid var(--ac,#C89B3C);background:var(--ac,#C89B3C);color:var(--bg,#0A0A0D)}' +
    '.sf-ck button.alt{background:transparent;color:var(--ac,#C89B3C)}' +
    '.sf-ck button.ghost{background:transparent;border-color:var(--line,#262936);color:var(--mu,#A1A1AA)}' +
    '.sf-ck .cat{display:flex;gap:12px;align-items:flex-start;padding:10px 0;border-top:1px solid var(--line,#262936)}' +
    '.sf-ck .cat input{margin-top:5px;width:18px;height:18px;accent-color:var(--ac,#C89B3C);flex:none}' +
    '.sf-ck .cat small{display:block;color:var(--mu,#A1A1AA)}' +
    '.sf-ck .cat label{cursor:pointer}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  var box = document.createElement('div');
  box.className = 'sf-ck'; box.hidden = true;
  box.setAttribute('role', 'dialog'); box.setAttribute('aria-label', 'Preferências de cookies');
  var priv = (C.legal && C.legal.privacidade) || 'privacidade.html';
  box.innerHTML =
    '<div data-v="main">' +
      '<p>Usamos cookies para entender como o site é usado (estatísticas e mapas de calor) e para medir anúncios. ' +
      'Você escolhe o que permitir. Veja a <a href="' + priv + '">Política de Privacidade</a>.</p>' +
      '<div class="row">' +
        '<button type="button" data-a="all">Aceitar tudo</button>' +
        '<button type="button" class="alt" data-a="none">Recusar</button>' +
        '<button type="button" class="ghost" data-a="manage">Gerenciar</button>' +
      '</div>' +
    '</div>' +
    '<div data-v="manage" hidden>' +
      '<p><strong>Preferências de cookies</strong></p>' +
      '<div class="cat"><input type="checkbox" checked disabled id="sfc0"><label for="sfc0">Essenciais' +
        '<small>Necessários para o site funcionar e lembrar sua escolha. Sempre ativos.</small></label></div>' +
      '<div class="cat"><input type="checkbox" id="sfcA"><label for="sfcA">Estatísticas e experiência' +
        '<small>Google Analytics e Microsoft Clarity (mapas de calor e gravações anônimas de navegação).</small></label></div>' +
      '<div class="cat"><input type="checkbox" id="sfcM"><label for="sfcM">Marketing' +
        '<small>Meta Pixel: mede a efetividade dos anúncios e ajuda a mostrá-los a quem tem interesse.</small></label></div>' +
      '<div class="row" style="margin-top:10px">' +
        '<button type="button" data-a="save">Salvar preferências</button>' +
        '<button type="button" class="ghost" data-a="back">Voltar</button>' +
      '</div>' +
    '</div>';

  function show(view) {
    box.querySelector('[data-v=main]').hidden = view !== 'main';
    box.querySelector('[data-v=manage]').hidden = view !== 'manage';
    box.hidden = false;
  }
  function open(view) {
    var c = read() || {};
    box.querySelector('#sfcA').checked = !!c.analytics;
    box.querySelector('#sfcM').checked = !!c.marketing;
    show(view || 'manage');
  }
  function decide(a, m) {
    var c = { analytics: !!a, marketing: !!m, v: 1, t: Date.now() };
    write(c); box.hidden = true; apply(c);
  }
  box.addEventListener('click', function (e) {
    var a = e.target.getAttribute && e.target.getAttribute('data-a');
    if (!a) return;
    if (a === 'all') decide(true, true);
    else if (a === 'none') decide(false, false);
    else if (a === 'manage') open('manage');
    else if (a === 'back') show('main');
    else if (a === 'save') decide(box.querySelector('#sfcA').checked, box.querySelector('#sfcM').checked);
  });

  function init() {
    document.body.appendChild(box);
    // Qualquer elemento com data-cookie-prefs reabre o painel (ex.: link no rodapé)
    document.addEventListener('click', function (e) {
      var t = e.target.closest && e.target.closest('[data-cookie-prefs]');
      if (t) { e.preventDefault(); open('manage'); }
    });
    var c = read();
    if (c) apply(c); else show('main');   // sem decisão ainda: nada é carregado nem enviado
  }
  if (document.body) init(); else document.addEventListener('DOMContentLoaded', init);

  window.SF = { track: track, decorate: decorate, utm: utm, openCookies: open };
})();
