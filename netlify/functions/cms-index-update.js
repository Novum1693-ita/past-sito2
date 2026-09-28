// ============================================================
// Netlify Function: cms-index-update
// Aggiorna automaticamente _eventi/index.json e 
// _notizie/index.json quando Decap CMS pubblica un file
//
// Da configurare su Netlify:
//   Environment Variables:
//     GITHUB_TOKEN  = personal access token con repo scope
//     GITHUB_OWNER  = il tuo username GitHub
//     GITHUB_REPO   = nome del repository
// ============================================================

const https = require('https');

const OWNER = process.env.GITHUB_OWNER;
const REPO  = process.env.GITHUB_REPO;
const TOKEN = process.env.GITHUB_TOKEN;
const BRANCH = 'main';

function ghRequest(method, path, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const options = {
      hostname: 'api.github.com',
      path: '/repos/' + OWNER + '/' + REPO + path,
      method,
      headers: {
        'Authorization': 'token ' + TOKEN,
        'User-Agent': 'past-sito-cms',
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.github.v3+json',
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {})
      }
    };
    const req = https.request(options, res => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(body) }); }
        catch(e) { resolve({ status: res.statusCode, data: body }); }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function getFile(filePath) {
  const res = await ghRequest('GET', '/contents/' + filePath + '?ref=' + BRANCH);
  if (res.status === 404) return { content: null, sha: null };
  if (res.status !== 200) throw new Error('GitHub GET error: ' + res.status);
  const content = Buffer.from(res.data.content, 'base64').toString('utf8');
  return { content, sha: res.data.sha };
}

async function putFile(filePath, content, sha, message) {
  const body = {
    message,
    content: Buffer.from(content).toString('base64'),
    branch: BRANCH,
  };
  if (sha) body.sha = sha;
  const res = await ghRequest('PUT', '/contents/' + filePath, body);
  if (res.status !== 200 && res.status !== 201) {
    throw new Error('GitHub PUT error: ' + res.status + ' ' + JSON.stringify(res.data));
  }
  return res;
}

const INDEX_FIELDS = {
  '_eventi': ['titolo', 'sottotitolo', 'giorno', 'mese', 'categoria', 'anteprima', 'badge1', 'badge2', 'immagine', 'url'],
  '_notizie': ['titolo', 'anteprima', 'data', 'badge_testo', 'categoria'],
  '_luoghi': ['titolo', 'slug', 'categoria', 'tag_extra', 'descrizione_breve', 'orari', 'prezzo', 'immagine', 'colore_principale'],
};

async function aggiornaIndex(folder) {
  const res = await ghRequest('GET', '/contents/' + folder + '?ref=' + BRANCH);
  if (res.status !== 200) return;

  const jsonFiles = res.data
    .filter(f => f.name.endsWith('.json') && f.name !== 'index.json')
    .sort((a, b) => a.name.localeCompare(b.name));

  const fields = INDEX_FIELDS[folder] || [];
  const oggetti = await Promise.all(jsonFiles.map(async (f) => {
    try {
      const { content } = await getFile(folder + '/' + f.name);
      if (!content) return null;
      const dati = JSON.parse(content);
      if (folder === '_eventi' && !dati.url) {
        dati.url = 'eventi/' + f.name.replace('.json', '.html');
      }
      const obj = {};
      fields.forEach(k => { if (dati[k] !== undefined) obj[k] = dati[k]; });
      if (folder === '_eventi' && dati.url) obj.url = dati.url;
      return obj;
    } catch(e) { return null; }
  }));

  const items = oggetti.filter(Boolean);
  const newContent = JSON.stringify(items, null, 2);

  const { content: oldContent, sha } = await getFile(folder + '/index.json');

  if (oldContent) {
    try {
      if (JSON.stringify(JSON.parse(oldContent)) === JSON.stringify(items)) {
        return { folder, unchanged: true };
      }
    } catch(e) {}
  }

  await putFile(
    folder + '/index.json',
    newContent,
    sha,
    'auto: aggiorna ' + folder + '/index.json [skip ci]'
  );
  return { folder, count: items.length };
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  if (!TOKEN || !OWNER || !REPO) {
    console.error('Mancano le variabili GITHUB_TOKEN, GITHUB_OWNER o GITHUB_REPO');
    return { statusCode: 500, body: 'Configurazione mancante' };
  }

  try {
    const risultati = await Promise.all([
      aggiornaIndex('_eventi'),
      aggiornaIndex('_notizie'),
    ]);
    console.log('Index aggiornati:', risultati);
    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true, risultati })
    };
  } catch (err) {
    console.error('Errore aggiornamento index:', err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
