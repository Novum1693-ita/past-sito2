// Script di build — genera automaticamente index.json per ogni collezione
// Viene eseguito da Netlify ad ogni deploy (vedi netlify.toml → build.command)

const fs   = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

const CAMPI = {
  '_eventi':  ['titolo','sottotitolo','giorno','mese','categoria','anteprima','badge1','badge2','immagine','url','pubblicato','data_completa','tariffe','prezzo'],
  '_notizie': ['titolo','anteprima','data','badge_testo','categoria','pubblicata','slug'],
  '_luoghi':  ['titolo','slug','categoria','tag_extra','descrizione_breve','orari','prezzo','tariffe','lat','lng','immagine','colore_principale','pubblicato'],
  '_percorsi':['titolo','titolo_en','sottotitolo','sottotitolo_en','slug','immagine','durata_totale','difficolta','lingue_guida','luoghi','accessibile_sedia','audioguida','lingua_segni','pubblicato'],
};

function generaIndex(cartella) {
  const dir = path.join(ROOT, cartella);
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir)
    .filter(f => f.endsWith('.json') && f !== 'index.json')
    .sort();
  const campi = CAMPI[cartella] || [];
  const items = [];
  files.forEach(function(file) {
    try {
      const dati = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
      if (cartella === '_eventi' && !dati.url)
        dati.url = 'eventi/' + file.replace('.json', '.html');
      if (!dati.slug)
        dati.slug = file.replace('.json', '');
      const obj = {};
      campi.forEach(function(k) { if (dati[k] !== undefined) obj[k] = dati[k]; });
      items.push(obj);
    } catch(e) { console.warn('Errore ' + file + ':', e.message); }
  });
  fs.writeFileSync(path.join(dir, 'index.json'), JSON.stringify(items, null, 2));
  console.log('OK ' + cartella + '/index.json -> ' + items.length + ' voci');
}

console.log('Generazione indici P.A.S.T...');
Object.keys(CAMPI).forEach(generaIndex);
console.log('Fatto.');
