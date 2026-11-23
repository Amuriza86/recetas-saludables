import {ingredients,recipes} from './data.js';
import {pantryFor} from './pantry.js';
export const dayNames=['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'];
export const recipeById=Object.fromEntries(recipes.map(r=>[r.id,r]));
export const ingredientById=Object.fromEntries(ingredients.map(i=>[i.id,i]));
const random=()=>{const a=new Uint32Array(1);globalThis.crypto.getRandomValues(a);return a[0]/4294967296};
export function mondayOf(date){const d=new Date(`${date}T12:00:00`);if(!Number.isFinite(d.getTime()))throw new Error('Selecciona una fecha válida.');d.setDate(d.getDate()-(d.getDay()+6)%7);return localDate(d)}
export function localDate(d){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
export function dateForDay(start,i){const d=new Date(`${start}T12:00:00`);d.setDate(d.getDate()+i);return d.toLocaleDateString('es-ES',{day:'numeric',month:'short'})}
function pick(pool,selected,rng){const weights=pool.map(r=>1+2*r.items.filter(x=>selected.has(x.id)).length);let ticket=rng()*weights.reduce((a,b)=>a+b,0);for(let i=0;i<pool.length;i++){ticket-=weights[i];if(ticket<0)return pool.splice(i,1)[0]}return pool.pop()}
export function recipeFamily(r){const ids=new Set(r.items.map(x=>x.id));if(ids.has('garbanzos')||ids.has('lentejas'))return 'legumbres';if(['salmon','merluza','atun','gambas','pulpo','chipiron','anchoas'].some(id=>ids.has(id)))return 'pescado';if(ids.has('pollo')||ids.has('pavo'))return 'aves';if(ids.has('ternera'))return 'carne';return 'huevo-verduras'}
export function generatePlan({start=localDate(new Date()),servings=1,selected=[],previous=null,rng=random}={}){
 const count=Number(servings);if(!Number.isInteger(count)||count<1||count>6)throw new Error('Las raciones deben estar entre 1 y 6.');
 const preferred=new Set(selected);const main=recipes.filter(r=>r.kind!=='Desayuno');if(main.length<14)throw new Error('Se necesitan al menos 14 recetas principales.');
 const pool=[...main],chosen=[],counts={};
 const take=r=>{chosen.push(r);pool.splice(pool.indexOf(r),1);counts[recipeFamily(r)]=(counts[recipeFamily(r)]||0)+1};
 // Distribuye familias culinarias para variar las ideas; no calcula objetivos nutricionales.
 for(const family of ['legumbres','pescado','aves','huevo-verduras'])for(let n=0;n<2;n++){
  const subset=pool.filter(r=>recipeFamily(r)===family);if(subset.length)take(pick(subset,preferred,rng));
 }
 while(chosen.length<14){const available=pool.filter(r=>(counts[recipeFamily(r)]||0)<4);take(pick(available.length?available:pool,preferred,rng))}
 const sorted=[];while(chosen.length)sorted.push(chosen.splice(Math.floor(rng()*chosen.length),1)[0]);
 for(let i=0;i<14;i+=2)if(recipeFamily(sorted[i])===recipeFamily(sorted[i+1])){const family=recipeFamily(sorted[i]),j=sorted.findIndex((r,k)=>Math.floor(k/2)!==i/2&&recipeFamily(r)!==family&&recipeFamily(sorted[k%2?k-1:k+1])!==family);if(j>=0)[sorted[i+1],sorted[j]]=[sorted[j],sorted[i+1]]}
 const breakfastPool=recipes.filter(r=>r.kind==='Desayuno'),breakfastOrder=[];let rotation=[];
 for(let i=0;i<7;i++){if(!rotation.length)rotation=[...breakfastPool];const available=rotation.filter(r=>r.id!==breakfastOrder.at(-1)?.id);const r=pick(available.length?available:rotation,preferred,rng);breakfastOrder.push(r);const idx=rotation.findIndex(x=>x.id===r.id);if(idx>=0)rotation.splice(idx,1)}
 const days=dayNames.map((day,i)=>({day,breakfast:breakfastOrder[i].id,lunch:sorted[i*2].id,dinner:sorted[i*2+1].id}));
 if(previous&&days.every((d,i)=>d.lunch===previous.days?.[i]?.lunch&&d.dinner===previous.days?.[i]?.dinner)){[days[0].lunch,days[1].lunch]=[days[1].lunch,days[0].lunch];[days[0].dinner,days[1].dinner]=[days[1].dinner,days[0].dinner]}
 return {version:1,id:`plan-${Date.now()}-${Math.floor(rng()*1e9)}`,start:mondayOf(start),servings:count,selected:[...preferred],days};
}
export function validPlan(plan){return plan?.version===1&&/^\d{4}-\d{2}-\d{2}$/.test(plan.start)&&Number.isFinite(new Date(`${plan.start}T12:00:00`).getTime())&&Number.isInteger(plan.servings)&&plan.servings>=1&&plan.servings<=6&&Array.isArray(plan.days)&&plan.days.length===7&&plan.days.every(d=>recipeById[d.breakfast]?.kind==='Desayuno'&&recipeById[d.lunch]&&recipeById[d.dinner])}
export function planEntries(plan){const counts=new Map();for(const d of plan.days)for(const key of ['breakfast','lunch','dinner'])counts.set(d[key],(counts.get(d[key])||0)+plan.servings);return [...counts].map(([id,servings])=>({id,servings}))}
export function shoppingForPlan(plan){const result=new Map();for(const {id,servings} of planEntries(plan))for(const item of recipeById[id].items){const key=`${item.id}|${item.unit}`;if(!result.has(key))result.set(key,{...item,qty:0});result.get(key).qty+=item.qty*servings}return [...result.values()].sort((a,b)=>ingredientById[a.id].name.localeCompare(ingredientById[b.id].name,'es'))}
export function pantryForPlan(plan){return [...new Set(planEntries(plan).flatMap(({id})=>pantryFor(recipeById[id])))].sort((a,b)=>a.localeCompare(b,'es'))}
export const formatQuantity=(item,multiplier=1)=>`${new Intl.NumberFormat('es-ES',{maximumFractionDigits:2}).format(item.qty*multiplier)} ${item.unit}`;
