/* =========================================================
   La Truffe Gourmande — script commun à toutes les pages
   Le site s'adresse au chien ; le tunnel de commande bascule
   en « mode humain » au moment de payer (étape 4).

   Chaque bloc est gardé : le fichier est chargé tel quel par
   l'accueil, la fiche produit et le 404, qui n'ont pas les
   mêmes morceaux de page.
   ========================================================= */
(function () {
  'use strict';

  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  const SHIPPING = 4.90;
  const FREE_FROM = 35;
  const STORE_KEY = 'truffe.gamelle';

  const toPrice = str => parseFloat(String(str).replace(',', '.'));
  const fmt = n => n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';

  /* ---------- Header collant ---------- */
  const header = $('.header');
  if (header) {
    const onScroll = () => header.classList.toggle('is-stuck', window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------- Menu mobile ---------- */
  const burger = $('#burger');
  const nav = $('#nav');
  if (burger && nav) {
    burger.addEventListener('click', () => {
      const open = nav.classList.toggle('is-open');
      burger.classList.toggle('is-on', open);
      burger.setAttribute('aria-expanded', String(open));
    });
    $$('a', nav).forEach(a => a.addEventListener('click', () => {
      nav.classList.remove('is-open');
      burger.classList.remove('is-on');
      burger.setAttribute('aria-expanded', 'false');
    }));
  }

  /* ---------- Toast ---------- */
  const toast = $('#toast');
  let toastTimer;
  function say(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('is-on'), 2800);
  }

  /* =========================================================
     LA GAMELLE (panier)
     Persistée en localStorage : la fiche produit et l'accueil
     sont deux pages, la gamelle doit survivre au trajet.
     ========================================================= */
  const cartBtn = $('#cart');
  const cartCount = $('#cartCount');

  /** Map<clé, {name, detail, price, qty}> */
  const bowl = new Map();

  function loadBowl() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (!raw) return;
      JSON.parse(raw).forEach(([key, line]) => bowl.set(key, line));
    } catch (e) { /* navigation privée, stockage bloqué : on repart d'une gamelle vide */ }
  }

  function saveBowl() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify([...bowl])); }
    catch (e) { /* rien à faire : la gamelle reste en mémoire pour cette page */ }
  }

  const totalQty = () => [...bowl.values()].reduce((n, i) => n + i.qty, 0);
  const subtotal = () => [...bowl.values()].reduce((n, i) => n + i.price * i.qty, 0);
  const shipping = () => (bowl.size === 0 || subtotal() >= FREE_FROM ? 0 : SHIPPING);

  function addToBowl(name, price, detail, qty) {
    // Deux gâteaux de configuration différente = deux lignes distinctes.
    const key = detail ? name + ' — ' + detail : name;
    const line = bowl.get(key);
    if (line) { line.qty += (qty || 1); }
    else { bowl.set(key, { name, detail: detail || '', price, qty: qty || 1 }); }
    paintCart();
  }

  function paintCart() {
    saveBowl();
    if (cartCount) {
      const n = totalQty();
      cartCount.textContent = String(n);
      cartCount.classList.toggle('is-on', n > 0);
    }
    if (cartBtn) {
      cartBtn.classList.remove('pop');
      void cartBtn.offsetWidth;          // relance l'animation
      cartBtn.classList.add('pop');
    }
    paintRecap();
  }

  loadBowl();

  /* ---------- Boutons « dans ma gamelle » ---------- */
  $$('.add').forEach(btn => {
    btn.addEventListener('click', () => {
      const qty = btn.dataset.qty ? Number(btn.dataset.qty) : 1;
      addToBowl(btn.dataset.name, toPrice(btn.dataset.price), btn.dataset.detail, qty);
      say(btn.dataset.name + ' — dans ta gamelle 🐾');
    });
  });

  /* ---------- Filtres de la vitrine ---------- */
  const grid = $('#grid');
  if (grid) {
    const chips = $$('.chip');
    const cards = $$('.card', grid);
    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        chips.forEach(c => {
          c.classList.toggle('is-on', c === chip);
          c.setAttribute('aria-selected', String(c === chip));
        });
        const filter = chip.dataset.filter;
        cards.forEach(card => {
          card.classList.toggle('is-hidden', filter !== 'all' && card.dataset.cat !== filter);
        });
      });
    });
  }

  /* ---------- Configurateur sur-mesure (accueil) ---------- */
  const nameInput = $('#dogName');
  if (nameInput) {
    const pName      = $('#pName');
    const pBase1     = $('#pBase1');
    const pBase2     = $('#pBase2');
    const pCream     = $('#pCream');
    const pDrip      = $('#pDrip');
    const buildPrice = $('#buildPrice');
    const buildLabel = $('#buildLabel');
    const buildAdd   = $('#buildAdd');

    const build = { base: 'Carotte & banane', size: 'Petit museau', price: '19,90' };

    function refreshBuild() {
      buildPrice.textContent = build.price + ' €';
      buildLabel.textContent = build.base + ' · ' + build.size;
      buildAdd.dataset.price = build.price;
      buildAdd.dataset.detail = build.base + ' · ' + build.size +
        ' · « ' + (nameInput.value.trim() || '?') + ' »';
    }

    // Le prénom est écrit sur un étage de 152 unités de large : on réduit le
    // corps du texte pour les noms à rallonge plutôt que de déborder du gâteau.
    function drawName() {
      const v = nameInput.value.trim();
      pName.textContent = v === '' ? '?' : v;
      const len = pName.textContent.length;
      pName.setAttribute('font-size', len <= 8 ? 26 : len <= 10 ? 22 : 18);
      refreshBuild();
    }
    nameInput.addEventListener('input', drawName);

    $$('#swatches .swatch').forEach(sw => {
      sw.addEventListener('click', () => {
        $$('#swatches .swatch').forEach(s => s.classList.toggle('is-on', s === sw));
        pBase1.setAttribute('fill', sw.dataset.base);
        pBase2.setAttribute('fill', sw.dataset.base);
        pCream.setAttribute('fill', sw.dataset.top);
        pDrip.setAttribute('fill', sw.dataset.top);
        pName.setAttribute('fill', sw.dataset.top);
        build.base = sw.dataset.label;
        refreshBuild();
      });
    });

    $$('#sizes .size').forEach(sz => {
      sz.addEventListener('click', () => {
        $$('#sizes .size').forEach(s => s.classList.toggle('is-on', s === sz));
        build.price = sz.dataset.price;
        build.size  = sz.dataset.label;
        refreshBuild();
      });
    });

    drawName();
  }

  /* =========================================================
     FICHE PRODUIT
     ========================================================= */
  const pdp = $('.pdp');
  if (pdp) {
    const views     = $$('.pdp__view');
    const thumbs    = $$('.pdp__thumb');
    const sizeBtns  = $$('.psize');
    const perso     = $('#perso');
    const persoName = $('#persoName');
    const persoWrap = $('#persoWrap');
    const cakeName  = $('#cakeName');
    const qtyOut    = $('#pQty');
    const priceOut  = $('#pPrice');
    const unitOut   = $('#pUnit');
    const addBtn    = $('#pAdd');
    const barPrice  = $('#barPrice');
    const barAdd    = $('#barAdd');
    const bar       = $('#buyBar');

    const PERSO_PRICE = 3;
    const state = { price: 24.90, size: 'Bon gabarit', parts: '6 parts', qty: 1 };

    function unitPrice() {
      return state.price + (perso.checked ? PERSO_PRICE : 0);
    }

    function detail() {
      let d = state.size + ' · ' + state.parts;
      if (perso.checked) d += ' · « ' + (persoName.value.trim() || '?') + ' »';
      return d;
    }

    function refresh() {
      const total = unitPrice() * state.qty;
      priceOut.textContent = fmt(total);
      unitOut.textContent = state.qty > 1 ? fmt(unitPrice()) + ' l’unité' : state.parts;
      if (barPrice) barPrice.textContent = fmt(total);

      [addBtn, barAdd].forEach(b => {
        if (!b) return;
        b.dataset.price = String(unitPrice()).replace('.', ',');
        b.dataset.detail = detail();
        b.dataset.qty = String(state.qty);
      });

      // Le prénom s'écrit sur le gâteau : même contrainte de largeur que
      // le configurateur de l'accueil.
      const v = perso.checked ? (persoName.value.trim() || '?') : '';
      cakeName.textContent = v;
      const len = v.length;
      cakeName.setAttribute('font-size', len <= 8 ? 26 : len <= 10 ? 22 : 18);
    }

    thumbs.forEach(th => {
      th.addEventListener('click', () => {
        thumbs.forEach(t => t.classList.toggle('is-on', t === th));
        views.forEach(v => v.classList.toggle('is-on', v.dataset.view === th.dataset.view));
      });
    });

    sizeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        sizeBtns.forEach(b => b.classList.toggle('is-on', b === btn));
        state.price = toPrice(btn.dataset.price);
        state.size  = btn.dataset.label;
        state.parts = btn.dataset.parts;
        refresh();
      });
    });

    perso.addEventListener('change', () => {
      persoWrap.hidden = !perso.checked;
      if (perso.checked) persoName.focus();
      refresh();
    });
    persoName.addEventListener('input', refresh);

    $$('.pqty button').forEach(btn => {
      btn.addEventListener('click', () => {
        state.qty = Math.min(9, Math.max(1, state.qty + Number(btn.dataset.step)));
        qtyOut.textContent = String(state.qty);
        refresh();
      });
    });

    // La barre d'achat mobile n'apparaît qu'une fois le bouton principal
    // dépassé vers le haut — pas avant de l'avoir atteint.
    if (bar && addBtn && 'IntersectionObserver' in window) {
      new IntersectionObserver(entries => {
        const e = entries[0];
        bar.classList.toggle('is-on', !e.isIntersecting && e.boundingClientRect.top < 0);
      }, { rootMargin: '-80px 0px 0px' }).observe(addBtn);
    }

    refresh();
  }

  /* =========================================================
     TUNNEL DE COMMANDE
     ========================================================= */
  const sheet = $('#sheet');
  const recap = $('#recap');
  const recapLead = $('#recapLead');
  const recapTotal = $('#recapTotal');
  const toStep2 = $('#toStep2');

  function paintRecap() {
    if (!recap) return;
    recap.innerHTML = '';

    if (bowl.size === 0) {
      const li = document.createElement('li');
      li.className = 'recap__empty';
      li.textContent = 'Rien. Le vide. Un fond de gamelle que même toi tu ne lécherais pas.';
      recap.appendChild(li);
      recapLead.textContent = 'Il va falloir commencer par choisir quelque chose.';
    } else {
      recapLead.textContent = 'Voilà ce que tu as réussi à faire tomber dedans.';
      bowl.forEach((item, key) => {
        const li = document.createElement('li');

        const name = document.createElement('div');
        name.className = 'recap__name';
        name.textContent = item.name;
        if (item.detail) {
          const small = document.createElement('small');
          small.textContent = item.detail;
          name.appendChild(small);
        }

        const qty = document.createElement('div');
        qty.className = 'recap__qty';
        const minus = document.createElement('button');
        minus.type = 'button';
        minus.textContent = '−';
        minus.setAttribute('aria-label', 'Retirer un ' + item.name);
        const count = document.createElement('span');
        count.textContent = String(item.qty);
        const plus = document.createElement('button');
        plus.type = 'button';
        plus.textContent = '+';
        plus.setAttribute('aria-label', 'Ajouter un ' + item.name);
        qty.append(minus, count, plus);

        minus.addEventListener('click', () => {
          item.qty -= 1;
          if (item.qty <= 0) bowl.delete(key);
          paintCart();
        });
        plus.addEventListener('click', () => { item.qty += 1; paintCart(); });

        const price = document.createElement('div');
        price.className = 'recap__price';
        price.textContent = fmt(item.price * item.qty);

        li.append(name, qty, price);
        recap.appendChild(li);
      });
    }

    recapTotal.textContent = fmt(subtotal());
    toStep2.disabled = bowl.size === 0;
    toStep2.style.opacity = bowl.size === 0 ? '.45' : '';
    toStep2.style.pointerEvents = bowl.size === 0 ? 'none' : '';
  }

  if (sheet && cartBtn) {
    const panel = $('#sheetPanel');
    const steps = $$('#steps li');
    const stepSections = $$('.step', sheet);
    const paySub = $('#paySub');
    const payShip = $('#payShip');
    const payTotal = $('#payTotal');
    const payBtnTotal = $('#payBtnTotal');

    let lastFocus = null;

    function paintPayment() {
      const sub = subtotal();
      const ship = shipping();
      paySub.textContent = fmt(sub);
      payShip.textContent = ship === 0 ? 'Offerte' : fmt(ship);
      payTotal.textContent = fmt(sub + ship);
      payBtnTotal.textContent = fmt(sub + ship);
    }

    function goTo(step) {
      stepSections.forEach(s => s.classList.toggle('is-on', Number(s.dataset.step) === step));

      // Les étapes 3 et 4 partagent le repère « Ton humain » ;
      // l'étape 5 marque tout le fil comme franchi.
      const marker = step >= 4 ? 3 : step;
      steps.forEach(li => {
        const n = Number(li.dataset.for);
        li.classList.toggle('is-on', n === marker && step < 5);
        li.classList.toggle('is-done', n < marker || step === 5);
      });

      // Bascule visuelle : l'humain reprend la main sur l'écran de paiement.
      panel.classList.toggle('is-human', step === 4);

      if (step === 4) paintPayment();
      if (step === 5) { bowl.clear(); paintCart(); }
      panel.scrollTop = 0;

      const target = $('.step.is-on h2', sheet) || panel;
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    }

    function openSheet() {
      lastFocus = document.activeElement;
      sheet.hidden = false;
      document.body.classList.add('is-locked');
      paintRecap();
      goTo(1);
    }

    function closeSheet() {
      sheet.hidden = true;
      document.body.classList.remove('is-locked');
      panel.classList.remove('is-human');
      if (lastFocus) lastFocus.focus();
    }

    cartBtn.addEventListener('click', openSheet);

    $$('[data-go]', sheet).forEach(btn => {
      btn.addEventListener('click', () => {
        const target = Number(btn.dataset.go);
        if (target === 2 && bowl.size === 0) {
          say('Ta gamelle est vide. Même toi tu trouves ça triste.');
          return;
        }
        goTo(target);
      });
    });

    $$('[data-close]', sheet).forEach(el => el.addEventListener('click', closeSheet));

    document.addEventListener('keydown', e => {
      if (sheet.hidden) return;
      if (e.key === 'Escape') { closeSheet(); return; }
      if (e.key !== 'Tab') return;

      // Piège à focus : tant que le tunnel est ouvert, la tabulation y reste.
      const items = $$('a[href], button:not([disabled]), input:not([disabled]), [tabindex="0"]', panel)
        .filter(el => el.offsetParent !== null);
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
  } else if (cartBtn) {
    // Page sans tunnel : la gamelle renvoie à la vitrine.
    cartBtn.addEventListener('click', () => { location.href = 'index.html#vitrine'; });
  }

  /* ---------- Newsletter ---------- */
  const form = $('#newsForm');
  if (form) {
    const email = $('#email');
    const msg = $('#newsMsg');
    form.addEventListener('submit', e => {
      e.preventDefault();
      const ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim());
      msg.classList.toggle('is-error', !ok);
      msg.textContent = ok
        ? 'C’est noté. On préviendra ton humain à ta place.'
        : 'Cette adresse ne ressemble à rien de comestible.';
      if (ok) { email.value = ''; }
    });
  }

  /* ---------- Apparition au scroll ---------- */
  const revealables = $$('.reveal');
  if (revealables.length && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px' });

    revealables.forEach((el, i) => {
      el.style.transitionDelay = (i % 3) * 90 + 'ms';
      io.observe(el);
    });
  }

  paintCart();
})();
