import {recipeById,ingredientById,planEntries,shoppingForPlan,pantryForPlan,dateForDay,formatQuantity} from './weekly-plan.js';
import {pantryFor} from './pantry.js';
export async function createWeeklyPdf(plan,{templateBytes,headerBytes,lib=globalThis.PDFLib}={}){
 if(!lib)throw new Error('No se ha cargado el generador de PDF. Recarga la página.');
 async function asset(file){const r=await fetch(new URL(file,import.meta.url));if(!r.ok)throw new Error('No se pudo cargar la plantilla del PDF.');return new Uint8Array(await r.arrayBuffer())}
 templateBytes??=await asset('./assets/plantilla-guia.pdf');headerBytes??=await asset('./assets/cabecera-guia.jpg');templateBytes=new Uint8Array(templateBytes);headerBytes=new Uint8Array(headerBytes);
 const {PDFDocument,StandardFonts,rgb}=lib,doc=await PDFDocument.create(),template=await PDFDocument.load(templateBytes);
 const font=await doc.embedFont(StandardFonts.Helvetica),bold=await doc.embedFont(StandardFonts.HelveticaBold),header=await doc.embedJpg(headerBytes);
 const W=595.32,H=841.92,margin=36,width=W-margin*2,green=rgb(.44,.65,.25),dark=rgb(.22,.35,.12),pale=rgb(.89,.93,.83),gray=rgb(.94,.94,.94),black=rgb(.08,.08,.08),white=rgb(1,1,1);
 const safe=text=>Array.from(String(text).replace(/[\u2010-\u2015]/g,'-').replace(/\u202f|\u00a0/g,' ')).map(c=>{try{font.encodeText(c);return c}catch{return ' '}}).join('');
 const text=(p,t,x,top,size=9,f=font,color=black)=>p.drawText(safe(t),{x,y:H-top-size,size,font:f,color});
 const rect=(p,x,top,w,h,fill=null,border=true)=>p.drawRectangle({x,y:H-top-h,width:w,height:h,...(fill?{color:fill}:{}),...(border?{borderWidth:.5,borderColor:black}:{})});
 const wrap=(t,max,size=9,f=font)=>{const out=[];for(const paragraph of safe(t).split('\n')){let line='';for(let word of paragraph.split(/\s+/).filter(Boolean)){while(f.widthOfTextAtSize(word,size)>max){let k=word.length-1;while(k>1&&f.widthOfTextAtSize(word.slice(0,k),size)>max)k--;if(line){out.push(line);line=''}out.push(word.slice(0,k));word=word.slice(k)}const test=line?`${line} ${word}`:word;if(f.widthOfTextAtSize(test,size)>max&&line){out.push(line);line=word}else line=test}if(line)out.push(line)}return out};
 const paragraph=(p,t,x,top,w,size=9,f=font,lineHeight=size*1.35)=>{const lines=wrap(t,w,size,f);lines.forEach((line,i)=>text(p,line,x,top+i*lineHeight,size,f));return top+lines.length*lineHeight};
 const centered=(p,t,top,size=11,f=bold,color=black)=>text(p,t,(W-f.widthOfTextAtSize(safe(t),size))/2,top,size,f,color);
 function blank(title){const p=doc.addPage([W,H]);p.drawImage(header,{x:W-174,y:H-61,width:137,height:44});centered(p,title,79,11);return p}
 const copied=await doc.copyPages(template,[0,1,2,3]);copied.forEach(p=>doc.addPage(p));
 const cover=doc.getPage(0);text(cover,'GUÍA DE ALIMENTACIÓN',61.8,H-126,12,bold,white);text(cover,`Semana ${dateForDay(plan.start,0)} - ${dateForDay(plan.start,6)}`,61.8,H-108,10,font,white);text(cover,'Mikel',61.8,H-87,12,bold,white);
 // Se conservan las páginas generales del ejemplo; los bloques variables se regeneran.
 let p=blank('Plan nutricional');
 text(p,`${dateForDay(plan.start,0)} - ${dateForDay(plan.start,6)}  |  ${plan.servings} persona${plan.servings===1?'':'s'}`,margin,100,9);
 rect(p,margin,122,width,17,green);centered(p,'PLAN SEMANAL',124,10,bold,white);
 const cols=[35,148,170,width-353],heads=['Día','Desayuno','Comida','Cena'];let x=margin;
 for(let i=0;i<4;i++){rect(p,x,139,cols[i],24,i===0?gray:[dark,pale,dark][i-1]);text(p,heads[i],x+6,145,10,bold,i===1||i===3?white:black);x+=cols[i]}
 let top=163;
 plan.days.forEach((d,i)=>{const values=[['L','M','X','J','V','S','D'][i],recipeById[d.breakfast].name,recipeById[d.lunch].name,recipeById[d.dinner].name],sizes=[10,9,9,9],lines=values.map((v,j)=>wrap(v,cols[j]-16,sizes[j],j===0?bold:font)),rowH=Math.max(53,...lines.map((l,j)=>l.length*sizes[j]*1.35+18));let cx=margin;for(let j=0;j<4;j++){rect(p,cx,top,cols[j],rowH,i%2===0?gray:null);lines[j].forEach((s,k)=>text(p,s,cx+6,top+10+k*sizes[j]*1.35,sizes[j],j===0?bold:font));cx+=cols[j]}top+=rowH});
 top+=20;centered(p,'DESAYUNOS Y ORGANIZACIÓN',top,10);top+=24;
 top=paragraph(p,'Cada desayuno remite a su ficha del recetario. Las cantidades indicadas en las fichas son para las personas elegidas y la compra suma todas las apariciones durante la semana.',margin,top,width,9);
 top=paragraph(p,'El plan combina platos de las guías de forma aleatoria. Los ingredientes favoritos aumentan la prioridad, pero no excluyen otros alimentos. Revisa cada ficha antes de cocinar.',margin,top+12,width,9);
 paragraph(p,'Documento generado por A tu gusto a partir de tus ejemplos. No es una nueva pauta prescrita por el autor de las guías.',margin,top+12,width,8.5,bold);
 let rp=blank('RECETARIO BASE'),y=112;
 const entries=planEntries(plan);
 for(const {id} of entries){const r=recipeById[id],pantry=pantryFor(r),title=`${r.name.toUpperCase()} (${plan.servings} ${plan.servings===1?'ración':'raciones'})`,items=r.items.map(i=>`${ingredientById[i.id].name}: ${formatQuantity(i,plan.servings)}`).join(' · ')+'.'+(pantry.length?' '+pantry.join(', ')+': al gusto.':''),steps=r.steps.map((s,i)=>`${i+1}. ${s}`).join(' '),titleLines=wrap(title,width,9,bold),itemLines=wrap(items,width-87,8.4),stepLines=wrap(steps,width-87,8.4),h1=Math.max(22,itemLines.length*11+10),h2=Math.max(22,stepLines.length*11+10),block=titleLines.length*12+8+h1+h2+27;
  if(y+block>H-57){rp=blank('RECETARIO BASE (continuación)');y=112}
  titleLines.forEach((s,i)=>text(rp,s,margin,y+i*12,9,bold));y+=titleLines.length*12+6;
  for(const [label,lines,h]of [['Ingredientes',itemLines,h1],['Preparación',stepLines,h2]]){rect(rp,margin,y,70,h,gray);rect(rp,margin+70,y,width-70,h);text(rp,label,margin+5,y+6,8.3,bold);lines.forEach((s,i)=>text(rp,s,margin+76,y+5+i*11,8.4));y+=h}
  text(rp,`Origen: ${r.source}. Cantidades adaptadas. Tiempo orientativo: ${r.time} min.`,margin,y+5,7.5);y+=27;
 }
 p=blank('LISTA DE LA COMPRA 1 SEMANA');text(p,`${plan.servings} persona${plan.servings===1?'':'s'} · Desayunos, comidas y cenas · ${dateForDay(plan.start,0)} - ${dateForDay(plan.start,6)}`,margin,103,9);
 const items=shoppingForPlan(plan),groupOrder=['Verduras','Proteínas','Bases y legumbres','Lácteos y extras','Frutas'];
 y=119;const colW=(width-16)/2;let column=0;
 for(const group of groupOrder){const list=items.filter(i=>ingredientById[i.id].group===group);if(!list.length)continue;const groupLines=list.map(i=>wrap(`${ingredientById[i.id].name}: ${formatQuantity(i)}`,colW-14,8.7)),height=22+groupLines.reduce((n,l)=>n+Math.max(20,l.length*11+8),0)+12;
  if(y+height>H-57){if(column===0){column=1;y=119}else{p=blank('LISTA DE LA COMPRA (continuación)');column=0;y=112}}
  const cx=margin+column*(colW+16);rect(p,cx,y,colW,22,pale);text(p,group.toUpperCase(),cx+6,y+6,9,bold);y+=22;
  for(const lines of groupLines){const rh=Math.max(20,lines.length*11+8);rect(p,cx,y,colW,rh);lines.forEach((s,i)=>text(p,s,cx+6,y+5+i*11,8.7));y+=rh}y+=12;
 }
 const extras=pantryForPlan(plan),purchaseNote='Las cantidades de legumbres y conservas se refieren a producto cocido o escurrido salvo indicación contraria. Los cereales que indican «en seco» se pesan antes de cocer.';let needed=45+wrap(extras.join(' · ')+'. Cantidades al gusto.',colW-12,8.7).length*11.75+wrap(purchaseNote,colW-12,8.2).length*11.1;
 if(y+needed>H-48){if(column===0){column=1;y=119}else{p=blank('LISTA DE LA COMPRA (continuación)');column=0;y=112}}
 x=margin+column*(colW+16);rect(p,x,y,colW,22,pale);text(p,'DESPENSA Y ALIÑOS',x+6,y+6,9,bold);y=paragraph(p,extras.join(' · ')+'. Cantidades al gusto.',x+6,y+29,colW-12,8.7);
 paragraph(p,purchaseNote,x+6,y+16,colW-12,8.2);
 const ending=await doc.copyPages(template,[4,5]);ending.forEach(p=>doc.addPage(p));
 const total=doc.getPageCount();doc.getPages().forEach((page,i)=>{if(i===0){text(page,'PLAN SEMANAL GENERADO · A TU GUSTO',61.8,H-56,8,font,white);return}text(page,'A tu gusto · Plan generado automáticamente a partir de las guías',margin,H-28,7,font,rgb(.35,.35,.35));text(page,`${i+1} / ${total}`,W-66,H-28,7,font,rgb(.35,.35,.35))});
 doc.setTitle(`Plan semanal Mikel · ${plan.start}`);doc.setAuthor('A tu gusto');doc.setSubject('Plan semanal aleatorio basado en las guías aportadas');doc.setCreator('A tu gusto · Generador local');doc.setLanguage('es-ES');return doc.save();
}
