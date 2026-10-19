// Questa function viene chiamata automaticamente da Netlify
// dopo ogni deploy riuscito — aggiorna gli index.json
// 
// Funziona come "Deploy notifications > Outgoing webhook"
// impostato su https://tuosito.netlify.app/.netlify/functions/cms-index-update

// Re-esporta la stessa logica
module.exports = require('./cms-index-update');
