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
    titolo:     'Ragusa Pre-Terremoto',
    sottotitolo:'ore 18:00 · Chiese S. Rocco, S. Filippo Neri, Santa Lucia/S. Maria dello Spasimo e S. F. all'Immacolata',
    giorno:     'mercoledì e giovedì',
    mese:       'Ago',
    categoria:  'apertura',
    anteprima:  'Apertura straordinaria delle chiese costruite prima del terremoto',
    badge:      [
  
      { classe: 'badge-spettacolo',  testo: 'Apertura Straordinaria' }
    ],
    url: 'eventi/ragusa-pre-terremoto.html'
  },
  
{
    titolo:     'San Giorgio, tra Arte e Leggenda',
    sottotitolo:'20:30-23:30 · Duomo San Giorgio',
    giorno:     '15 e 22',
    mese:       'Ago',
    categoria:  'apertura',
    anteprima:  'Apertura straordinaria serale del portone ligneo del Duomo di San Giorgio',
    badge:      [
      { classe: 'badge-spettacolo', testo: 'Apertura serale' }
    ],
    url: 'eventi/san-giorgio-arte-leggenda.html'
  },

  {
    titolo:     'Mostra delle Confraternite Iblee',
    sottotitolo:'21:00-22:00 · Chiesa S. Maria Maddalena',
    giorno:     '19 e 26',
    mese:       'Ago',
    categoria:  'apertura',
    anteprima:  'Apertura Straordinaria serale della Mostra delle Confraternite Iblee',
    badge:      [
      { classe: 'badge-mostra',   testo: 'Mostra' },
      { classe: 'badge-spettacolo', testo: 'Apertura serale' }
    ],
    url: 'eventi/le-confraternite-iblee.html'
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
