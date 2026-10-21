const { chromium } = require('playwright');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const BASE = (process.env.LIVE_BASE || 'https://vashishthamadhusudan-stack.github.io/Rankers-Nest').replace(/\/$/, '');
const FILE = 'jee-advanced-newtons-laws.html';
function assert(ok, message) { if (!ok) throw new Error(message); }
async function runTarget(browser, target) {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto(target, { waitUntil: 'load', timeout: 60000 });
  await page.waitForSelector('#startTest', { timeout: 15000 });
  const count = await page.locator('.question').count();
  assert(count === 80, target + ': expected 80 questions, got ' + count);
  assert(await page.locator('.question .diagram').count() === 80, target + ': every question must have a diagram');
  assert(await page.locator('.question').evaluateAll(qs => qs.every(q => q.querySelectorAll('input[type="radio"]').length === 4)), target + ': every question must have four options');
  const keys = await page.locator('.question').evaluateAll(qs => qs.map(q => q.dataset.ans));
  assert(keys.length === 80 && keys.every(k => ['0','1','2','3'].includes(k)), target + ': answer index missing/invalid');
  assert(await page.locator('#timer').innerText() === '120:00', target + ': initial timer should be 120:00');
  assert(await page.locator('input[type="radio"]:disabled').count() === 320, target + ': answers should be locked before start');
  assert(await page.locator('#submitBottom').isDisabled(), target + ': bottom submit should be disabled before start');
  assert(await page.locator('#submitTop').isDisabled(), target + ': top submit should be disabled before start');
  const dims = await page.evaluate(() => ({ width: document.documentElement.scrollWidth, viewport: document.documentElement.clientWidth }));
  assert(dims.width <= dims.viewport + 1, target + ': mobile horizontal overflow ' + JSON.stringify(dims));
  await page.locator('#startTest').click();
  assert(!(await page.locator('input[type="radio"]:disabled').count()), target + ': answers did not unlock after start');
  assert(!(await page.locator('#submitBottom').isDisabled()), target + ': bottom submit should enable after start');
  const firstKey = await page.locator('.question[data-q="1"]').getAttribute('data-ans');
  const secondKey = await page.locator('.question[data-q="2"]').getAttribute('data-ans');
  await page.locator('input[name="q1"][value="' + firstKey + '"]').check();
  const wrong = (Number(secondKey) + 1) % 4;
  await page.locator('input[name="q2"][value="' + wrong + '"]').check();
  await page.locator('#submitTop').click();
  assert((await page.locator('#score').innerText()).includes('3 / 320'), target + ': expected +4 -1 = 3, got ' + await page.locator('#score').innerText());
  assert(await page.locator('.solution:visible').count() === 80, target + ': all solutions should show after submit');
  const keyMismatch = await page.locator('.question').evaluateAll(qs => qs.findIndex(q => {
    const answer = q.querySelector('.solution strong')?.textContent || '';
    const letter = String.fromCharCode(65 + Number(q.dataset.ans));
    return !answer.includes('Correct answer: ' + letter + '.');
  }));
  assert(keyMismatch === -1, target + ': solution answer letter disagrees with stored key at question ' + (keyMismatch + 1));
  assert(await page.locator('input[type="radio"]:disabled').count() === 320, target + ': options should lock after submit');
  await page.locator('#resetTest').click();
  assert(await page.locator('#timer').innerText() === '120:00', target + ': reset did not restore timer');
  assert(await page.locator('input[type="radio"]:checked').count() === 0, target + ': reset did not clear selections');
  assert(await page.locator('input[type="radio"]:disabled').count() === 320, target + ': reset should lock answers until restart');
  assert(await page.locator('.solution:visible').count() === 0, target + ': reset should hide solutions');
  assert(errors.length === 0, target + ': browser errors: ' + errors.join('; '));
  await page.close();
  return { target, questions: count, diagrams: 80, optionsPerQuestion: 4, answerKeyAndSolutionLetters: 'PASS', timerAndLocking: 'PASS', scoreScenario: '+4 -1 = 3 PASS', solutionsReveal: 'PASS', reset: 'PASS', mobileOverflow: 'PASS', browserErrors: errors.length };
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
})().catch(error => { console.error(error); process.exit(1); });
