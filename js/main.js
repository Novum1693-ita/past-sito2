/* ============================================================
   P.A.S.T. — main.js  (sistema JSON unificato)
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
    toggle.addEventListener('click', function () { navLinks.classList.toggle('aperto'); });
  }

  /* ── Dropdown mobile ── */
  if (window.innerWidth <= 768) {
    document.querySelectorAll('.nav-dropdown > a').forEach(function (a) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        this.parentElement.classList.toggle('aperto');
      });
    });
  }

  /* ── Cookie banner ── */
  var banner = document.getElementById('cookie-banner');
  if (banner && !localStorage.getItem('cookie_consenso')) {
    setTimeout(function () { banner.classList.add('visibile'); }, 900);
  }
  function nascondi() {
    if (banner) { banner.classList.remove('visibile'); setTimeout(function () { banner.style.display = 'none'; }, 400); }
  }
  var btnA = document.getElementById('cookie-accetta');
  var btnR = document.getElementById('cookie-rifiuta');
  if (btnA) btnA.addEventListener('click', function () { localStorage.setItem('cookie_consenso', 'accettato'); nascondi(); });
  if (btnR) btnR.addEventListener('click', function () { localStorage.setItem('cookie_consenso', 'rifiutato'); nascondi(); });

  /* ── Filtri (categorie) ── */
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

  /* ── Form prenotazione ── */
  var form = document.getElementById('form-prenotazione');
  if (form) {
    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      var d = {
        nome:  document.getElementById('f-nome').value.trim(),
        email: document.getElementById('f-email').value.trim(),
        luogo: document.getElementById('f-luogo').value,
        data:  document.getElementById('f-data') ? document.getElementById('f-data').value : '',
        num:   document.getElementById('f-num') ? document.getElementById('f-num').value : '1',
        note:  document.getElementById('f-note') ? document.getElementById('f-note').value.trim() : '',
      };
      if (!d.nome || !d.email || !d.luogo) { alert('Compila nome, email e luogo.'); return; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email)) { alert('Email non valida.'); return; }
      var btn = form.querySelector('button[type=submit]');
      var orig = btn ? btn.textContent : '';
      if (btn) { btn.textContent = 'Invio in corso…'; btn.disabled = true; }
      try {
        var r = await fetch('https://formspree.io/f/INSERISCI_ID', {
          method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(d)
        });
        if (r.ok) {
          var conf = document.getElementById('form-conferma');
          if (conf) { form.style.display = 'none'; conf.style.display = 'block'; }
          else { alert('Richiesta inviata! Ti ricontatteremo presto.'); form.reset(); }
        } else { alert('Errore nell\'invio. Riprova o contattaci via email.'); }
      } catch (err) { alert('Errore di rete. Controlla la connessione.'); }
      finally { if (btn) { btn.textContent = orig; btn.disabled = false; } }
    });
  }

  /* ── Avvia caricamenti dinamici ── */
  caricaTicker();
  caricaPartner();
  caricaGenerale();
  caricaNavbar();
  if (document.getElementById('eventi-home-grid')) caricaEventiHome();
  if (document.getElementById('eventi-grid'))      caricaEventiPagina();
  if (document.getElementById('notizie-grid'))     caricaNotizie();
  if (document.getElementById('luoghi-grid'))      caricaLuoghi();

});

/* ── Percorso base (root o sottocartella) ── */
function basePath() {
  var d = window.location.pathname.split('/').length - 2;
  return d > 0 ? '../'.repeat(d) : '';
}

async function fetchJSON(url) {
  try { var r = await fetch(url); return r.ok ? await r.json() : null; }
  catch (e) { return null; }
}

/* ──────────────────────────────────────────
   TICKER
────────────────────────────────────────── */
async function caricaTicker() {
  var track = document.getElementById('ticker-track');
  if (!track) return;
  var base = basePath();
  var testi = [];

  // Testi fissi dal CMS (_sito/ticker.json)
  var tickerCMS = await fetchJSON(base + '_sito/ticker.json');
  if (tickerCMS && tickerCMS.testi && tickerCMS.testi.length > 0) {
    tickerCMS.testi.forEach(function(t){ if (t) testi.push(t); });
  }

  // Notizie automatiche
  var idx = await fetchJSON(base + '_notizie/index.json');
  if (idx && idx.length > 0) {
    var campione = idx.slice(0, 5);
    if (typeof campione[0] === 'string') {
      var results = await Promise.all(campione.map(function(f){ return fetchJSON(base + '_notizie/' + f); }));
      results.forEach(function(n){ if (n && n.titolo) testi.push(n.titolo); });
    } else {
      campione.forEach(function(n){ if (n && n.titolo) testi.push(n.titolo); });
    }
  }
  if (testi.length === 0 && typeof NOTIZIE_PAST !== 'undefined') {
    testi = NOTIZIE_PAST.slice(0, 5).map(function (n) { return n.titolo; });
  }
  if (testi.length === 0) testi = ['P.A.S.T. — Patrimonio Arte Storia Territorio · Ragusa Ibla'];

  var html = testi.map(function (t) { return '<span class="ticker-item">' + t + '</span>'; }).join('');
  track.innerHTML = html + html;
  var larghezza = track.scrollWidth / 2;
  var durata = Math.max(20, larghezza / 80);
  track.style.animationDuration = durata + 's';
  track.classList.add('running');
}

/* ──────────────────────────────────────────
   IMPOSTAZIONI GENERALI
────────────────────────────────────────── */
async function caricaGenerale() {
  var base = basePath();
  var d = await fetchJSON(base + '_sito/generale.json');
  if (!d) return;

  // Nascondi pulsante EN se disabilitato
  if (d.mostra_en === false) {
    document.querySelectorAll('.lang-switch').forEach(function(el){ el.style.display = 'none'; });
  }

  // Aggiorna footer con dati generali (solo se non già aggiornato da altro script)
  var fi = document.getElementById('footer-info');
  if (fi && d.indirizzo && d.email) {
    fi.innerHTML = d.indirizzo + ' &nbsp;·&nbsp; <a href="mailto:' + d.email + '">' + d.email + '</a> &nbsp;·&nbsp; <a href="' + base + 'privacy.html">Privacy policy</a>';
  }
}

/* ──────────────────────────────────────────
   PARTNER / SPONSOR BAR
────────────────────────────────────────── */
async function caricaPartner() {
  var track = document.getElementById('sponsor-track');
  if (!track) return;
  var base = basePath();
  var dati = await fetchJSON(base + '_sito/partner.json');
  if (!dati || !dati.partner || dati.partner.length === 0) return;

  var html = dati.partner.map(function(p) {
    var imgClass = p.colori_originali === false ? 'img-monocromo' : '';
    var link = p.url ? ('<a href="' + p.url + '" target="_blank" rel="noopener" class="sponsor-item">') : '<span class="sponsor-item">';
    var chiudi = p.url ? '</a>' : '</span>';
    return link + '<img src="' + base + p.logo.replace(/^\//,'') + '" alt="' + (p.nome||'') + '" class="' + imgClass + '" />' + chiudi;
  }).join('');
  track.innerHTML = html;
}

/* ──────────────────────────────────────────
   EVENTI
────────────────────────────────────────── */
async function caricaListaEventi(base) {
  var idx = await fetchJSON(base + '_eventi/index.json');
  if ((!idx || idx.length === 0) && typeof EVENTI_PAST !== 'undefined') return EVENTI_PAST;
  if (!idx || idx.length === 0) return [];
  // Se index.json contiene già oggetti completi, usali direttamente (1 fetch)
  if (typeof idx[0] === 'object') return idx;
  // Altrimenti carica in parallelo (vecchio formato con nomi file)
  var results = await Promise.all(idx.map(function(f){ return fetchJSON(base + '_eventi/' + f); }));
  return results.filter(Boolean);
}

function renderCardEvento(ev, base) {
  var badges = '';
  if (ev.badge && Array.isArray(ev.badge)) {
    badges = ev.badge.map(function (b) { return '<span class="badge-tipo ' + b.classe + '">' + b.testo + '</span>'; }).join('');
  } else if (ev.badge1) {
    badges = '<span class="badge-tipo ' + ev.badge1 + '">' + (ev.categoria || '') + '</span>';
  }
  var url = ev.url ? (base + ev.url) : 'eventi.html';
  return '<article class="evento-card" data-categoria="' + (ev.categoria || '') + '">'
    + '<div class="evento-card-header">'
    + '<div class="evento-data-grande"><span class="giorno">' + (ev.giorno || '&mdash;') + '</span>'
    + '<span class="mese">' + (ev.mese || '') + '</span></div>'
    + '<div class="evento-card-meta">'
    + '<div>' + badges + '</div>'
    + '<h3>' + (ev.titolo || '') + '</h3>'
    + '<p>' + (ev.sottotitolo || '') + '</p>'
    + '</div></div>'
    + '<div class="evento-card-body">'
    + '<p>' + (ev.anteprima || '') + '</p>'
    + '<a href="' + url + '" class="evento-link">Scopri</a>'
    + '</div></article>';
}

async function caricaEventiHome() {
  var grid = document.getElementById('eventi-home-grid');
  if (!grid) return;
  var base = basePath();
  var eventi = await caricaListaEventi(base);
  if (!eventi || eventi.length === 0) {
    grid.innerHTML = '<div class="evento-card" style="grid-column:1/-1;text-align:center;padding:2rem;">'
      + '<p class="evento-data"><span class="evento-giorno">&mdash;</span><span class="evento-mese">Presto</span></p>'
      + '<h3 class="evento-titolo">Nuovi eventi in arrivo</h3>'
      + '<p class="evento-anteprima">Consulta il calendario completo</p>'
      + '<a href="eventi.html" class="evento-link">Calendario &rarr;</a></div>';
    return;
  }
  grid.innerHTML = eventi.slice(0, 3).map(function (ev) { return renderCardEvento(ev, base); }).join('');
}

async function caricaEventiPagina() {
  var grid = document.getElementById('eventi-grid');
  if (!grid) return;
  var base = basePath();
  var eventi = await caricaListaEventi(base);
  if (!eventi || eventi.length === 0) {
    grid.innerHTML = '<p style="text-align:center;padding:2rem;opacity:.6;">Nessun evento disponibile al momento.</p>';
    return;
  }
  grid.innerHTML = eventi.map(function (ev) { return renderCardEvento(ev, base); }).join('');
}

/* ──────────────────────────────────────────
   NOTIZIE
────────────────────────────────────────── */
function renderCardNotizia(n) {
  return '<article class="notizia-card">'
    + '<div class="notizia-meta"><span class="notizia-badge">' + (n.badge_testo || n.categoria || 'Notizia') + '</span>'
    + '<span class="notizia-data">' + (n.data || '') + '</span></div>'
    + '<h3 class="notizia-titolo">' + (n.titolo || '') + '</h3>'
    + '<p class="notizia-anteprima">' + (n.anteprima || '') + '</p>'
    + '</article>';
}

async function caricaNotizie() {
  var grid = document.getElementById('notizie-grid');
  if (!grid) return;
  var base = basePath();
  var idx = await fetchJSON(base + '_notizie/index.json');

  if ((!idx || idx.length === 0) && typeof NOTIZIE_PAST !== 'undefined') {
    grid.innerHTML = NOTIZIE_PAST.map(renderCardNotizia).join('');
    return;
  }
  if (!idx || idx.length === 0) {
    grid.innerHTML = '<p style="text-align:center;padding:2rem;opacity:.6;">Nessuna notizia disponibile.</p>';
    return;
  }
  var notizie = [];
  if (typeof idx[0] === 'object') {
    notizie = idx;
  } else {
    var results = await Promise.all(idx.map(function(f){ return fetchJSON(base + '_notizie/' + f); }));
    notizie = results.filter(Boolean);
  }
  grid.innerHTML = notizie.map(renderCardNotizia).join('');
}

/* ──────────────────────────────────────────
   NAVBAR DINAMICA (dropdown I Luoghi)
────────────────────────────────────────── */
async function caricaNavbar() {
  var menu = document.getElementById('luoghi-dropdown');
  if (!menu) return;
  var base = basePath();
  var idx = await fetchJSON(base + '_luoghi/index.json');
  if (!idx || idx.length === 0) return;
  var luoghi = (typeof idx[0] === 'object') ? idx : [];
  if (luoghi.length === 0) {
    var results = await Promise.all(idx.map(function(f){ return fetchJSON(base + '_luoghi/' + f); }));
    luoghi = results.filter(Boolean);
  }
  menu.innerHTML = luoghi.map(function(l) {
    return '<a href="' + base + 'luoghi/' + (l.slug || '') + '.html">' + (l.titolo || l.slug) + '</a>';
  }).join('');
}

/* ──────────────────────────────────────────
   LUOGHI (i-luoghi.html)
────────────────────────────────────────── */
async function caricaLuoghi() {
  var grid = document.getElementById('luoghi-grid');
  if (!grid) return;
  var base = basePath();
  var idx = await fetchJSON(base + '_luoghi/index.json');
  if (!idx || idx.length === 0) return;

  // index.json contiene già tutti i dati → 1 sola fetch
  var luoghi = (typeof idx[0] === 'object') ? idx : [];
  if (luoghi.length === 0) {
    var results = await Promise.all(idx.map(function(f){ return fetchJSON(base + '_luoghi/' + f); }));
    luoghi = results.filter(Boolean);
  }

  grid.innerHTML = luoghi.map(function (l) {
    var imgStyle = l.immagine ? 'background-image:url(\'' + base + l.immagine.replace(/^\//,'') + '\');background-size:cover;background-position:center;' : '';
    var colore = l.colore_principale || 'var(--blu-medio)';
    return '<a href="' + base + 'luoghi/' + l.slug + '.html" class="course-card" data-categoria="' + (l.categoria || '') + '">'
      + '<div class="course-thumb" style="' + imgStyle + '">'
      + '<span class="course-badge" style="border-color:' + colore + ';color:' + colore + '">' + (l.categoria || '') + '</span>'
      + '</div>'
      + '<div class="course-body">'
      + '<h3>' + (l.titolo || '') + '</h3>'
      + '<p>' + (l.descrizione_breve || '') + '</p>'
      + '<div class="course-meta">'
      + '<span>' + (l.orari || '') + '</span>'
      + '<span>' + (l.prezzo || '') + '</span>'
      + '</div>'
      + '<span class="book-link">Scopri e prenota</span>'
      + '</div></a>';
  }).join('');
}
