// Check an After Hours prize code someone DMed you.
// Usage:  node after-hours/check-code.cjs @theirhandle KITTY-1A2B-3C4D
// Uses the season in story.js, so check codes before you change the season.
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const crypto = require('crypto');

const [rawHandle, rawCode] = process.argv.slice(2);
if (!rawHandle) {
  console.log('Usage: node after-hours/check-code.cjs @theirhandle THEIR-CODE');
  process.exit(1);
}

const sandbox = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(__dirname, 'story.js'), 'utf8'), sandbox);
const story = sandbox.window.AFTER_HOURS;
const handle = rawHandle.trim().replace(/^@/, '');

const codeFor = route => {
  const hex = crypto.createHash('sha256')
    .update(`after-hours|${story.season}|${handle.toLowerCase()}|${route}`)
    .digest('hex').slice(0, 8).toUpperCase();
  return `${route.toUpperCase()}-${hex.slice(0, 4)}-${hex.slice(4, 8)}`;
};

const valid = Object.keys(story.characters).map(codeFor);
console.log(`Season "${story.season}", @${handle}: valid codes are ${valid.join(' or ')}`);
if (rawCode) {
  const ok = valid.includes(rawCode.trim().toUpperCase());
  console.log(ok ? 'VALID: this person reached a true ending.' : 'NOT VALID for this handle and season.');
  process.exitCode = ok ? 0 : 2;
}
