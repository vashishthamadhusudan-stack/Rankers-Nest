const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');
const root = process.cwd();
const base = (process.env.LIVE_BASE || 'https://vashishthamadhusudan-stack.github.io/Rankers-Nest').replace(/\/$/, '');
const htmlFiles = [];
function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === '.git' || e.name === 'node_modules') continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full);
    else if (/\.html?$/i.test(e.name)) htmlFiles.push(path.relative(root, full).replace(/\\/g, '/'));
  }
}
walk(root);
const results = [];
const internalLinks = new Set();
const failures = [];
function isQuizFile(file) { return /(pyq|jee-main-|neet-|practice|test|challenge|quiz|question|rotation|gravitation|electrostatics|current-electricity|heat|thermodynamics|momentum|collision|kinematics|friction|magnetism|specific-heat)/i.test(file); }
(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  try {
    for (const file of htmlFiles) {
      const page = await context.newPage();
      const pageErrors = [];
      page.on('pageerror', e => pageErrors.push(e.message));
      let status = 0;
      let loadError = '';
      try {
        const response = await page.goto(base + '/' + file, { waitUntil: 'domcontentloaded', timeout: 30000 });
        status = response ? response.status() : 0;
        await page.waitForTimeout(100);
      } catch (e) { loadError = e.message; }
      let title = '';
      let radioGroups = 0;
      let optionCounts = [];
      let quizAction = 'not applicable';
      let hrefs = [];
      try {
        title = await page.title();
        hrefs = await page.locator('a[href],script[src],link[href],img[src]').evaluateAll(nodes => nodes.map(n => n.href || n.src).filter(Boolean));
        for (const raw of hrefs) {
          try {
            const u = new URL(raw);
            if (u.origin === new URL(base).origin && u.pathname.startsWith(new URL(base).pathname)) {
              u.hash = ''; u.search = '';
              internalLinks.add(u.href);
            }
          } catch {}
        }
        if (isQuizFile(file)) {
          const start = page.locator('#start');
          if (await start.count() && await start.first().isVisible().catch(()=>false)) {
            await start.first().click().catch(()=>{});
            await page.waitForTimeout(100);
          }
          const groups = await page.locator('input[type="radio"]').evaluateAll(inputs => {
            const m = new Map();
            for (const x of inputs) m.set(x.name, (m.get(x.name) || 0) + 1);
            return [...m.entries()].map(([name,count]) => ({name,count}));
          });
          radioGroups = groups.length;
          optionCounts = groups.map(g=>g.count);
          const submit = page.locator('#submit,button[type="submit"],input[type="submit"]').first();
          if (radioGroups && await submit.count() && await submit.isVisible().catch(()=>false)) {
            const first = page.locator('input[type="radio"]').first();
            await first.check({force:true}).catch(()=>{});
            await submit.click({force:true}).catch(()=>{});
            await page.waitForTimeout(100);
            quizAction = 'radio selection + submit attempted';
          } else if (radioGroups) quizAction = 'questions rendered; no standard submit control found';
          else quizAction = 'no radio-based questions detected';
        }
      } catch (e) { loadError = loadError || e.message; }
      const row = {file,title,status,quizLike:isQuizFile(file),radioQuestionGroups:radioGroups,optionCounts,quizAction,pageErrors,loadError};
      results.push(row);
      if (status !== 200) failures.push({file,kind:'page-status',detail:String(status || loadError)});
      if (pageErrors.length) failures.push({file,kind:'javascript-error',detail:pageErrors.join('; ')});
      await page.close();
    }
    const linkResults = [];
    for (const url of [...internalLinks]) {
      try {
        const response = await context.request.get(url, { timeout: 15000, failOnStatusCode: false });
        const code = response.status();
        linkResults.push({url,status:code});
        if (code < 200 || code >= 400) failures.push({kind:'broken-internal-link',url,status:code});
      } catch (e) {
        linkResults.push({url,status:0,error:e.message});
        failures.push({kind:'internal-link-request-error',url,detail:e.message});
      }
    }
    const report = {generatedAt:new Date().toISOString(),base,htmlPages:htmlFiles.length,internalUrlsChecked:linkResults.length,failures,results,linkResults};
    fs.writeFileSync('website-browser-audit.json',JSON.stringify(report,null,2));
    const summary = {htmlPages:htmlFiles.length,internalUrlsChecked:linkResults.length,quizLikePages:results.filter(x=>x.quizLike).length,non200Pages:results.filter(x=>x.status!==200).length,javascriptErrors:results.reduce((n,x)=>n+x.pageErrors.length,0),brokenInternalLinks:failures.filter(x=>x.kind==='broken-internal-link'||x.kind==='internal-link-request-error').length,report:'website-browser-audit.json'};
    console.log(JSON.stringify(summary,null,2));
    if (summary.non200Pages || summary.javascriptErrors || summary.brokenInternalLinks) process.exitCode = 1;
  } finally { await browser.close(); }
})().catch(e=>{console.error(e);process.exit(1);});
