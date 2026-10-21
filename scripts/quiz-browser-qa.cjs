const { chromium } = require('playwright');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

const pages = [
  { file: 'jee-main-electric-field-potential.html', count: 25, answerExpr: 'qs[0].a', timerVar: 'remaining', scoreSelector: '#score', resultSelector: '#result' },
  { file: 'jee-main-gauss-law.html', count: 25, answerExpr: 'qs[0].a', timerVar: 'remaining', scoreSelector: '#score', resultSelector: '#result' },
  { file: 'jee-main-capacitors.html', count: 25, numericQuestions: 1, answerExpr: 'data[0].a', timerVar: 'left', scoreSelector: '#result', resultSelector: '#result' },
  { file: 'jee-main-current-electricity.html', count: 57, answerExpr: 'data[0].a', timerVar: 'left', scoreSelector: '#result', resultSelector: '#result' },
];

function assert(ok, message) { if (!ok) throw new Error(message); }
async function testPage(browser, pageSpec, target) {
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto(target, { waitUntil: 'load', timeout: 60000 });
  await page.locator('#start').click();
  const groupCount = await page.locator('input[type="radio"]').evaluateAll(inputs => new Set(inputs.map(i => i.name)).size);
  const questionCardCount = await page.locator('.question, .q').count();
  assert(questionCardCount === pageSpec.count, `${pageSpec.file}: expected ${pageSpec.count} question cards, got ${questionCardCount}`);
  assert(groupCount === pageSpec.count - (pageSpec.numericQuestions || 0), `${pageSpec.file}: expected ${pageSpec.count - (pageSpec.numericQuestions || 0)} radio groups, got ${groupCount}`);
  const optionCounts = await page.locator('input[type="radio"]').evaluateAll(inputs => {
    const groups = {};
    for (const input of inputs) groups[input.name] = (groups[input.name] || 0) + 1;
    return Object.values(groups);
  });
  assert(optionCounts.length === groupCount && optionCounts.every(n => n === 4), `${pageSpec.file}: every multiple-choice question must have exactly four options`);
  const numericCount = await page.locator('input[type="number"]').count();
  assert(numericCount === (pageSpec.numericQuestions || 0), `${pageSpec.file}: expected ${pageSpec.numericQuestions || 0} numerical inputs, got ${numericCount}`);

  const answer = await page.evaluate(expr => (0, eval)(expr), pageSpec.answerExpr);
  await page.locator(`input[name="q0"][value="${answer}"]`).check();
  const wrong = (Number(answer) + 1) % 4;
  await page.locator(`input[name="q1"][value="${wrong}"]`).check();
  await page.locator('#submit').click();

  const resultText = await page.locator(pageSpec.resultSelector).innerText();
  assert(/Correct\s*1/i.test(resultText), `${pageSpec.file}: correct count missing/wrong: ${resultText}`);
  assert(/Incorrect\s*1|Wrong\s*1/i.test(resultText), `${pageSpec.file}: incorrect count missing/wrong: ${resultText}`);
  assert(new RegExp(`Unattempted\\s*${pageSpec.count - 2}`, 'i').test(resultText), `${pageSpec.file}: unattempted count missing/wrong: ${resultText}`);
  const scoreText = await page.locator(pageSpec.scoreSelector).innerText();
  assert(/(?:Score\s*:?\s*|^\s*)3\b|3\s*marks/i.test(scoreText), pageSpec.file + ': expected score +4-1=3, got score element: ' + scoreText + '; result: ' + resultText);

  const disabledCount = await page.locator('input[type="radio"]:disabled').count();
  assert(disabledCount === groupCount * 4, `${pageSpec.file}: radio choices were not locked after submission (${disabledCount} disabled)`);
  const numericDisabledCount = await page.locator('input[type="number"]:disabled').count();
  assert(numericDisabledCount === (pageSpec.numericQuestions || 0), `${pageSpec.file}: numerical input was not locked after submission`);
  const visibleSolutions = await page.locator('.solution:visible, .sol:visible, details[open]').count();
  const arrayName = pageSpec.answerExpr.split('[')[0];
  const expectedKeys = await page.evaluate(name => (name === 'qs' ? qs : data).map(item => item.a), arrayName);
  const questionTypes = await page.evaluate(name => (name === 'qs' ? qs : data).map(item => item.type || 'mcq'), arrayName);
  const solutionTexts = await page.locator('.solution, details').allInnerTexts();
  assert(solutionTexts.length === pageSpec.count, `${pageSpec.file}: solution/question count mismatch: ${solutionTexts.length}`);
  const keyMismatch = solutionTexts.findIndex((text, i) => {
    if (questionTypes[i] === 'numeric') return !new RegExp('Answer:\\s*' + expectedKeys[i] + '(?:\\s|$)').test(text);
    const match = text.match(/(?:Answer|Key):\s*([A-D])/i);
    return !match || match[1].toUpperCase() !== String.fromCharCode(65 + expectedKeys[i]);
  });
  assert(keyMismatch === -1, `${pageSpec.file}: displayed solution key does not match stored answer key at Q${keyMismatch + 1}`);
  assert(solutionTexts.every(text => text.trim().length > 20), `${pageSpec.file}: one or more solution texts are empty/too short`);
  assert(visibleSolutions >= pageSpec.count, `${pageSpec.file}: solutions did not all reveal after submit (visible count ${visibleSolutions})`);
  assert(errors.length === 0, `${pageSpec.file}: browser JS errors: ${errors.join('; ')}`);

  // Restart should clear prior selections and unlock all options.
  await page.locator('#start').click();
  const checkedAfterRestart = await page.locator('input[type="radio"]:checked').count();
  assert(checkedAfterRestart === 0, `${pageSpec.file}: restart did not clear radio answers`);
  const numericFilledAfterRestart = await page.locator('input[type="number"]').evaluateAll(xs => xs.filter(x => x.value.trim() !== '').length);
  assert(numericFilledAfterRestart === 0, `${pageSpec.file}: restart did not clear numerical answers`);
  const enabledAfterRestart = await page.locator('input[type="radio"]:not(:disabled)').count();
  assert(enabledAfterRestart === groupCount * 4, `${pageSpec.file}: restart did not unlock radio options`);
  const numericEnabledAfterRestart = await page.locator('input[type="number"]:not(:disabled)').count();
  assert(numericEnabledAfterRestart === (pageSpec.numericQuestions || 0), `${pageSpec.file}: restart did not unlock numerical input`);

  // Force the countdown to one second and verify auto-submit in the running page.
  await page.evaluate(timerVar => { window.__qaTimerVar = timerVar; (0, eval)(timerVar + ' = 1'); }, pageSpec.timerVar);
  await page.waitForTimeout(1500);
  const autoResult = await page.locator(pageSpec.resultSelector).innerText();
  assert(/Unattempted\s*\d+|unattempted\s*\d+/i.test(autoResult), `${pageSpec.file}: timer did not auto-submit`);
  await page.close();
  return { page: pageSpec.file, target, questions: groupCount, optionsPerQuestion: 4, scoreScenario: '+4 correct, -1 incorrect, 0 blank => 3', autoSubmit: 'PASS', solutionsReveal: 'PASS', lockingAndRestart: 'PASS', consoleErrors: errors.length };
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const results = [];
  try {
    const root = process.cwd();
    for (const spec of pages) {
      const local = pathToFileURL(path.join(root, spec.file)).href;
      results.push(await testPage(browser, spec, local));
    }
    if (process.env.LIVE_BASE) {
      for (const spec of pages) {
        const target = process.env.LIVE_BASE.replace(/\/$/, '') + '/' + spec.file;
        results.push(await testPage(browser, spec, target));
      }
    }
    fs.writeFileSync('quiz-browser-qa-results.json', JSON.stringify({ createdAt: new Date().toISOString(), results }, null, 2));
    console.log(JSON.stringify(results, null, 2));
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exit(1); });
