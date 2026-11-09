// Pcodes et Liaisons — régénère les listes de index.html à partir de la liste maîtresse.
// Usage (à la racine du dépôt APP-PCodes) : node tools/generer.js
//   lit   donnees/codes.json  (440 Pcodes : code, aph, description, categorie, couche, type, motscles)
//         donnees/nat.json    (types de levé + natures NAT)
//   écrit index.html          (const CODES = [...] et les tableaux « Type de levé (#) » et « Natures (NAT) »)
// Ne jamais modifier ces listes à la main dans index.html : modifier donnees/*.json puis relancer ce script.
// Le format produit reste lisible par tools/maj-codes.js de Collecte GNSS.
'use strict';
const fs = require('fs'), path = require('path');
const racine = path.join(__dirname, '..');
const lire = f => JSON.parse(fs.readFileSync(path.join(racine, f), 'utf8'));
const { codes } = lire('donnees/codes.json');
const { nat, types } = lire('donnees/nat.json');

// Contrôles de la liste maîtresse
const err = [], vus = new Set();
for (const c of codes) {
  if (!/^\d+$/.test(c.code)) err.push(`code « ${c.code} » : chiffres seulement`);
  if (vus.has(c.code)) err.push(`code ${c.code} en double`); vus.add(c.code);
  if (!/^[A-Z0-9]{2,4}$/.test(c.aph || '')) err.push(`code ${c.code} : APH « ${c.aph} » invalide`);
  if (!c.description) err.push(`code ${c.code} : description vide`);
  if (!c.categorie) err.push(`code ${c.code} : catégorie vide`);
}
for (const n of nat) if (!/^[A-Z]{3}$/.test(n.code)) err.push(`NAT « ${n.code} » : 3 lettres`);
if (new Set(nat.map(n => n.code)).size !== nat.length) err.push('NAT en double');
for (const t of types) if (!/^[1-9]$/.test(t.code)) err.push(`type de levé « ${t.code} » : 1 chiffre`);
if (codes.length < 100 || nat.length < 10 || types.length < 3) err.push('liste incomplète');
if (err.length) { console.error('Liste maîtresse à corriger :\n- ' + err.join('\n- ')); process.exit(1); }

const fichier = path.join(racine, 'index.html');
let html = fs.readFileSync(fichier, 'utf8');
const remplacer = (re, quoi, nom) => {
  if (!re.test(html)) throw new Error(nom + ' introuvable dans index.html');
  html = html.replace(re, () => quoi);
};

// 1. Liste des codes (une seule ligne, triée par numéro)
const liste = codes.slice().sort((a, b) => +a.code - +b.code).map(c => {
  const o = { code: c.code, aph: c.aph, description: c.description, categorie: c.categorie };
  if (c.motscles) o.motscles = c.motscles;
  return o;
});
remplacer(/const CODES = \[.*?\];/s, 'const CODES = ' + JSON.stringify(liste) + ';', 'const CODES');

// 2. Tableaux HTML (même format qu'avant : <tr><td><code>X</code></td><td>Description</td></tr>)
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const lignes = l => l.map(x => `<tr><td><code>${esc(x.code)}</code></td><td>${esc(x.description)}</td></tr>`).join('');
for (const [titre, l] of [['Type de levé (#)', types], ['Natures (NAT)', nat.slice().sort((a, b) => a.code.localeCompare(b.code))]]) {
  const re = new RegExp('(<h3>' + titre.replace(/[()#]/g, '\\$&') + '</h3>\\s*<table>).*?(</table>)', 's');
  if (!re.test(html)) throw new Error('Tableau « ' + titre + ' » introuvable dans index.html');
  html = html.replace(re, (m, a, b) => a + lignes(l) + b);
}

fs.writeFileSync(fichier, html);
console.log(`index.html régénéré : ${liste.length} codes (${liste.filter(c => c.motscles).length} avec mots-clés), ${types.length} types de levé, ${nat.length} natures.`);
