// Met à jour la liste des codes de Validation de levé (const DICT.codes) à partir de la liste maîtresse.
// Usage (à la racine du dépôt APP-PCodes) : node tools/maj-validation-leve.js chemin/vers/validation-leve/index.html
// Remplace code, APH, description, catégorie, couche et type de chaque code ; garde l'ordre existant
// et la table des couches (DICT.layers). Les codes absents de Validation de levé sont ajoutés à la fin.
'use strict';
const fs = require('fs'), path = require('path');
const cible = process.argv[2];
if (!cible) { console.error('Usage : node tools/maj-validation-leve.js validation-leve/index.html'); process.exit(1); }
const { codes } = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'donnees', 'codes.json'), 'utf8'));
let html = fs.readFileSync(cible, 'utf8');
const re = /const DICT=(\{.*?\});\n/s;
const m = re.exec(html);
if (!m) { console.error('const DICT introuvable dans ' + cible); process.exit(1); }
const dict = JSON.parse(m[1]);
const maitre = new Map(codes.map(c => [c.code, c]));
const sansCouche = [];
let changes = 0;
const ligne = (c, ancien) => {
  const couche = c.couche || (ancien && ancien[4]) || '';
  const type = c.type || (ancien && ancien[5]) || 'd';
  if (!couche) sansCouche.push(c.code);
  return [Number(c.code), c.aph, c.description, c.categorie, couche, type];
};
const vus = new Set();
dict.codes = dict.codes.filter(a => maitre.has(String(a[0]))).map(a => {
  const n = ligne(maitre.get(String(a[0])), a); vus.add(String(a[0]));
  if (JSON.stringify(n) !== JSON.stringify(a)) changes++;
  return n;
});
const retires = JSON.parse(m[1]).codes.length - dict.codes.length;
for (const c of codes) if (!vus.has(c.code)) { dict.codes.push(ligne(c)); changes++; }
html = html.replace(re, () => 'const DICT=' + JSON.stringify(dict) + ';\n');
fs.writeFileSync(cible, html);
console.log(`Validation de levé : ${dict.codes.length} codes, ${changes} modifié(s) ou ajouté(s), ${retires} retiré(s).`);
if (sansCouche.length) console.log('À compléter (couche DXF vide) : ' + sansCouche.join(', '));
