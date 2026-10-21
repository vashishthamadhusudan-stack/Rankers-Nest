const { chromium } = require('playwright');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

const FILE = 'jee-advanced-kinematics-pyq.html';
const LIVE_URL = 'https://vashishthamadhusudan-stack.github.io/Rankers-Nest/' + FILE;
const expected = {
  1:{type:'single',ans:'B',status:'PYQ-secondary-source checked'},2:{type:'single',ans:'D',status:'PYQ-secondary-source checked'},
  3:{type:'single',ans:'B',status:'Practice'},4:{type:'single',ans:'C',status:'Practice'},5:{type:'numeric',ans:'20',status:'Practice'},
  6:{type:'multi',ans:'AC',status:'Practice'},7:{type:'multi',ans:'AB',status:'Official 2026 Paper 1 solution'},
  8:{type:'single',ans:'B',status:'PYQ-secondary-source checked; options adapted'},9:{type:'single',ans:'B',status:'PYQ-secondary-source checked'},
  10:{type:'single',ans:'A',status:'Practice'},11:{type:'multi',ans:'AB',status:'PYQ-secondary-source checked; options adapted'},
  12:{type:'numeric',ans:'18',status:'Practice'},13:{type:'single',ans:'C',status:'Practice'},
  14:{type:'numeric',ans:'30',status:'PYQ-secondary-source checked'},15:{type:'numeric',ans:'40',status:'PYQ-secondary-source checked'},
  16:{type:'single',ans:'A',status:'PYQ-secondary-source checked'},17:{type:'single',ans:'A',status:'PYQ-secondary-source checked'},
  18:{type:'numeric',ans:'0.95',status:'PYQ-secondary-source checked'},19:{type:'pair',ans:'0,0',status:'Practice; adapted from inconsistent transcription'},
  20:{type:'numeric',ans:'1',status:'PYQ-secondary-source checked'},21:{type:'single',ans:'A',status:'Practice'},22:{type:'single',ans:'A',status:'Practice'},
  23:{type:'single',ans:'A',status:'PYQ-secondary-source checked; options added'},24:{type:'single',ans:'A',status:'Practice'},
  25:{type:'single',ans:'B',status:'Practice'},26:{type:'numeric',ans:'3',status:'PYQ-secondary-source checked'},
  27:{type:'multi',ans:'AC',status:'PYQ 1993; source wording/key checked against secondary question record'},
  28:{type:'single',ans:'B',status:'PYQ-secondary-source checked'},29:{type:'numeric',ans:'5',status:'PYQ-secondary-source checked'},
  30:{type:'numeric',ans:'2|8',status:'PYQ-secondary-source checked; accepted numeric alternatives'},
  31:{type:'single',ans:'C',status:'JEE Advanced 2017 Paper 2 Code 9; source options and key checked'},
  32:{type:'numeric',ans:'2',status:'Practice; not PYQ'},33:{type:'multi',ans:'ABCD',status:'JEE Advanced 2020 Paper 2; source question/solution checked'},
  34:{type:'numeric',ans:'4',status:'JEE Advanced 2019 Paper 2; source question/solution checked'},
  35:{type:'numeric',ans:'5',status:'JEE Advanced 2014 Paper 1; source question/solution checked'},
  36:{type:'pair',ans:'1,8.660254,5',status:'IIT-JEE 1996; source question/solution checked'}
};
function assert(ok, msg) { if (!ok) throw new Error(msg); }
const results = [];
async function testPage(browser, target, label) {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', msg => { if (msg.type() === 'error') errors.push('console: ' + msg.text()); });
  try {
    await page.goto(target, { waitUntil: 'load', timeout: 60000 });
    const audit = await page.locator('.question[data-q]').evaluateAll(cards => cards.map(card => ({
      id:Number(card.dataset.q), type:card.dataset.type, ans:card.dataset.ans,
      marks:Number(card.dataset.marks), inputCount:card.querySelectorAll('input').length,
      solution:card.querySelector('.solution')?.innerText?.trim() || ''
    })));
    assert(audit.length === 36, label + ': expected 36 questions, found ' + audit.length);
    assert(audit.every((q,i)=>q.id===i+1), label + ': question IDs are not continuous 1–36');
    for (const q of audit) {
      const e=expected[q.id];
      assert(e, label + ': missing source/key manifest entry for Q' + q.id);
      assert(q.type===e.type, label + ': Q' + q.id + ' type mismatch: HTML=' + q.type + ', manifest=' + e.type);
      assert(q.ans===e.ans, label + ': Q' + q.id + ' key mismatch: HTML=' + q.ans + ', manifest=' + e.ans);
      assert(q.marks>0 && Number.isFinite(q.marks), label + ': invalid marks on Q' + q.id);
      assert(q.inputCount>0, label + ': Q' + q.id + ' has no answer input');
      assert(q.solution.length>25, label + ': Q' + q.id + ' solution missing/too short');
    }
    assert(await page.locator('svg.graph').count()===9, label + ': expected 9 embedded graph SVGs');
    assert(await page.locator('iframe').count()===0, label + ': unexpected iframe');
    const external=await page.locator('a[href^="http"],script[src^="http"],img[src^="http"]').count();
    assert(external===0, label + ': unexpected external resources/links found (' + external + ')');
    const max=audit.reduce((s,q)=>s+q.marks,0);
    await page.waitForFunction(() => document.querySelector('#progress') && /\/\s*36/.test(document.querySelector('#progress').textContent));
    const initialProgress = await page.locator('#progress').innerText();
    assert(/0\s*\/\s*36/.test(initialProgress) && await page.locator('.question input:checked').count()===0, label + ': initial progress/state invalid: ' + JSON.stringify(initialProgress));

    for (const q of audit) {
      const card=page.locator('.question[data-q="' + q.id + '"]');
      const e=expected[q.id];
      if(q.type==='single') {
        assert(await card.locator('input[type="radio"][value="' + e.ans + '"]').count()===1, label + ': Q' + q.id + ' expected option ' + e.ans + ' is missing');
        await card.locator('input[type="radio"][value="' + e.ans + '"]').check();
      } else if(q.type==='multi') {
        for(const letter of e.ans) {
          assert(await card.locator('input[type="checkbox"][value="' + letter + '"]').count()===1, label + ': Q' + q.id + ' expected checkbox ' + letter + ' missing');
          await card.locator('input[type="checkbox"][value="' + letter + '"]').check();
        }
      } else if(q.type==='numeric') {
        await card.locator('input[type="number"]').first().fill(e.ans.split('|')[0]);
      } else if(q.type==='pair') {
        const vals=e.ans.split(',');
        const inputs=card.locator('input[type="number"]');
        assert(await inputs.count()===vals.length, label + ': Q' + q.id + ' pair field count mismatch');
        for(let i=0;i<vals.length;i++) await inputs.nth(i).fill(vals[i]);
      }
    }
    assert((await page.locator('#progress').innerText()).includes('36 / 36'), label + ': progress failed to count all 36 attempted questions');
    await page.locator('button[type="submit"]').click();
    const score=await page.locator('#scoreTitle').innerText();
    assert(score.includes(max.toFixed(2)) && score.includes('/ '+max), label + ': all-correct score mismatch; expected ' + max + ', got "' + score + '"');
    assert(await page.locator('.solution:visible').count()===36, label + ': not all 36 solutions revealed after submit');
    assert(await page.locator('#result').isVisible(), label + ': result panel did not appear');

    await page.locator('#reset').click();
    await page.waitForFunction(() => /0\s*\/\s*36/.test(document.querySelector('#progress')?.textContent || ''));
    assert((await page.locator('#progress').innerText()).includes('0 / 36'), label + ': reset did not clear progress');
    assert(!(await page.locator('#result').isVisible()), label + ': reset did not hide results');
    assert(await page.locator('.solution:visible').count()===0, label + ': reset did not hide solutions');
    assert(await page.locator('.question input:checked').count()===0, label + ': reset did not clear selected choices');
    assert(await page.locator('.question input[type="number"]').evaluateAll(xs=>xs.every(x=>x.value==='')), label + ': reset did not clear numerical fields');

    await page.locator('.question[data-q="1"] input[value="B"]').check();
    await page.locator('.question[data-q="16"] input[value="B"]').check();
    await page.locator('button[type="submit"]').click();
    const wrongScore=await page.locator('#scoreTitle').innerText();
    assert(wrongScore.includes('1.25 / '+max), label + ': negative marking mismatch; expected +2 - 0.75 = 1.25, got ' + wrongScore);
    await page.locator('#reset').click();
    await page.locator('.question[data-q="30"] input[type="number"]').fill('8');
    await page.locator('button[type="submit"]').click();
    const altScore=await page.locator('#scoreTitle').innerText();
    assert(altScore.includes('3.00'), label + ': Q30 accepted alternative 8 did not receive its 3 marks: ' + altScore);
    assert(errors.length===0, label + ': browser errors: ' + errors.join(' | '));

    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>document.documentElement.clientWidth);
    assert(!overflow, label + ': horizontal overflow at 390px mobile viewport');
    const summary={target:label,questions:audit.length,marksAvailable:max,allCorrectScore:score,solutionsReveal:'PASS 36/36',reset:'PASS',wrongAnswerFlow:'PASS',alternateNumericQ30:'PASS',sourceKeyManifest:'PASS 36/36',mobileOverflow:'PASS',graphs:9,externalResources:external,consoleErrors:errors.length};
    results.push(summary);
    return summary;
  } finally { await page.close(); }
}
(async()=>{
  const browser=await chromium.launch({headless:true});
  try {
    const local=pathToFileURL(path.resolve(FILE)).href;
    await testPage(browser,local,'local HTML (commit artifact)');
    let liveError=null,livePassed=false;
    for(let attempt=1;attempt<=8;attempt++){
      try { await testPage(browser,LIVE_URL,'live GitHub Pages'); livePassed=true; break; }
      catch(e){ liveError=e; if(attempt<8) await new Promise(r=>setTimeout(r,15000)); }
    }
    if(!livePassed) throw liveError;
    fs.writeFileSync('kinematics-regression-results.json',JSON.stringify({createdAt:new Date().toISOString(),status:'PASS',expectedKeyManifest:expected,results},null,2));
    console.log(JSON.stringify({status:'PASS',results},null,2));
  } catch(e) {
    fs.writeFileSync('kinematics-regression-results.json',JSON.stringify({createdAt:new Date().toISOString(),status:'FAIL',error:e.stack,results},null,2));
    throw e;
  } finally { await browser.close(); }
})().catch(e=>{console.error(e);process.exit(1)});
