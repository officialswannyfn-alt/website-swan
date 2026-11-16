const fs = require('fs');
const vm = require('vm');
const path = require('path');
let errors = [];
for (const file of ['index.html', 'gallery.html', 'characters.html', 'commissions.html', 'about.html']) {
 const html = fs.readFileSync(file,'utf8');
 for (const [,src] of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
  if (/^(?:https?:|#|data:|mailto:)/.test(src) || src.includes('${') || !src) continue;
  const [target,hash] = src.split('#');
  const decoded = decodeURIComponent(target);
  if (!fs.existsSync(decoded)) errors.push(`${file}: missing ${src}`);
  else if (hash && path.extname(decoded)==='.html' && !fs.readFileSync(decoded,'utf8').includes(`id="${hash}"`)) errors.push(`${file}: missing anchor ${src}`);
 }
 for(const [,script] of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)) {
  try { new vm.Script(script); } catch(e) {errors.push(`${file}: ${e.message}`);}
 }
 if (!html.includes('site.css')) errors.push(`${file}: missing shared stylesheet`);
 console.log(`Checked ${file}: assets, destinations, inline JavaScript, theme`);
}
new vm.Script(fs.readFileSync('site.js','utf8'));
if(errors.length){ console.error(errors.join('\n')); process.exitCode=1; } else console.log('All static checks passed.');
