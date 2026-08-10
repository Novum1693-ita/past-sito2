/* ============================================================
   P.A.S.T. — DATI NOTIZIE
   ============================================================
   Per aggiungere una notizia: copia un oggetto {}, aggiorna
   tutti i campi e aggiungi IN CIMA all'array (più recenti prima).
   Le prime 3 notizie appaiono automaticamente nel ticker.

   badgeClasse: bn-annuncio | bn-evento | bn-luogo | bn-associazione
   ============================================================ */

var NOTIZIE_PAST = [

  {
    titolo:      'Orari di Apertura Luglio e Agosto 2026',
    anteprima:   'A partire dal 1 agosto i luoghi culturali varieranno i propri orari',
    data:        '20 marzo 2025',
    badgeClasse: 'bn-annuncio',
    badgeTesto:  'Annuncio',
    url:         'notizie/nuovi-orari-aperture.html'
  },

  {
    titolo:      'Variazioni Orari Apertura: 15 agosto',
    anteprima:   'Sabato 15 agosto i luoghi culturali subiranno delle variazioni',
    data:        '10 agosto 2026',
    badgeClasse: 'bn-annuncio',
    badgeTesto:  'Annuncio',
    url:         'notizie/Variazione-Orari-Apertura.html'
  },
  {
    titolo:      'San Giorgio-Tra Arte e Leggenda',
    anteprima:   'Apertura Straordinaria del Portone ligneo del Duomo di San Giorgio',
    data:        '10 agosto 2026',
    badgeClasse: 'bn-evento',
    badgeTesto:  'Evento',
    url:         'eventi/Sangiorgio-traarteeleggenda.html'
  },

  {
    titolo:      'Scopri la Vitruvio Card',
    anteprima:   'La Vitruvio Card ti dà accesso agevolato a tutti i luoghi del progetto P.A.S.T. e ai contenuti culturali esclusivi.',
    data:        '1 marzo 2025',
    badgeClasse: 'bn-luogo',
    badgeTesto:  'Cultura',
    url:         'notizie/vitruvio-card.html'
  },

  /* ── Modello per nuova notizia ─────────────────────────────
  {
    titolo:      'Titolo della notizia',
    anteprima:   'Testo di anteprima — massimo 2-3 righe.',
    data:        'GG mese AAAA',
    badgeClasse: 'bn-annuncio',
    badgeTesto:  'Annuncio',
    url:         'notizie/nome-file.html'
  },
  ─────────────────────────────────────────────────────────── */

];
