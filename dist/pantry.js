export function pantryFor(recipe){
 const text=recipe.steps.join(' ').toLowerCase();
 const result=/aceite/.test(text)?['Aceite de oliva']:[];
 for(const [pattern,label] of [[/limón/,'Limón'],[/vinagre/,'Vinagre de manzana'],[/perejil/,'Perejil'],[/albahaca/,'Albahaca'],[/ajo en polvo/,'Ajo en polvo'],[/poco de ajo/,'Ajo'],[/orégano/,'Orégano'],[/menta/,'Menta (opcional)'],[/salsa de soja/,'Salsa de soja'],[/pimentón/,'Pimentón dulce'],[/laurel/,'Laurel'],[/nuez moscada/,'Nuez moscada'],[/pimienta/,'Pimienta'],[/caldo de pescado/,'Caldo de pescado'],[/caldo de verduras/,'Caldo de verduras'],[/caldo suficiente/,'Caldo para guisar'],[/encurtidos|pepinillos/,'Encurtidos (opcional)']])if(pattern.test(text))result.push(label);
 return result;
}
