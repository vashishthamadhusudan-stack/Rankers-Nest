const { chromium } = require('playwright');
const { pathToFileURL } = require('node:url');
const path = require('node:path');
const fs = require('node:fs');
const BASE = (process.env.LIVE_BASE || 'https://vashishthamadhusudan-stack.github.io/Rankers-Nest').replace(/\/$/, '');
const FILE = 'jee-advanced-newtons-laws.html';
function assert(ok, message) { if (!ok) throw new Error(message); }
async function runTarget(browser, target) {
 const page=await browser.newPage({viewport:{width:390,height:844}}); const errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto(target,{waitUntil:'load',timeout:60000});
 assert((await page.title()).includes('JEE Advanced Newton'),target+': wrong title');
 assert(await page.getByRole('heading',{name:/Historical PYQs/}).count()===1,target+': historical PYQ heading missing');
 assert(await page.getByText(/generated practice questions/i).count()>=1,target+': transparency notice missing');
 assert(await page.getByText(/38 questions \/ 27 papers/i).count()>=1,target+': source count note missing');
 assert(await page.locator('a[href="https://jeeadv.ac.in/archive.html"]').count()===1,target+': official archive link missing');
 assert(await page.locator('a[href="https://questions.examside.com/past-years/jee/jee-advanced/physics/laws-of-motion"]').count()===1,target+': historical index link missing');
 assert(await page.locator('article.question').count()===0,target+': generated practice question cards must not be published');
 const dims=await page.evaluate(()=>({width:document.documentElement.scrollWidth,viewport:document.documentElement.clientWidth}));
 assert(dims.width<=dims.viewport+1,target+': mobile horizontal overflow '+JSON.stringify(dims));
 assert(errors.length===0,target+': browser errors: '+errors.join('; '));
 await page.close(); return {target,mode:'PYQ-only rebuild notice',generatedQuestionCards:0,sourceLinks:'PASS',mobileOverflow:'PASS',browserErrors:0};
}
(async()=>{const browser=await chromium.launch({headless:true});const results=[];try{
 results.push(await runTarget(browser,pathToFileURL(path.join(process.cwd(),FILE)).href));
 let last;for(let attempt=1;attempt<=8;attempt++){try{results.push(await runTarget(browser,BASE+'/'+FILE));last=null;break}catch(e){last=e;if(attempt===8)throw e;await new Promise(r=>setTimeout(r,15000))}}
 fs.writeFileSync('newtons-laws-regression-results.json',JSON.stringify({createdAt:new Date().toISOString(),results},null,2));console.log(JSON.stringify(results,null,2));
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exit(1)});
