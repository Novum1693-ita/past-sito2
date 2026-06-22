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
    titolo:      'Nuovi orari di apertura dal 27 marzo',
    anteprima:   'A partire dal 27 marzo i luoghi aderenti al progetto P.A.S.T. adottano nuovi orari primaverili.',
    data:        '20 marzo 2025',
    badgeClasse: 'bn-annuncio',
    badgeTesto:  'Annuncio',
    url:         'notizie/nuovi-orari-aperture.html'
  },

  {
    titolo:      'Inaugurazione nuovo allestimento Museo del Duomo',
    anteprima:   'Il 23 aprile viene inaugurato il nuovo allestimento permanente del Museo del Duomo di Ragusa.',
    data:        '10 marzo 2025',
    badgeClasse: 'bn-evento',
    badgeTesto:  'Evento',
    url:         'notizie/inaugurazione-museo-duomo.html'
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
