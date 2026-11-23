import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {generatePlan,validPlan,planEntries,shoppingForPlan,recipeById,recipeFamily} from './dist/weekly-plan.js';
import {createWeeklyPdf} from './dist/weekly-pdf.js';
vm.runInThisContext(fs.readFileSync('dist/vendor/pdf-lib.min.js','utf8'));
let prev=null;const signatures=new Set();
for(let i=0;i<100;i++){
 const p=generatePlan({start:'2026-11-25',servings:i%6+1,selected:['pollo','brocoli','calabaza'],previous:prev});
 assert(validPlan(p));assert.equal(p.start,'2026-11-23');
 assert.equal(new Set(p.days.flatMap(d=>[d.lunch,d.dinner])).size,14);
 assert(p.days.every(d=>recipeFamily(recipeById[d.lunch])!==recipeFamily(recipeById[d.dinner])));
 const families={};for(const d of p.days)for(const key of ['lunch','dinner']){const f=recipeFamily(recipeById[d[key]]);families[f]=(families[f]||0)+1}assert(Object.values(families).every(n=>n<=4));
 const sig=p.days.map(d=>d.lunch+'|'+d.dinner).join(';');assert(!signatures.has(sig));signatures.add(sig);
 assert(p.days.every(d=>recipeById[d.breakfast].kind==='Desayuno'));
 assert(p.days.every((d,j)=>!j||d.breakfast!==p.days[j-1].breakfast));
 assert.equal(planEntries(p).reduce((n,e)=>n+e.servings,0),21*p.servings);
 const expected=new Map();for(const {id,servings}of planEntries(p))for(const item of recipeById[id].items){const key=item.id+'|'+item.unit;expected.set(key,(expected.get(key)||0)+item.qty*servings)}
 for(const item of shoppingForPlan(p))assert.equal(item.qty,expected.get(item.id+'|'+item.unit));prev=p;
}
assert(!validPlan({}));assert.throws(()=>generatePlan({servings:0}));assert.throws(()=>generatePlan({start:''}));
fs.mkdirSync('../output/pdf',{recursive:true});fs.mkdirSync('../tmp/pdfs',{recursive:true});
const plan=generatePlan({start:'2026-11-23',servings:2,selected:['calabaza','brocoli','pollo']});
const bytes=await createWeeklyPdf(plan,{templateBytes:fs.readFileSync('dist/assets/plantilla-guia.pdf'),headerBytes:fs.readFileSync('dist/assets/cabecera-guia.jpg')});
fs.writeFileSync('../output/pdf/ejemplo-plan-semanal.pdf',bytes);fs.writeFileSync('../tmp/pdfs/generated-plan.json',JSON.stringify(plan,null,2));
const worst={...plan,servings:6};const worstBytes=await createWeeklyPdf(worst,{templateBytes:fs.readFileSync('dist/assets/plantilla-guia.pdf'),headerBytes:fs.readFileSync('dist/assets/cabecera-guia.jpg')});fs.writeFileSync('../tmp/pdfs/plan-seis-personas.pdf',worstBytes);
console.log('OK: 100 planes distintos, 14 principales únicos por semana, desayunos, fechas y compra verificados. PDF de ejemplo y PDF para seis personas generados.');
