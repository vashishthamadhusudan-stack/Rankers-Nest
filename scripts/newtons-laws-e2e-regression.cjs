const { chromium } = require('playwright');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const BASE = (process.env.LIVE_BASE || 'https://vashishthamadhusudan-stack.github.io/Rankers-Nest').replace(/\/$/, '');
const FILE = 'jee-advanced-newtons-laws.html';
const EXPECTED_KEYS = ['C','B','D','C','A','C','B','C','A','B'];
function assert(ok, message) { if (!ok) throw new Error(message); }
async function runTarget(browser, target) {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto(target, { waitUntil: 'load', timeout: 60000 });
  await page.waitForSelector('#startTest', { timeout: 15000 });
  assert(await page.locator('.question').count() === 10, target + ': expected 10 questions');
  assert(await page.locator('.question').evaluateAll(qs => qs.every(q => q.querySelectorAll('input[type="radio"]').length === 4)), target + ': every question must have four options');
  const keys = await page.locator('.question').evaluateAll(qs => qs.map(q => q.dataset.ans));
  assert(JSON.stringify(keys) === JSON.stringify(EXPECTED_KEYS), target + ': answer manifest mismatch: ' + keys.join(','));
  assert(await page.locator('#timer').innerText() === '45:00', target + ': initial timer should be 45:00');
  assert(await page.locator('input[type="radio"]:disabled').count() === 40, target + ': answers should be locked before start');
  assert(await page.locator('#submitBottom').isDisabled(), target + ': bottom submit should be disabled before start');
  assert(await page.locator('#submitTop').isDisabled(), target + ': top submit should be disabled before start');
  const hrefs = await page.locator('a[href]').evaluateAll(as => as.map(a => a.getAttribute('href')));
  assert(!hrefs.some(h => /^https?:\/\//i.test(h)), target + ': unexpected external clickable link');
  await page.locator('#startTest').click();
  assert(!(await page.locator('input[type="radio"]:disabled').count()), target + ': answers did not unlock after start');
  assert(!(await page.locator('#submitBottom').isDisabled()), target + ': bottom submit should enable after start');
  await page.locator('input[name="q1"][value="C"]').check();
  await page.locator('input[name="q2"][value="A"]').check();
  await page.locator('#submitTop').click();
  assert((await page.locator('#score').innerText()).includes('3 / 40'), target + ': expected +4 -1 = 3, got ' + await page.locator('#score').innerText());
  assert(await page.locator('.solution:visible').count() === 10, target + ': all solutions should show after submit');
  assert(await page.locator('input[type="radio"]:disabled').count() === 40, target + ': options should lock after submit');
  await page.locator('#resetTest').click();
  assert(await page.locator('#timer').innerText() === '45:00', target + ': reset did not restore timer');
  assert(await page.locator('input[type="radio"]:checked').count() === 0, target + ': reset did not clear selections');
  assert(await page.locator('input[type="radio"]:disabled').count() === 40, target + ': reset should lock answers until restart');
  assert(await page.locator('.solution:visible').count() === 0, target + ': reset should hide solutions');
  assert(errors.length === 0, target + ': browser errors: ' + errors.join('; '));
  await page.close();
  return { target, questions: 10, optionsPerQuestion: 4, answerManifest: 'PASS', timerAndLocking: 'PASS', scoreScenario: '+4 -1 = 3 PASS', solutionsReveal: 'PASS', reset: 'PASS', externalLinks: 0, browserErrors: errors.length };
}
(async () => {
  const browser = await chromium.launch({ headless: true });
  const results = [];
  try {
    results.push(await runTarget(browser, pathToFileURL(path.join(process.cwd(), FILE)).href));
    let lastError;
    for (let attempt = 1; attempt <= 8; attempt++) {
      try { results.push(await runTarget(browser, BASE + '/' + FILE)); lastError = null; break; }
      catch (e) { lastError = e; if (attempt === 8) throw e; await new Promise(r => setTimeout(r, 15000)); }
    }
    fs.writeFileSync('newtons-laws-regression-results.json', JSON.stringify({ createdAt: new Date().toISOString(), results }, null, 2));
    console.log(JSON.stringify(results, null, 2));
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exit(1); });
