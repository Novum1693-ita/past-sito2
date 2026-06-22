/* ============================================================
   P.A.S.T. — DATI EVENTI
   ============================================================
   Per aggiungere un evento: copia un oggetto {}, aggiorna
   tutti i campi e aggiungi in cima all'array (più recenti prima).

   url: percorso relativo dalla root del sito
   categoria: deve corrispondere a un data-categoria nei filtri
   badge: array di { classe, testo }
     classi disponibili: badge-mostra, badge-workshop,
                         badge-spettacolo, badge-incontro, badge-gratuito
   ============================================================ */

var EVENTI_PAST = [

  {
    titolo:     'Inaugurazione nuovo allestimento Museo del Duomo',
    sottotitolo:'Ore 17:30 · Museo del Duomo',
    giorno:     '23',
    mese:       'Apr',
    categoria:  'inaugurazione',
    anteprima:  'Inaugurazione del nuovo allestimento permanente del Museo del Duomo di Ragusa.',
    badge:      [
      { classe: 'badge-mostra',   testo: 'Inaugurazione' },
      { classe: 'badge-gratuito', testo: 'Ingresso libero' }
    ],
    url: 'eventi/inaugurazione-museo-duomo.html'
  },

  {
    titolo:     'San Giorgio, tra Arte e Leggenda',
    sottotitolo:'Apertura serale · Duomo San Giorgio',
    giorno:     '24',
    mese:       'Apr',
    categoria:  'apertura',
    anteprima:  'Apertura straordinaria serale del Duomo San Giorgio con visita guidata e racconto storico.',
    badge:      [
      { classe: 'badge-spettacolo', testo: 'Apertura serale' }
    ],
    url: 'eventi/san-giorgio-arte-leggenda.html'
  },

  {
    titolo:     'DocuFilm San Giorgio',
    sottotitolo:'Ore 20:30 · Proiezione documentario',
    giorno:     '28',
    mese:       'Mag',
    categoria:  'proiezione',
    anteprima:  'Proiezione del documentario dedicato alla storia del Duomo San Giorgio e del barocco ragusano.',
    badge:      [
      { classe: 'badge-incontro',  testo: 'Documentario' },
      { classe: 'badge-gratuito',  testo: 'Ingresso libero' }
    ],
    url: 'eventi/docufilm-san-giorgio.html'
  },

  /* ── Modello per nuovo evento ──────────────────────────────
  {
    titolo:     'Titolo evento',
    sottotitolo:'Ore HH:MM · Luogo',
    giorno:     'GG',
    mese:       'MMM',
    categoria:  'categoria',
    anteprima:  'Descrizione breve dell\'evento in 1-2 righe.',
    badge:      [
      { classe: 'badge-mostra', testo: 'Tipo' }
    ],
    url: 'eventi/nome-file.html'
  },
  ─────────────────────────────────────────────────────────── */

];
