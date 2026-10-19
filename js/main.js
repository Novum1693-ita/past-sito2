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

  /* ── Switch lingua IT/EN ── */
  document.querySelectorAll('.lang-btn').forEach(function(btn) {
    var href = btn.getAttribute('href');
    // Se il link punta a en/ oppure è "en/index.html" → lingua EN, altrimenti IT
    var lingua = (href && href.indexOf('en/') !== -1) ? 'en' : 'it';
    if (lingua === getLingua()) btn.classList.add('active');
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      localStorage.setItem('past_lingua', lingua);
      // Ricarica la pagina corrente (la logica t() aggiorna i testi dinamici)
      window.location.reload();
    });
  });

  /* ── Avvia caricamenti dinamici ── */
  controllaManutenzione();
  caricaColori();
  caricaTicker();
  caricaPartner();
  caricaGenerale();
  caricaNavbar();
  caricaBanner();
  caricaSfondoPagina();
  caricaHeroHome();
  caricaInEvidenza();
  caricaRecensioni();
  caricaRassegnaStampa();
  caricaFaq();
  caricaNewsletter();
  caricaGalleria();
  caricaPrivacy();
  caricaPrenota();
  if (document.getElementById('eventi-home-grid')) caricaEventiHome();
  if (document.getElementById('eventi-grid'))      caricaEventiPagina();
  if (document.getElementById('notizie-grid'))     caricaNotizie();
  if (document.getElementById('luoghi-grid'))      caricaLuoghi();
  if (document.getElementById('vc-grid'))          caricaVitruvioCard();
  if (document.getElementById('percorsi-grid'))    caricaPercorsi();
  inizializzaRicerca();
  inizializzaFiltriEventi();

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

  // Aggiorna footer info
  var fi = document.getElementById('footer-info');
  if (fi && d.indirizzo && d.email) {
    fi.innerHTML = d.indirizzo + ' &nbsp;·&nbsp; <a href="mailto:' + d.email + '">' + d.email + '</a> &nbsp;·&nbsp; <a href="' + base + 'privacy.html">Privacy policy</a>';
  }

  // Applica social dal footer.json (ha più campi) o da generale.json
  var footerDati = await fetchJSON(base + '_sito/footer.json');
  var src = footerDati || d;

  // Aggiorna copyright
  var copy = document.getElementById('footer-copyright');
  if (copy && src.copyright) copy.textContent = src.copyright;

  // Aggiorna testo descrizione footer
  var desc = document.getElementById('footer-descrizione');
  if (desc && src.testo_descrizione) desc.textContent = src.testo_descrizione;

  // Aggiorna link social nel footer
  var socialEl = document.getElementById('footer-social');
  if (socialEl) {
    var socialHtml = '';
    if (src.facebook) socialHtml += '<a href="' + src.facebook + '" target="_blank" rel="noopener" aria-label="Facebook" class="social-link">Facebook</a>';
    if (src.instagram) socialHtml += '<a href="' + src.instagram + '" target="_blank" rel="noopener" aria-label="Instagram" class="social-link">Instagram</a>';
    if (src.youtube) socialHtml += '<a href="' + src.youtube + '" target="_blank" rel="noopener" aria-label="YouTube" class="social-link">YouTube</a>';
    if (src.tiktok) socialHtml += '<a href="' + src.tiktok + '" target="_blank" rel="noopener" aria-label="TikTok" class="social-link">TikTok</a>';
    if (socialHtml) socialEl.innerHTML = socialHtml;
  }

  // Sostituisce il logo in navbar e footer se impostato dal CMS
  if (d.logo) {
    var logoSrc = base + d.logo.replace(/^\//, '');
    document.querySelectorAll('.logo img, .footer-logo img, #logo-img').forEach(function(img) {
      img.src = logoSrc;
    });
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
  // Rispetta campo pubblicato — se false, non mostrare
  if (ev.pubblicato === false) return '';
  var badges = '';
  if (ev.badge && Array.isArray(ev.badge)) {
    badges = ev.badge.map(function (b) { return '<span class="badge-tipo ' + b.classe + '">' + b.testo + '</span>'; }).join('');
  } else if (ev.badge1) {
    badges = '<span class="badge-tipo ' + ev.badge1 + '">' + (ev.categoria || '') + '</span>';
  }
  var url = ev.url ? (base + ev.url) : 'eventi.html';
  var titolo = t(ev.titolo, ev.titolo_en);
  var anteprima = t(ev.anteprima, ev.anteprima_en);
  // Bottone aggiungi al calendario (Google Calendar)
  var calBtn = '';
  if (ev.data_completa) {
    var gcUrl = 'https://calendar.google.com/calendar/render?action=TEMPLATE'
      + '&text=' + encodeURIComponent(titolo)
      + '&details=' + encodeURIComponent(anteprima)
      + '&location=' + encodeURIComponent(ev.luogo || 'Ragusa');
    calBtn = '<a href="' + gcUrl + '" target="_blank" rel="noopener" style="font-size:.75rem;color:var(--oro,#b8972c);text-decoration:none;margin-left:.8rem;" title="Aggiungi al calendario">📅 +Cal</a>';
  }
  return '<article class="evento-card" data-categoria="' + (ev.categoria || '') + '" data-mese="' + (ev.mese || '') + '">'
    + '<div class="evento-card-header">'
    + '<div class="evento-data-grande"><span class="giorno">' + (ev.giorno || '&mdash;') + '</span>'
    + '<span class="mese">' + (ev.mese || '') + '</span></div>'
    + '<div class="evento-card-meta">'
    + '<div>' + badges + '</div>'
    + '<h3>' + titolo + '</h3>'
    + '<p>' + (ev.sottotitolo || '') + '</p>'
    + '</div></div>'
    + '<div class="evento-card-body">'
    + '<p>' + anteprima + '</p>'
    + '<a href="' + url + '" class="evento-link">Scopri</a>' + calBtn
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
  if (n.pubblicata === false) return '';
  var titolo = t(n.titolo, n.titolo_en);
  var anteprima = t(n.anteprima, n.anteprima_en);
  return '<article class="notizia-card">'
    + '<div class="notizia-meta"><span class="notizia-badge">' + (n.badge_testo || n.categoria || 'Notizia') + '</span>'
    + '<span class="notizia-data">' + (n.data || '') + '</span></div>'
    + '<h3 class="notizia-titolo">' + titolo + '</h3>'
    + '<p class="notizia-anteprima">' + anteprima + '</p>'
    + '</article>';
}

async function caricaNotizie() {
  var grid = document.getElementById('notizie-grid');
  if (!grid) return;
  var base = basePath();
  var idx = await fetchJSON(base + '_notizie/index.json');

  if ((!idx || idx.length === 0) && typeof NOTIZIE_PAST !== 'undefined') {
    grid.innerHTML = NOTIZIE_PAST.filter(function(n){ return n.pubblicata !== false; }).map(renderCardNotizia).join('');
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
  grid.innerHTML = notizie.filter(function(n){ return n.pubblicata !== false; }).map(renderCardNotizia).join('');
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
  // Rispetta campo pubblicato
  luoghi = luoghi.filter(function(l) { return l.pubblicato !== false; });
  menu.innerHTML = luoghi.map(function(l) {
    var nome = t(l.titolo, l.titolo_en) || l.slug;
    return '<a href="' + base + 'luoghi/' + (l.slug || '') + '.html">' + nome + '</a>';
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

  // Rispetta campo pubblicato
  luoghi = luoghi.filter(function(l) { return l.pubblicato !== false; });

  // Genera filtri categorie dinamici
  var filterBar = document.getElementById('luoghi-filter-bar');
  if (filterBar) {
    var cats = ['tutti'];
    luoghi.forEach(function(l) { if (l.categoria && cats.indexOf(l.categoria) === -1) cats.push(l.categoria); });
    filterBar.innerHTML = cats.map(function(c) {
      return '<a class="filter-pill' + (c === 'tutti' ? ' active' : '') + '" data-categoria="' + c + '">' + (c === 'tutti' ? 'Tutti' : c) + '</a>';
    }).join('');
    filterBar.addEventListener('click', function(e) {
      var pill = e.target.closest('.filter-pill');
      if (!pill) return;
      filterBar.querySelectorAll('.filter-pill').forEach(function(p) { p.classList.remove('active'); });
      pill.classList.add('active');
      var cat = pill.dataset.categoria;
      document.querySelectorAll('#luoghi-grid .course-card').forEach(function(c) {
        c.style.display = (cat === 'tutti' || c.dataset.categoria === cat) ? '' : 'none';
      });
    });
  }

  grid.innerHTML = luoghi.map(function (l) {
    var imgStyle = l.immagine ? 'background-image:url(\'' + base + l.immagine.replace(/^\//,'') + '\');background-size:cover;background-position:center;' : '';
    var colore = l.colore_principale || 'var(--blu-medio)';
    var titolo = t(l.titolo, l.titolo_en);
    var descrizione = t(l.descrizione_breve, l.descrizione_breve_en);

    // Icone accessibilità
    var iconeAcc = '';
    if (l.accessibile_sedia) iconeAcc += '<span title="Accessibile in sedia a rotelle" style="font-size:1rem;">♿</span>';
    if (l.audioguida) iconeAcc += '<span title="Audioguida disponibile" style="font-size:1rem;">🎧</span>';
    if (l.lingua_segni) iconeAcc += '<span title="Disponibile LIS" style="font-size:1rem;">🤟</span>';
    if (iconeAcc) iconeAcc = '<div style="margin-top:.4rem;display:flex;gap:.3rem;">' + iconeAcc + '</div>';

    // Badge durata visita
    var durataHtml = '';
    if (l.durata_visita) {
      durataHtml = '<span style="font-size:.7rem;background:rgba(184,151,44,.15);color:var(--oro,#b8972c);border:1px solid var(--oro,#b8972c);border-radius:4px;padding:.1rem .45rem;margin-left:.4rem;">⏱ ' + l.durata_visita + '</span>';
    }

    return '<a href="' + base + 'luoghi/' + l.slug + '.html" class="course-card" data-categoria="' + (l.categoria || '') + '">'
      + '<div class="course-thumb" style="' + imgStyle + '">'
      + '<span class="course-badge" style="border-color:' + colore + ';color:' + colore + '">' + (l.categoria || '') + '</span>'
      + '</div>'
      + '<div class="course-body">'
      + '<h3>' + titolo + durataHtml + '</h3>'
      + '<p>' + descrizione + '</p>'
      + '<div class="course-meta">'
      + '<span>' + t(l.orari, l.orari_en) + '</span>'
      + '<span>' + (l.prezzo || '') + '</span>'
      + '</div>'
      + iconeAcc
      + '<span class="book-link">Scopri e prenota</span>'
      + '</div></a>';
  }).join('');
}

/* ──────────────────────────────────────────
   SFONDO PAGINA (da _sito/sfondi.json)
────────────────────────────────────────── */
async function caricaSfondoPagina() {
  var base = basePath();
  var d = await fetchJSON(base + '_sito/sfondi.json');
  if (!d) return;
  // Determina la chiave pagina dal nome file
  var nomePagina = window.location.pathname.split('/').pop().replace('.html','') || 'home';
  if (nomePagina === 'index') nomePagina = 'home';
  var sfondo = d[nomePagina];
  if (!sfondo) return;
  // Applica come sfondo al page-header (banner in cima) se esiste
  var header = document.querySelector('.page-header, .hero-banner, .hero');
  if (header) {
    header.style.backgroundImage = 'url("' + base + sfondo.replace(/^\//,'') + '")';
    header.style.backgroundSize = 'cover';
    header.style.backgroundPosition = 'center';
  }
}

/* ──────────────────────────────────────────
   HERO HOME (immagine e testi da CMS)
────────────────────────────────────────── */
async function caricaHeroHome() {
  var hero = document.querySelector('.hero');
  if (!hero) return;
  var base = basePath();
  var d = await fetchJSON(base + '_sito/home.json');
  if (!d) return;
  // Immagine hero
  if (d.hero_immagine) {
    hero.style.backgroundImage = 'url("' + base + d.hero_immagine.replace(/^\//,'') + '")';
    hero.style.backgroundSize = 'cover';
    hero.style.backgroundPosition = 'center';
  }
  // Testi
  var el = function(id) { return document.getElementById(id); };
  if (d.hero_sovratitolo && el('hero-sovratitolo')) el('hero-sovratitolo').textContent = d.hero_sovratitolo;
  if (d.hero_titolo && el('hero-titolo')) el('hero-titolo').textContent = d.hero_titolo;
  if (d.hero_sottotitolo && el('hero-sottotitolo')) el('hero-sottotitolo').textContent = d.hero_sottotitolo;
  if (d.hero_testo && el('hero-testo')) el('hero-testo').textContent = d.hero_testo;
  if (d.hero_btn1_testo && el('hero-btn1')) { el('hero-btn1').textContent = d.hero_btn1_testo; if (d.hero_btn1_link) el('hero-btn1').href = base + d.hero_btn1_link; }
  if (d.hero_btn2_testo && el('hero-btn2')) { el('hero-btn2').textContent = d.hero_btn2_testo; if (d.hero_btn2_link) el('hero-btn2').href = base + d.hero_btn2_link; }
  // Card (gli id nell'HTML sono card1-titolo, card2-titolo, ecc.)
  ['1','2','3'].forEach(function(n) {
    if (d['card'+n+'_titolo'] && el('card'+n+'-titolo')) el('card'+n+'-titolo').textContent = d['card'+n+'_titolo'];
    if (d['card'+n+'_testo'] && el('card'+n+'-testo')) el('card'+n+'-testo').textContent = d['card'+n+'_testo'];
  });
}

/* ──────────────────────────────────────────
   GALLERIA FOTO
────────────────────────────────────────── */
async function caricaGalleria() {
  var contenitore = document.getElementById('galleria-section');
  if (!contenitore) return;
  var base = basePath();
  var d = await fetchJSON(base + '_sito/galleria.json');
  if (!d || !d.attiva || !d.foto || d.foto.length === 0) {
    contenitore.style.display = 'none'; return;
  }
  var html = '<div class="container" style="padding:3rem 1rem;">'
    + '<h2 style="text-align:center;margin-bottom:2rem;">' + (d.titolo_sezione || 'Galleria') + '</h2>'
    + '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:1rem;">'
    + d.foto.map(function(f) {
      var src = base + (typeof f === 'string' ? f : f.url || '').replace(/^\//,'');
      var alt = typeof f === 'object' && f.didascalia ? f.didascalia : '';
      return '<figure style="margin:0;border-radius:8px;overflow:hidden;cursor:pointer;" onclick="apriLightbox(this)">'
        + '<img src="' + src + '" alt="' + alt + '" style="width:100%;height:200px;object-fit:cover;display:block;" loading="lazy">'
        + (alt ? '<figcaption style="padding:.4rem .6rem;font-size:.8rem;opacity:.7;">' + alt + '</figcaption>' : '')
        + '</figure>';
    }).join('') + '</div></div>'
    // Lightbox minimale
    + '<div id="past-lightbox" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,.9);z-index:9999;align-items:center;justify-content:center;cursor:zoom-out;" onclick="this.style.display=\'none\'">'
    + '<img id="past-lightbox-img" src="" style="max-width:90vw;max-height:90vh;object-fit:contain;border-radius:4px;">'
    + '</div>';
  contenitore.innerHTML = html;
  contenitore.style.display = '';
}
window.apriLightbox = function(fig) {
  var img = fig.querySelector('img');
  var lb = document.getElementById('past-lightbox');
  var lbImg = document.getElementById('past-lightbox-img');
  if (lb && lbImg && img) { lbImg.src = img.src; lb.style.display = 'flex'; }
};

/* ──────────────────────────────────────────
   PRIVACY (contenuto da CMS)
────────────────────────────────────────── */
async function caricaPrivacy() {
  var contenitore = document.getElementById('privacy-content-cms');
  if (!contenitore) return;
  var base = basePath();
  var d = await fetchJSON(base + '_sito/privacy.json');
  if (!d) return;
  var titoloPagina = document.querySelector('.page-header h1');
  if (titoloPagina && d.titolo) titoloPagina.textContent = d.titolo;
  var tag = document.querySelector('.page-header .page-tag');
  if (tag && d.tag) tag.textContent = d.tag;
  var html = '';
  if (d.ultimo_aggiornamento) html += '<p class="ultimo-aggiornamento">Ultimo aggiornamento: ' + d.ultimo_aggiornamento + '</p>';
  if (d.sezioni && d.sezioni.length > 0) {
    d.sezioni.forEach(function(s) {
      html += '<h2>' + (s.titolo || '') + '</h2><p>' + (s.testo || '') + '</p>';
    });
  }
  contenitore.innerHTML = html;
}

/* ──────────────────────────────────────────
   PRENOTA (testi da CMS)
────────────────────────────────────────── */
async function caricaPrenota() {
  var titoloPagina = document.querySelector('.page-header h1');
  if (!titoloPagina) return;
  if (window.location.pathname.indexOf('prenota') === -1) return;
  var base = basePath();
  var d = await fetchJSON(base + '_sito/prenota.json');
  if (!d) return;
  if (d.titolo) titoloPagina.textContent = d.titolo;
  var tag = document.querySelector('.page-header .page-tag');
  if (tag && d.tag) tag.textContent = d.tag;
  var sottotitolo = document.querySelector('.booking-form .subtitle');
  if (sottotitolo && d.sottotitolo) sottotitolo.textContent = d.sottotitolo;
}

/* ──────────────────────────────────────────
   COLORI SITO (variabili CSS da CMS)
────────────────────────────────────────── */
async function caricaColori() {
  var base = basePath();
  var d = await fetchJSON(base + '_sito/colori.json');
  if (!d) return;
  var root = document.documentElement;
  // Mappa campo JSON → variabile CSS effettiva usata nel CSS del sito
  var map = {
    'blu_scuro':    '--blu-scuro',
    'blu_medio':    '--blu-medio',
    'blu_chiaro':   '--blu-chiaro',
    'oro':          '--oro',
    'oro_chiaro':   '--oro-scuro',   // --oro-scuro è la variante chiara nel CSS
    'crema':        '--bianco',       // --bianco è il crema nel CSS (#f5f0e8)
    'sfondo_pagina':'--sfondo',       // --sfondo è lo sfondo scuro della pagina
    'testo_scuro':  '--testo'
  };
  Object.keys(map).forEach(function(k) {
    if (d[k]) root.style.setProperty(map[k], d[k]);
  });
}

/* ──────────────────────────────────────────
   MANUTENZIONE
────────────────────────────────────────── */
async function controllaManutenzione() {
  // Non attivare sulla pagina manutenzione stessa
  if (window.location.pathname.indexOf('manutenzione.html') !== -1) return;
  // Bypass: ?bypass=past2026 oppure salvato in sessionStorage
  var params = new URLSearchParams(window.location.search);
  if (params.get('bypass') === 'past2026') {
    sessionStorage.setItem('past_bypass', '1');
    return;
  }
  if (sessionStorage.getItem('past_bypass') === '1') return;
  var base = basePath();
  var d = await fetchJSON(base + '_sito/manutenzione.json');
  if (!d || !d.attiva) return;
  window.location.replace(base + 'manutenzione.html');
}

/* ──────────────────────────────────────────
   BANNER ANNUNCIO
────────────────────────────────────────── */
async function caricaBanner() {
  var base = basePath();
  var d = await fetchJSON(base + '_sito/banner.json');
  if (!d || !d.attivo) return;
  // Inserisce un banner in cima alla pagina, sotto la navbar
  var coloriMap = {
    'blu':    'background:#1a3a5c;color:#fff;',
    'oro':    'background:#b8972c;color:#fff;',
    'verde':  'background:#2d6a4f;color:#fff;',
    'rosso':  'background:#8b1a1a;color:#fff;',
    'grigio': 'background:#4a4a4a;color:#fff;'
  };
  var stile = coloriMap[d.colore] || coloriMap['blu'];
  var linkHtml = d.link ? (' <a href="' + d.link + '" style="color:inherit;font-weight:700;text-decoration:underline;">' + (d.link_testo || 'Scopri') + ' &rarr;</a>') : '';
  var banner = document.createElement('div');
  banner.id = 'past-banner-annuncio';
  banner.style.cssText = stile + 'text-align:center;padding:10px 20px;font-size:.9rem;letter-spacing:.02em;z-index:999;position:relative;';
  banner.innerHTML = (d.testo || '') + linkHtml
    + '<button onclick="this.parentElement.style.display=\'none\'" style="background:none;border:none;color:inherit;cursor:pointer;float:right;font-size:1.1rem;opacity:.7;margin-top:-2px;" aria-label="Chiudi">✕</button>';
  var navbar = document.querySelector('.navbar');
  if (navbar && navbar.nextSibling) {
    navbar.parentNode.insertBefore(banner, navbar.nextSibling);
  } else {
    document.body.insertBefore(banner, document.body.firstChild);
  }
}

/* ──────────────────────────────────────────
   IN EVIDENZA
────────────────────────────────────────── */
async function caricaInEvidenza() {
  var contenitore = document.getElementById('in-evidenza-section');
  if (!contenitore) return;
  var base = basePath();
  var d = await fetchJSON(base + '_sito/in-evidenza.json');
  if (!d || !d.attivo) { contenitore.style.display = 'none'; return; }
  var imgHtml = d.immagine ? '<img src="' + base + d.immagine.replace(/^\//,'') + '" alt="' + (d.titolo||'') + '" style="width:100%;border-radius:8px;margin-bottom:1.2rem;">' : '';
  var linkHtml = d.link ? '<a href="' + d.link + '" class="btn-principale">' + (d.link_testo || 'Scopri') + '</a>' : '';
  contenitore.innerHTML = '<div class="container" style="padding:3rem 1rem;text-align:center;">'
    + imgHtml
    + '<h2 style="margin-bottom:1rem;">' + (d.titolo || '') + '</h2>'
    + '<p style="max-width:600px;margin:0 auto 1.5rem;">' + (d.contenuto || '') + '</p>'
    + linkHtml + '</div>';
  contenitore.style.display = '';
}

/* ──────────────────────────────────────────
   RECENSIONI
────────────────────────────────────────── */
async function caricaRecensioni() {
  var contenitore = document.getElementById('recensioni-section');
  if (!contenitore) return;
  var base = basePath();
  var d = await fetchJSON(base + '_sito/recensioni.json');
  if (!d || !d.attivo || !d.recensioni || d.recensioni.length === 0) {
    contenitore.style.display = 'none'; return;
  }
  var stelle = function(n) {
    var s = '';
    for (var i = 0; i < 5; i++) s += (i < n) ? '★' : '☆';
    return s;
  };
  var html = '<div class="container" style="padding:3rem 1rem;">'
    + '<h2 style="text-align:center;margin-bottom:2rem;">' + (d.titolo_sezione || 'Recensioni') + '</h2>'
    + '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:1.5rem;">'
    + d.recensioni.map(function(r) {
      return '<div style="background:var(--crema,#f9f5ec);border-radius:12px;padding:1.5rem;box-shadow:0 2px 8px rgba(0,0,0,.07);">'
        + '<div style="color:#b8972c;font-size:1.2rem;margin-bottom:.5rem;">' + stelle(r.stelle || 5) + '</div>'
        + '<p style="font-style:italic;margin-bottom:1rem;">"' + (r.testo || '') + '"</p>'
        + '<div style="font-weight:700;font-size:.9rem;">' + (r.nome || '') + '</div>'
        + (r.luogo ? '<div style="font-size:.8rem;opacity:.7;">' + r.luogo + '</div>' : '')
        + (r.data ? '<div style="font-size:.75rem;opacity:.5;margin-top:.3rem;">' + r.data + '</div>' : '')
        + '</div>';
    }).join('') + '</div></div>';
  contenitore.innerHTML = html;
  contenitore.style.display = '';
}

/* ──────────────────────────────────────────
   RASSEGNA STAMPA
────────────────────────────────────────── */
async function caricaRassegnaStampa() {
  var contenitore = document.getElementById('rassegna-stampa-section');
  if (!contenitore) return;
  var base = basePath();
  var d = await fetchJSON(base + '_sito/rassegna-stampa.json');
  if (!d || !d.attivo || !d.articoli || d.articoli.length === 0) {
    contenitore.style.display = 'none'; return;
  }
  var html = '<div class="container" style="padding:3rem 1rem;">'
    + '<h2 style="text-align:center;margin-bottom:2rem;">' + (d.titolo_sezione || 'Rassegna stampa') + '</h2>'
    + '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:1.2rem;">'
    + d.articoli.map(function(a) {
      var linkTarget = a.pdf || a.url;
      var tag = '<div style="border:1px solid var(--oro,#b8972c);border-radius:8px;padding:1.2rem;">'
        + '<div style="font-size:.8rem;font-weight:700;color:var(--blu-medio,#1a3a5c);margin-bottom:.4rem;">' + (a.testata || '') + ' · ' + (a.data || '') + '</div>'
        + '<p style="font-weight:600;margin:0;">' + (a.titolo || '') + '</p>';
      if (linkTarget) tag += '<a href="' + linkTarget + '" target="_blank" rel="noopener" style="font-size:.8rem;color:var(--oro,#b8972c);text-decoration:none;margin-top:.6rem;display:inline-block;">Leggi articolo &rarr;</a>';
      tag += '</div>';
      return tag;
    }).join('') + '</div></div>';
  contenitore.innerHTML = html;
  contenitore.style.display = '';
}

/* ──────────────────────────────────────────
   FAQ
────────────────────────────────────────── */
async function caricaFaq() {
  var contenitore = document.getElementById('faq-section');
  if (!contenitore) return;
  var base = basePath();
  var d = await fetchJSON(base + '_sito/faq.json');
  if (!d || !d.attivo || !d.domande || d.domande.length === 0) {
    contenitore.style.display = 'none'; return;
  }
  var html = '<div class="container" style="padding:3rem 1rem;max-width:800px;margin:0 auto;">'
    + '<h2 style="text-align:center;margin-bottom:2rem;">' + (d.titolo_sezione || 'FAQ') + '</h2>'
    + d.domande.map(function(f, i) {
      var id = 'faq-' + i;
      return '<details style="border:1px solid #ddd;border-radius:8px;margin-bottom:.8rem;overflow:hidden;">'
        + '<summary style="padding:1rem 1.2rem;cursor:pointer;font-weight:600;list-style:none;display:flex;justify-content:space-between;align-items:center;">'
        + (f.domanda || '') + ' <span style="font-size:1.2rem;opacity:.5;">+</span></summary>'
        + '<div style="padding:.8rem 1.2rem 1.2rem;border-top:1px solid #eee;">' + (f.risposta || '') + '</div>'
        + '</details>';
    }).join('') + '</div>';
  contenitore.innerHTML = html;
  contenitore.style.display = '';
}

/* ──────────────────────────────────────────
   NEWSLETTER
────────────────────────────────────────── */
async function caricaNewsletter() {
  var contenitore = document.getElementById('newsletter-section');
  if (!contenitore) return;
  var base = basePath();
  var d = await fetchJSON(base + '_sito/newsletter.json');
  if (!d || !d.attivo) { contenitore.style.display = 'none'; return; }
  var formTarget = d.mailchimp_url ? d.mailchimp_url : '#';
  var formMethod = d.mailchimp_url ? 'post' : '';
  var html = '<div class="container" style="padding:3rem 1rem;text-align:center;max-width:600px;margin:0 auto;">'
    + '<h2 style="margin-bottom:.8rem;">' + (d.titolo || 'Newsletter') + '</h2>'
    + '<p style="margin-bottom:1.5rem;opacity:.8;">' + (d.testo || '') + '</p>'
    + '<form action="' + formTarget + '" method="post" target="_blank" style="display:flex;gap:.6rem;flex-wrap:wrap;justify-content:center;">'
    + '<input type="email" name="EMAIL" placeholder="' + (d.placeholder || 'La tua email') + '" required '
    + 'style="flex:1;min-width:220px;padding:.75rem 1rem;border:1px solid #ccc;border-radius:6px;font-size:1rem;">'
    + '<button type="submit" style="padding:.75rem 1.5rem;background:var(--oro,#b8972c);color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:1rem;font-weight:600;">'
    + (d.bottone || 'Iscriviti') + '</button>'
    + '</form>'
    + (d.privacy_testo ? '<p style="font-size:.75rem;margin-top:1rem;opacity:.55;">'
      + (d.privacy_url ? '<a href="' + d.privacy_url + '" style="color:inherit;">' + d.privacy_testo + '</a>' : d.privacy_testo)
      + '</p>' : '')
    + '</div>';
  contenitore.innerHTML = html;
  contenitore.style.display = '';
}

/* ──────────────────────────────────────────
   LINGUA (IT/EN)
────────────────────────────────────────── */
function getLingua() {
  return localStorage.getItem('past_lingua') || 'it';
}
function t(it, en) {
  return (getLingua() === 'en' && en) ? en : (it || '');
}

/* ──────────────────────────────────────────
   LE CARD — DINAMICHE (con sezioni)
────────────────────────────────────────── */
async function caricaVitruvioCard() {
  var grid = document.getElementById('vc-grid');
  if (!grid) return;
  var base = basePath();
  var d = await fetchJSON(base + '_sito/vitruvio-card.json');
  if (!d) return;

  var titoloEl = document.getElementById('vc-titolo');
  var introEl = document.getElementById('vc-intro');
  if (titoloEl) titoloEl.textContent = t(d.titolo, d.titolo_en);
  if (introEl) introEl.textContent = t(d.testo_intro, d.testo_intro_en);

  function renderCard(c, sezione) {
    var nome = t(c.nome, c.nome_en);
    var testo = t(c.testo, c.testo_en);
    var imgHtml = c.immagine ? '<img src="' + base + c.immagine.replace(/^\//, '') + '" alt="' + nome + '" />' : '';
    var widgetHtml = c.widget_id ? '<booking-widget widget-id="' + c.widget_id + '"></booking-widget>' : '';
    var prezzoHtml = c.prezzo ? '<div style="font-size:.9rem;font-weight:600;color:var(--oro,#b8972c);margin:.5rem 0;">' + c.prezzo + '</div>' : '';
    return '<a href="#" class="vitruvio-card" data-sezione="' + (sezione || '') + '">'
      + '<div class="vitruvio-thumb" style="background:rgba(122,173,101,0.1);">' + imgHtml + '</div>'
      + '<div class="vitruvio-body"><h3>' + nome + '</h3>' + prezzoHtml + '<p>' + testo + '</p>' + widgetHtml + '</div></a>';
  }

  // Formato nuovo: sezioni[]
  if (d.sezioni && Array.isArray(d.sezioni)) {
    var sezioniAttive = d.sezioni.filter(function(s){ return s.pubblicata !== false; });

    // Genera barra filtri dinamica
    var filterBar = document.getElementById('card-filter-bar');
    if (filterBar && sezioniAttive.length > 1) {
      var pills = ['<a class="filter-pill active" data-sezione="tutti">Tutte</a>'];
      sezioniAttive.forEach(function(s) {
        var nome = t(s.titolo_sezione, s.titolo_sezione_en);
        pills.push('<a class="filter-pill" data-sezione="' + nome + '">' + nome + '</a>');
      });
      filterBar.innerHTML = pills.join('');
      filterBar.addEventListener('click', function(e) {
        var pill = e.target.closest('.filter-pill');
        if (!pill) return;
        filterBar.querySelectorAll('.filter-pill').forEach(function(p){ p.classList.remove('active'); });
        pill.classList.add('active');
        var sel = pill.dataset.sezione;
        grid.querySelectorAll('.vitruvio-card').forEach(function(card) {
          card.style.display = (sel === 'tutti' || card.dataset.sezione === sel) ? '' : 'none';
        });
        grid.querySelectorAll('.card-sezione-header').forEach(function(h) {
          h.style.display = (sel === 'tutti' || h.dataset.sezione === sel) ? '' : 'none';
        });
      });
    } else if (filterBar) {
      filterBar.innerHTML = '';
    }

    // Renderizza le card
    var html = '';
    sezioniAttive.forEach(function(s) {
      var cards = (s.cards || []).filter(function(c){ return c.pubblicata !== false; });
      if (cards.length === 0) return;
      var titoloSez = t(s.titolo_sezione, s.titolo_sezione_en);
      var descSez = t(s.descrizione_sezione, s.descrizione_sezione_en);
      html += '<div class="card-sezione-header" data-sezione="' + titoloSez + '" style="width:100%;grid-column:1/-1;">'
        + '<h2 style="font-size:1.15rem;letter-spacing:.06em;margin-bottom:.3rem;">' + titoloSez + '</h2>'
        + (descSez ? '<p style="font-size:.88rem;opacity:.6;margin-bottom:1.2rem;">' + descSez + '</p>' : '')
        + '</div>';
      html += cards.map(function(c){ return renderCard(c, titoloSez); }).join('');
      html += '<div class="card-sezione-header" data-sezione="' + titoloSez + '" style="width:100%;grid-column:1/-1;border-bottom:1px solid rgba(255,255,255,.07);margin:1.5rem 0;"></div>';
    });
    grid.innerHTML = html || '';
    return;
  }

  // Backward compat: formato cards[] flat
  var cards = [];
  if (d.cards && Array.isArray(d.cards)) {
    cards = d.cards.filter(function(c) { return c.pubblicata !== false; });
  } else {
    ['1','2','3'].forEach(function(n) {
      if (d['card'+n+'_nome']) {
        cards.push({ nome: d['card'+n+'_nome'], testo: d['card'+n+'_testo'], widget_id: d['card'+n+'_widget'], pubblicata: true });
      }
    });
  }
  if (cards.length === 0) { grid.innerHTML = ''; return; }
  grid.innerHTML = cards.map(function(c){ return renderCard(c, ''); }).join('');
}

/* ──────────────────────────────────────────
   FILTRI EVENTI — mese dinamico
────────────────────────────────────────── */
function inizializzaFiltriEventi() {
  var grid = document.getElementById('eventi-grid');
  if (!grid) return;
  setTimeout(function() {
    var cards = grid.querySelectorAll('.evento-card');
    if (cards.length < 2) return;
    var mesiSet = new Set();
    cards.forEach(function(c) { if (c.dataset.mese) mesiSet.add(c.dataset.mese); });
    if (mesiSet.size < 2) return;
    var filtriBar = document.querySelector('.filtri-bar');
    if (!filtriBar) return;
    var mesiFiltri = document.createElement('div');
    mesiFiltri.style.cssText = 'display:flex;gap:.5rem;flex-wrap:wrap;margin:.5rem 0;';
    var tuttiBtn = '<button class="filter-pill active" data-mese="tutti">Tutti i mesi</button>';
    var mesiBtn = Array.from(mesiSet).map(function(m) { return '<button class="filter-pill" data-mese="' + m + '">' + m + '</button>'; }).join('');
    mesiFiltri.innerHTML = tuttiBtn + mesiBtn;
    filtriBar.appendChild(mesiFiltri);
    mesiFiltri.addEventListener('click', function(e) {
      if (!e.target.classList.contains('filter-pill')) return;
      mesiFiltri.querySelectorAll('.filter-pill').forEach(function(b) { b.classList.remove('active'); });
      e.target.classList.add('active');
      var mese = e.target.dataset.mese;
      cards.forEach(function(c) { c.style.display = (mese === 'tutti' || c.dataset.mese === mese) ? '' : 'none'; });
    });
  }, 900);
}

/* ──────────────────────────────────────────
   RICERCA INTERNA
────────────────────────────────────────── */
function inizializzaRicerca() {
  var input = document.getElementById('ricerca-input');
  if (!input) return;
  var risultati = document.getElementById('ricerca-risultati');
  if (!risultati) return;
  var base = basePath();
  var tuttiDati = [];
  var caricato = false;

  async function caricaDatiRicerca() {
    if (caricato) return;
    caricato = true;
    var dati = await Promise.all([
      fetchJSON(base + '_eventi/index.json'),
      fetchJSON(base + '_notizie/index.json'),
      fetchJSON(base + '_luoghi/index.json'),
      fetchJSON(base + '_percorsi/index.json')
    ]);
    var eventi = dati[0], notizie = dati[1], luoghi = dati[2], percorsi = dati[3];
    if (eventi) eventi.forEach(function(e) {
      if (e && e.titolo && e.pubblicato !== false)
        tuttiDati.push({ tipo: 'Evento', titolo: e.titolo, testo: e.anteprima || '', url: base + (e.url || 'eventi.html') });
    });
    if (notizie) notizie.forEach(function(n) {
      if (n && n.titolo && n.pubblicata !== false)
        tuttiDati.push({ tipo: 'Notizia', titolo: n.titolo, testo: n.anteprima || '', url: base + 'notizie.html' });
    });
    if (luoghi) luoghi.forEach(function(l) {
      if (l && l.titolo && l.pubblicato !== false)
        tuttiDati.push({ tipo: 'Luogo', titolo: l.titolo, testo: l.descrizione_breve || '', url: base + 'luoghi/' + (l.slug||'') + '.html' });
    });
    if (percorsi) percorsi.forEach(function(p) {
      if (p && p.titolo && p.pubblicato !== false)
        tuttiDati.push({ tipo: 'Percorso', titolo: p.titolo, testo: p.sottotitolo || '', url: base + 'percorsi/' + (p.slug||'') + '.html' });
    });
  }

  input.addEventListener('focus', caricaDatiRicerca);
  input.addEventListener('input', function() {
    var q = this.value.trim().toLowerCase();
    if (q.length < 2) { risultati.innerHTML = ''; risultati.style.display = 'none'; return; }
    var trovati = tuttiDati.filter(function(d) {
      return d.titolo.toLowerCase().indexOf(q) !== -1 || d.testo.toLowerCase().indexOf(q) !== -1;
    }).slice(0, 8);
    if (trovati.length === 0) {
      risultati.innerHTML = '<div style="padding:.8rem 1rem;opacity:.6;">Nessun risultato per "' + q + '"</div>';
    } else {
      risultati.innerHTML = trovati.map(function(r) {
        return '<a href="' + r.url + '" style="display:block;padding:.7rem 1rem;border-bottom:1px solid rgba(255,255,255,.08);text-decoration:none;color:inherit;">'
          + '<span style="font-size:.7rem;font-weight:700;color:var(--oro,#b8972c);text-transform:uppercase;margin-right:.5rem;">' + r.tipo + '</span>'
          + r.titolo + '</a>';
      }).join('');
    }
    risultati.style.display = 'block';
  });

  document.addEventListener('click', function(e) {
    if (!input.contains(e.target) && !risultati.contains(e.target)) risultati.style.display = 'none';
  });
}

/* ──────────────────────────────────────────
   WHATSAPP SHARE
────────────────────────────────────────── */
function aggiungiBottoneWhatsApp(titolo, url) {
  var testo = encodeURIComponent('🏛 ' + titolo + '\n' + url);
  var btn = document.createElement('a');
  btn.href = 'https://wa.me/?text=' + testo;
  btn.target = '_blank';
  btn.rel = 'noopener';
  btn.style.cssText = 'display:inline-flex;align-items:center;gap:.4rem;background:#25d366;color:#fff;padding:.5rem 1.1rem;border-radius:6px;font-size:.85rem;font-weight:600;text-decoration:none;margin-top:1rem;';
  btn.innerHTML = '📲 Condividi su WhatsApp';
  return btn;
}

/* ──────────────────────────────────────────
   PERCORSI TEMATICI
────────────────────────────────────────── */
async function caricaPercorsi() {
  var grid = document.getElementById('percorsi-grid');
  if (!grid) return;
  var base = basePath();
  var percorsi = await fetchJSON(base + '_percorsi/index.json');
  if (!percorsi || percorsi.length === 0) {
    grid.innerHTML = '<p style="text-align:center;padding:3rem;opacity:.6;grid-column:1/-1;">Nessun percorso disponibile.</p>';
    return;
  }

  var labelLingua = { it: 'IT', en: 'EN', fr: 'FR', de: 'DE', es: 'ES' };

  grid.innerHTML = percorsi
    .filter(function(p) { return p.pubblicato !== false; })
    .map(function(p) {
      var titolo = t(p.titolo, p.titolo_en);
      var sottotitolo = t(p.sottotitolo, p.sottotitolo_en);
      var descrizione = t(p.descrizione, p.descrizione_en);

      // Icone accessibilità
      var acc = '';
      if (p.accessibile_sedia) acc += '<span title="Accessibile in sedia a rotelle">♿</span>';
      if (p.audioguida)        acc += '<span title="Audioguida disponibile">🎧</span>';
      if (p.lingua_segni)      acc += '<span title="Disponibile in LIS">🤟</span>';

      // Badge lingue guida
      var lingueBadge = '';
      if (p.lingue_guida && p.lingue_guida.length > 0) {
        lingueBadge = p.lingue_guida.map(function(l) {
          return '<span style="font-size:.65rem;font-weight:700;border:1px solid var(--oro,#b8972c);color:var(--oro,#b8972c);border-radius:3px;padding:.05rem .35rem;">' + (labelLingua[l] || l.toUpperCase()) + '</span>';
        }).join(' ');
      }

      var imgStyle = p.immagine
        ? 'background-image:url("' + base + p.immagine.replace(/^\//,'') + '");background-size:cover;background-position:center;'
        : 'background:rgba(184,151,44,.07);';

      var nTappe = (p.luoghi && p.luoghi.length) ? p.luoghi.length + ' tappe' : '';
      var durata = p.durata_totale ? '⏱ ' + p.durata_totale : '';

      return '<a href="' + base + 'percorsi/' + p.slug + '.html" style="display:flex;flex-direction:column;border:1px solid rgba(255,255,255,.1);border-radius:12px;overflow:hidden;text-decoration:none;color:inherit;transition:transform .2s;" onmouseover="this.style.transform=\'translateY(-3px)\'" onmouseout="this.style.transform=\'\'">'
        // Thumb
        + '<div style="height:180px;' + imgStyle + 'position:relative;">'
        + (p.difficolta ? '<span style="position:absolute;top:.7rem;right:.7rem;font-size:.7rem;font-weight:700;background:rgba(0,0,0,.55);color:#fff;border-radius:4px;padding:.2rem .55rem;">' + p.difficolta + '</span>' : '')
        + '</div>'
        // Body
        + '<div style="padding:1.2rem;flex:1;display:flex;flex-direction:column;gap:.4rem;">'
        + '<div style="font-size:.7rem;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--oro,#b8972c);">Percorso</div>'
        + '<h3 style="margin:0;font-size:1.15rem;">' + titolo + '</h3>'
        + (sottotitolo ? '<p style="margin:0;font-size:.83rem;opacity:.65;">' + sottotitolo + '</p>' : '')
        // Meta: tappe + durata
        + '<div style="display:flex;gap:.8rem;font-size:.78rem;opacity:.6;margin-top:.3rem;">'
        + (nTappe ? '<span>📍 ' + nTappe + '</span>' : '')
        + (durata ? '<span>' + durata + '</span>' : '')
        + '</div>'
        // Lingue + accessibilità
        + '<div style="display:flex;gap:.5rem;align-items:center;flex-wrap:wrap;margin-top:.5rem;">'
        + lingueBadge
        + (acc ? '<span style="font-size:.95rem;letter-spacing:.1rem;margin-left:auto;">' + acc + '</span>' : '')
        + '</div>'
        + '</div></a>';
    }).join('');
}

/* Aggiunge il bottone WhatsApp a eventi e luoghi nelle pagine dedicate */
(function() {
  var h1 = document.querySelector('.page-header h1, .luogo-hero h1, .evento-hero h1');
  var contenitore = document.querySelector('.luogo-body, .evento-body, .page-content');
  if (h1 && contenitore) {
    var titolo = h1.textContent;
    var btn = aggiungiBottoneWhatsApp(titolo, window.location.href);
    contenitore.appendChild(btn);
  }
})();
