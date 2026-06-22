/* ============================================================
   P.A.S.T. — main.js
   ============================================================
   Per aggiornare EVENTI: modifica js/data-eventi.js
   Per aggiornare NOTIZIE: modifica js/data-notizie.js
   Non toccare questo file salvo per modifiche strutturali.
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {

  /* ── Navbar attiva ── */
  var pagina = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(function (a) {
    if (a.getAttribute('href') === pagina) a.classList.add('active');
  });

  /* ── Hamburger mobile ── */
  var toggle = document.getElementById('nav-toggle');
  var navLinks = document.querySelector('.nav-links');
  if (toggle && navLinks) {
    toggle.addEventListener('click', function () {
      navLinks.classList.toggle('aperto');
    });
  }

  /* ── Dropdown mobile (click invece di hover) ── */
  if (window.innerWidth <= 768) {
    document.querySelectorAll('.nav-dropdown > a').forEach(function (a) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        var li = this.parentElement;
        li.classList.toggle('aperto');
      });
    });
  }

  /* ── Cookie banner ── */
  var banner = document.getElementById('cookie-banner');
  if (banner && !localStorage.getItem('cookie_consenso')) {
    setTimeout(function () { banner.classList.add('visibile'); }, 900);
  }
  function nascondi() {
    if (banner) {
      banner.classList.remove('visibile');
      setTimeout(function () { banner.style.display = 'none'; }, 400);
    }
  }
  var btnA = document.getElementById('cookie-accetta');
  var btnR = document.getElementById('cookie-rifiuta');
  if (btnA) btnA.addEventListener('click', function () { localStorage.setItem('cookie_consenso', 'accettato'); nascondi(); });
  if (btnR) btnR.addEventListener('click', function () { localStorage.setItem('cookie_consenso', 'rifiutato'); nascondi(); });

  /* ── Filtri luoghi ed eventi ── */
  document.querySelectorAll('.filter-pill').forEach(function (f) {
    f.addEventListener('click', function () {
      document.querySelectorAll('.filter-pill').forEach(function (x) { x.classList.remove('active'); });
      this.classList.add('active');
      var cat = this.dataset.categoria;
      document.querySelectorAll('.course-card, .evento-card').forEach(function (c) {
        c.style.display = (cat === 'tutti' || c.dataset.categoria === cat) ? '' : 'none';
      });
    });
  });

  /* ── Form prenotazione ──
     Sostituisci INSERISCI_ENDPOINT_FORMSPREE con il tuo URL da formspree.io */
  var form = document.getElementById('form-prenotazione');
  if (form) {
    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      var d = {
        nome:    document.getElementById('f-nome').value.trim(),
        email:   document.getElementById('f-email').value.trim(),
        luogo:   document.getElementById('f-luogo').value,
        data:    document.getElementById('f-data') ? document.getElementById('f-data').value : '',
        num:     document.getElementById('f-num') ? document.getElementById('f-num').value : '1',
        note:    document.getElementById('f-note') ? document.getElementById('f-note').value.trim() : '',
      };
      if (!d.nome || !d.email || !d.luogo) { alert('Compila nome, email e luogo.'); return; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email)) { alert('Email non valida.'); return; }
      try {
        var r = await fetch('INSERISCI_ENDPOINT_FORMSPREE', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(d)
        });
        if (r.ok) { mostraSuccesso(); form.reset(); }
        else alert('Errore invio. Riprova o contattaci via email.');
      } catch (e) {
        console.warn('Endpoint non configurato:', d);
        mostraSuccesso(); form.reset();
      }
    });
  }

  /* ── Precompila il luogo dal localStorage ── */
  precompilaLuogoDaUrl();

  /* ── Carica eventi dinamici in home se presenti ── */
  caricaEventiHome();

  /* ── Carica eventi nella pagina eventi se presenti ── */
  caricaGrigliaEventi();

  /* ── Carica notizie nella pagina notizie se presenti ── */
  caricaNotizie();

  /* ── Ticker ── */
  avviaTickerDinamico();

});

/* ════════════════════════════════════════════════════════════
   FUNZIONI DI SUPPORTO
   ════════════════════════════════════════════════════════════ */

function mostraSuccesso() {
  var m = document.getElementById('success-msg');
  if (m) {
    m.style.display = 'block';
    setTimeout(function () { m.style.display = 'none'; }, 6000);
    m.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

function precompilaLuogoDaUrl() {
  var luogo = localStorage.getItem('luogo_preselezionato');
  if (luogo) {
    var sel = document.getElementById('f-luogo');
    if (sel) {
      for (var o of sel.options) {
        if (o.text === luogo) { sel.value = o.value; break; }
      }
    }
    localStorage.removeItem('luogo_preselezionato');
  }
}

/* ════════════════════════════════════════════════════════════
   CARICAMENTO DINAMICO DA FILE DATI
   Legge i dati da js/data-eventi.js e js/data-notizie.js
   ════════════════════════════════════════════════════════════ */

function caricaEventiHome() {
  var container = document.getElementById('eventi-row-dinamico');
  if (!container || typeof EVENTI_PAST === 'undefined') return;

  /* Mostra solo i primi 3 eventi */
  var eventiDaMostrare = EVENTI_PAST.slice(0, 3);
  var html = '';
  var prefix = calcolaPrefix();

  eventiDaMostrare.forEach(function (e) {
    html += '<a href="' + prefix + e.url + '" class="event-chip">' +
      '<div class="event-date"><span class="day">' + e.giorno + '</span><span class="mon">' + e.mese + '</span></div>' +
      '<div class="event-info"><h4>' + e.titolo + '</h4><p>' + e.sottotitolo + '</p></div>' +
      '</a>';
  });
  container.innerHTML = html;
}

function caricaGrigliaEventi() {
  var container = document.getElementById('eventi-griglia-dinamica');
  if (!container || typeof EVENTI_PAST === 'undefined') return;

  var prefix = calcolaPrefix();
  var html = '';

  EVENTI_PAST.forEach(function (e) {
    var badges = '';
    e.badge.forEach(function (b) {
      badges += '<span class="badge-tipo ' + b.classe + '">' + b.testo + '</span> ';
    });
    html += '<a href="' + prefix + e.url + '" class="evento-card" data-categoria="' + e.categoria + '">' +
      '<div class="evento-card-header">' +
        '<div class="evento-data-grande"><span class="giorno">' + e.giorno + '</span><span class="mese">' + e.mese + '</span></div>' +
        '<div class="evento-card-meta"><h3>' + e.titolo + '</h3><p>' + e.sottotitolo + '</p></div>' +
      '</div>' +
      '<div class="evento-card-body">' +
        badges +
        '<p>' + e.anteprima + '</p>' +
        '<span class="evento-link">Scopri e prenota</span>' +
      '</div>' +
      '</a>';
  });
  container.innerHTML = html;
}

function caricaNotizie() {
  var container = document.getElementById('notizie-lista-dinamica');
  if (!container || typeof NOTIZIE_PAST === 'undefined') return;

  var prefix = calcolaPrefix();
  var html = '';

  NOTIZIE_PAST.forEach(function (n) {
    html += '<a href="' + prefix + n.url + '" class="notizia-card">' +
      '<div class="notizia-card-body">' +
        '<div class="notizia-meta">' +
          '<span class="notizia-data">' + n.data + '</span>' +
          '<span class="badge-notizia ' + n.badgeClasse + '">' + n.badgeTesto + '</span>' +
        '</div>' +
        '<h3>' + n.titolo + '</h3>' +
        '<p>' + n.anteprima + '</p>' +
        '<span class="notizia-leggi">Leggi tutto</span>' +
      '</div>' +
      '</a>';
  });
  container.innerHTML = html;
}

function avviaTickerDinamico() {
  var track = document.getElementById('ticker-track');
  if (!track) return;

  /* Usa NOTIZIE_PAST se disponibili, altrimenti usa il fallback */
  var notizie = (typeof NOTIZIE_PAST !== 'undefined') ? NOTIZIE_PAST : TICKER_FALLBACK;
  var prefix = calcolaPrefix();

  /* Prende solo le prime 3 */
  var items = notizie.slice(0, 3);
  var html = '';

  /* Duplica per effetto loop */
  [items, items].forEach(function (g) {
    g.forEach(function (n) {
      html += '<a class="ticker-item" href="' + prefix + n.url + '">' + n.titolo + '</a>';
    });
  });

  track.innerHTML = html;
  requestAnimationFrame(function () {
    var w = track.scrollWidth / 2;
    track.style.animationDuration = Math.max(20, w / 75) + 's';
    track.classList.add('running');
  });
}

/* Calcola il prefisso per i percorsi in base alla profondità della pagina */
function calcolaPrefix() {
  var parts = window.location.pathname.split('/').filter(Boolean);
  return parts.length > 1 ? '../'.repeat(parts.length - 1) : '';
}

/* Fallback ticker se data-notizie.js non è caricato */
var TICKER_FALLBACK = [
  { titolo: 'Benvenuti nel portale P.A.S.T.', url: 'notizie.html' },
  { titolo: 'Scopri i luoghi culturali di Ragusa', url: 'I-luoghi.html' },
  { titolo: 'Vitruvio Card — cultura a portata di mano', url: 'Le-Card.html' },
];
