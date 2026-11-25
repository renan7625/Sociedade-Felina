/* ==========================================================================
   APP.JS — Comportamento da página (lê tudo de config.js)
   --------------------------------------------------------------------------
   1. Checkout: link da Hotmart + UTMs + evento de clique
   2. Parcelamento
   3. Rodapé: suporte e dados do vendedor
   4. Depoimentos em vídeo (legendas e frase de destaque)
   5. Citação, temas e referências
   6. FAQ (sanfona)
   7. Botão fixo no mobile
   8. Evento ao chegar na oferta
   Você normalmente NÃO precisa editar este arquivo.
   ========================================================================== */
(function () {
  'use strict';

  var C = window.SITE_CONFIG || {};
  var SF = window.SF || { track: function () {}, decorate: function (u) { return u; }, utm: {} };
  var P = C.produto || {};
  var $ = function (id) { return document.getElementById(id); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };
  var remove = function (el) { if (el && el.parentNode) el.parentNode.removeChild(el); };

  /* ---------------------------------------------------------------------
     1. CHECKOUT
        Todo botão com data-checkout usa config.checkoutUrl + UTMs.
        O clique gera "click_checkout" (GA4) e "ClickCheckout" (Pixel, evento
        próprio). Não usamos begin_checkout/InitiateCheckout/purchase para não
        duplicar o que a Hotmart já envia no checkout dela.
     --------------------------------------------------------------------- */
  var checkout = C.checkoutUrl ? SF.decorate(C.checkoutUrl) : '';
  $$('a[data-checkout]').forEach(function (a) { if (checkout) a.href = checkout; });

  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[data-checkout]');
    if (!a) return;
    var local = a.getAttribute('data-loc') || '';
    SF.track('click_checkout', { button_location: local, value: P.preco || 0, currency: P.moeda || 'BRL', transport_type: 'beacon' },
             'ClickCheckout', { button_location: local, value: P.preco || 0, currency: P.moeda || 'BRL' }, true);
  });

  /* ---------------------------------------------------------------------
     2. PARCELAMENTO (config.parcela)
     --------------------------------------------------------------------- */
  if (C.parcela) {
    $$('.parc').forEach(function (el) { el.hidden = false; el.querySelector('[data-parc]').textContent = C.parcela; });
  }

  /* ---------------------------------------------------------------------
     3. RODAPÉ: SUPORTE E VENDEDOR
        Suporte: cada canal só aparece se ativo === true e tiver valor.
        Vendedor: só aparece o que estiver preenchido.
     --------------------------------------------------------------------- */
  var S = C.suporte || {}, L = C.legal || {};
  function fmtZap(n) {                         // 5511999999999 → +55 (11) 99999-9999
    var m = /^(\d{2})(\d{2})(\d{4,5})(\d{4})$/.exec(n);
    return m ? '+' + m[1] + ' (' + m[2] + ') ' + m[3] + '-' + m[4] : n;
  }
  function channel(key) {                      // devolve o valor se o canal estiver ativo
    var c = S[key];
    return c && c.ativo && c.valor ? String(c.valor).trim() : '';
  }
  function fill(key, value, build) {
    var el = document.querySelector('[data-f="' + key + '"]');
    if (!el) return;
    if (value) build(el, value); else remove(el);
  }
  function link(el, href, text, newTab) {
    var a = document.createElement('a'); a.href = href; a.textContent = text;
    if (newTab) { a.target = '_blank'; a.rel = 'noopener'; }
    el.appendChild(a);
  }
  fill('email', channel('email'), function (el, v) { link(el, 'mailto:' + v, v); });
  fill('whatsapp', channel('whatsapp').replace(/\D/g, ''), function (el, v) { link(el, 'https://wa.me/' + v, 'WhatsApp: ' + fmtZap(v), true); });
  fill('instagram', channel('instagram').replace(/^@/, ''), function (el, v) { link(el, 'https://instagram.com/' + encodeURIComponent(v), 'Instagram: @' + v, true); });
  fill('horario', S.horario, function (el, v) { el.textContent = 'Atendimento: ' + v; });
  fill('razao', L.razao, function (el, v) { el.textContent = v; });
  fill('cnpj', L.cnpj, function (el, v) { el.textContent = 'CNPJ/CPF: ' + v; });
  fill('endereco', L.endereco, function (el, v) { el.textContent = v; });
  $$('.fgrid > div').forEach(function (col) { if (!col.querySelector('li')) remove(col); });   // coluna vazia some

  if (L.privacidade) $$('[data-f-link=privacidade]').forEach(function (a) { a.href = L.privacidade; });
  if (L.termos) $$('[data-f-link=termos]').forEach(function (a) { a.href = L.termos; });
  if (L.avisoMeta) $('avisoMeta').hidden = false;
  $('ano').textContent = new Date().getFullYear();

  /* ---------------------------------------------------------------------
     4. DEPOIMENTOS EM VÍDEO
        poster e preload="none" estão no HTML (o vídeo só baixa ao dar play).
     --------------------------------------------------------------------- */
  var D = C.depoimentos || [];
  $$('video[data-i]').forEach(function (v) {
    var i = +v.getAttribute('data-i'), d = D[i] || {};
    if (d.vtt) {                                // legenda (botão CC)
      var t = document.createElement('track');
      t.kind = 'captions'; t.srclang = 'pt-BR'; t.label = 'Português'; t.src = d.vtt; t.default = true;
      v.appendChild(t);
    }
    var started = false;
    v.addEventListener('play', function () {    // 1ª reprodução de cada vídeo
      if (started) return; started = true;
      SF.track('video_start', { video_title: 'Depoimento ' + (i + 1) });
    });
    var cap = v.parentNode.querySelector('figcaption');   // galeria (2º e 3º)
    if (cap && d.frase) { cap.className = 'qt'; cap.textContent = '“' + d.frase + '”' + (d.nome ? ' — ' + d.nome : ''); }
  });
  (function () {                                // destaque (1º vídeo)
    var d = D[0] || {}, q = document.querySelector('[data-quote="0"]'), w = document.querySelector('[data-who="0"]');
    if (d.frase) { q.textContent = '“' + d.frase + '”'; q.hidden = false; }
    if (d.nome) { w.textContent = d.nome; w.hidden = false; }
  })();

  /* ---------------------------------------------------------------------
     5. CITAÇÃO DA SINOPSE, TEMAS E REFERÊNCIAS (vazio = oculto)
     --------------------------------------------------------------------- */
  (function () {
    var c = C.citacao || {}, fig = $('citacao');
    if (c.texto) {
      fig.querySelector('[data-cit-texto]').textContent = '“' + c.texto + '”';
      var fo = fig.querySelector('[data-cit-fonte]');
      if (c.fonte) fo.textContent = '— ' + c.fonte; else remove(fo);
      fig.hidden = false;
    }
    function chips(boxId, listId, items) {
      if (!items || !items.length) return;
      var ul = $(listId);
      items.forEach(function (x) { var li = document.createElement('li'); li.textContent = x; ul.appendChild(li); });
      $(boxId).hidden = false;
    }
    chips('temas', 'temasList', C.temas);
    chips('refs', 'refsList', C.referencias);
  })();

  /* ---------------------------------------------------------------------
     6. FAQ EM SANFONA (perguntas vêm de config.faq)
     --------------------------------------------------------------------- */
  (function () {
    var box = $('faq'), items = C.faq || [];
    if (!items.length) { remove($('faqSection')); return; }
    items.forEach(function (it, n) {
      var q = document.createElement('div'); q.className = 'q';
      var b = document.createElement('button');
      b.type = 'button'; b.id = 'fq' + n; b.setAttribute('aria-expanded', 'false'); b.setAttribute('aria-controls', 'fa' + n);
      b.textContent = it.q;
      var a = document.createElement('div'); a.className = 'a'; a.id = 'fa' + n; a.setAttribute('role', 'region'); a.setAttribute('aria-labelledby', 'fq' + n);
      var inner = document.createElement('div'), p = document.createElement('p'); p.textContent = it.a;
      inner.appendChild(p); a.appendChild(inner); q.appendChild(b); q.appendChild(a); box.appendChild(q);
      b.addEventListener('click', function () {
        var open = b.getAttribute('aria-expanded') === 'true';
        b.setAttribute('aria-expanded', String(!open)); a.classList.toggle('open', !open);
      });
    });
  })();

  /* ---------------------------------------------------------------------
     7. BOTÃO FIXO NO MOBILE
        Aparece quando o botão do topo sai da tela e some enquanto a oferta
        final ou o rodapé estiverem visíveis.
     --------------------------------------------------------------------- */
  if (!('IntersectionObserver' in window)) return;
  var sticky = $('sticky'), pastHero = false, atOffer = false, mq = window.matchMedia('(max-width:860px)');
  function refreshSticky() {
    var on = pastHero && !atOffer && mq.matches;
    sticky.classList.toggle('show', on);
    document.body.classList.toggle('sticky-on', on);   // sobe o banner de cookies para não sobrepor
  }
  new IntersectionObserver(function (en) {
    pastHero = !en[0].isIntersecting && en[0].boundingClientRect.top < 0; refreshSticky();
  }).observe(document.querySelector('.hero .cta'));
  var seen = { oferta: false, rodape: false };
  var ioOffer = new IntersectionObserver(function (en) {
    en.forEach(function (x) { seen[x.target.id] = x.isIntersecting; });
    atOffer = seen.oferta || seen.rodape; refreshSticky();
  });
  ioOffer.observe($('oferta')); ioOffer.observe($('rodape'));
  if (mq.addEventListener) mq.addEventListener('change', refreshSticky);

  /* ---------------------------------------------------------------------
     8. EVENTO AO CHEGAR NA OFERTA (view_item / ViewContent — não é conversão)
     --------------------------------------------------------------------- */
  var once = new IntersectionObserver(function (en) {
    if (!en[0].isIntersecting) return;
    once.disconnect();
    SF.track('view_item', { currency: P.moeda || 'BRL', value: P.preco || 0, items: [{ item_name: P.nome || 'Livro' }] },
             'ViewContent', { currency: P.moeda || 'BRL', value: P.preco || 0, content_name: P.nome || 'Livro' });
  }, { threshold: 0.4 });
  once.observe($('oferta'));
})();
