import fs from 'node:fs';
import assert from 'node:assert/strict';
import {ingredients,recipes} from './dist/data.js';
import {pantryFor} from './dist/pantry.js';
assert(recipes.length>=20);
assert.equal(new Set(recipes.map(r=>r.id)).size,recipes.length);
const ids=new Set(ingredients.map(i=>i.id));
for(const r of recipes){assert(r.source&&r.steps.length>=3&&r.time>0);assert(fs.existsSync(`dist/assets/${r.id}.svg`));for(const i of r.items){assert(ids.has(i.id),`${r.id}: ${i.id}`);assert(i.qty>0&&i.unit)}if(r.steps.join(' ').includes('aceite'))assert(pantryFor(r).includes('Aceite de oliva'))}
for(const i of ingredients)assert(fs.existsSync(`dist/assets/ingredient-${i.id}.svg`));
assert(pantryFor(recipes.find(r=>r.id==='ensaladilla')).includes('Limón'));
for(const origin of ['Mayo 1','Mayo 2','Junio 1 A','Junio 2','Junio 3','Junio 4','Julio 1','Julio 2','Julio 3','Julio 4','Julio 5'])assert(recipes.some(r=>r.source.includes(origin)),origin);
console.log(`OK: ${recipes.length} recetas, ${ingredients.length} ingredientes, imágenes completas y las 11 guías representadas.`);
