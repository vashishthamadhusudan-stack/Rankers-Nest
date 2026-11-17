const fs = require('node:fs');
const path = require('node:path');
const root = process.cwd();
const htmlFiles = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === '.git' || entry.name === 'node_modules') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (/\.html?$/i.test(entry.name)) htmlFiles.push(full);
  }
}
walk(root);
const rows = htmlFiles.map(full => {
  const file = path.relative(root, full).replace(/\\/g, '/');
  const s = fs.readFileSync(full, 'utf8');
  const title = (s.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [,''])[1].replace(/\s+/g, ' ').trim();
  const quizLike = /(pyq|jee-main-|neet-|practice|test|challenge|quiz|question)/i.test(file) &&
    /(type\s*=\s*["']radio|<form|submit|answer|solution|question|timer)/i.test(s);
  const answerSolutionRecords = (s.match(/\ba\s*:\s*\d+\s*,\s*s\s*:/g) || []).length;
  const optionArrays = (s.match(/\bo\s*:\s*\[/g) || []).length;
  const radioGroups = [...s.matchAll(/name\s*=\s*["']([^"']+)["']/g)].map(m=>m[1]).filter(n=>/^q\d+$/i.test(n));
  const years = [...new Set((s.match(/\b(?:19|20)\d{2}\b/g) || []))].sort();
  const sourceMentions = [...new Set((s.match(/(?:NTA|JEE\s*\(?Main|NEET|AIPMT|Shift\s*[12]|Session\s*[12]|Official|Final Answer Key|Archive practice)/gi) || []).map(x=>x.trim()))];
  const warnings = [];
  if (/audit in progress|answer-key audit in progress|source verification.*progress/i.test(s)) warnings.push('audit marker still present');
  if (/original paper|original figure|graph is shown|diagram is required|not reproduced|verify the graph|verify wiring/i.test(s)) warnings.push('question depends on an original figure/graph or source confirmation');
  if (/Archive practice|concept-made questions/i.test(s)) warnings.push('mixed practice items; PYQ provenance not fully confirmed');
  if (quizLike && answerSolutionRecords === 0 && optionArrays === 0 && radioGroups.length === 0) warnings.push('question data structure needs manual inventory');
  if (quizLike && years.length === 0) warnings.push('no year detected in page text');
  return { file, title, quizLike, bytes: Buffer.byteLength(s), answerSolutionRecords, optionArrays, distinctRadioNames: [...new Set(radioGroups)].length, years, sourceMentions, warnings };
}).sort((a,b)=>a.file.localeCompare(b.file));
const quizRows = rows.filter(r=>r.quizLike);
const report = { generatedAt: new Date().toISOString(), htmlPageCount: rows.length, quizLikePageCount: quizRows.length, note: 'Inventory and risk-flag scan only; not academic verification. No item is source-verified unless its original paper and official answer key have been independently matched.', pages: rows };
fs.writeFileSync('pyq-audit-inventory.json', JSON.stringify(report, null, 2));
const md = [
  '# Rankers Nest — Website / PYQ Audit Register',
  '',
  'Generated: ' + report.generatedAt,
  '',
  '- HTML pages scanned: **' + rows.length + '**',
  '- Quiz/PYQ-like pages: **' + quizRows.length + '**',
  '- Academic source-match status: **NOT YET VERIFIED by this automated scan**',
  '- This scan inventories files, source/year clues, and risk markers. It does not certify question authenticity, answer correctness, solution correctness, or diagram fidelity.',
  '',
  '| Page | Detected records | Options arrays | Years seen | Audit flags |',
  '|---|---:|---:|---|---|',
  ...quizRows.map(r => '| ' + r.file + ' | ' + r.answerSolutionRecords + ' | ' + r.optionArrays + ' | ' + (r.years.join(', ') || 'none detected') + ' | ' + (r.warnings.join('; ') || 'manual source-by-source verification required') + ' |'),
  '',
  '## Verification standard',
  'For each item, record the original exam/year/session/date/shift, original question and all options, official final answer key (including any dropped/changed question), solution recalculation, and diagram/graph match. Mark Verified only when evidence exists; mark Unverified when the original source cannot be obtained.'
].join('\n');
fs.writeFileSync('PYQ_AUDIT_REGISTER.md', md);
console.log(JSON.stringify({htmlPageCount:rows.length,quizLikePageCount:quizRows.length,flaggedPages:quizRows.filter(r=>r.warnings.length).length,report:'pyq-audit-inventory.json',register:'PYQ_AUDIT_REGISTER.md'},null,2));
