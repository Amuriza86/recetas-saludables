# A tu gusto · Web independiente

Repositorio: https://github.com/Amuriza86/recetas-saludables

## Publicación automática desde GitHub

El proyecto está preparado para conectar `main` a un alojamiento estático, con estos ajustes:

- Carpeta raíz: la raíz del repositorio.
- Comando de construcción: `npm run build`.
- Carpeta de publicación: `dist`.
- Versión de Node.js: 22 o posterior.
- Variables de entorno y claves API: ninguna.

Las ilustraciones SVG se generan desde `generate-assets.mjs` durante la construcción, por lo que no es necesario versionarlas. El código editable de las recetas y del generador de PDF sí está incluido, junto con la biblioteca PDF-Lib y la plantilla depurada.

Para Cloudflare Pages: conecta este repositorio en **Workers & Pages > Create application > Pages > Connect to Git**, elige `main`, usa los ajustes anteriores y publica. Las siguientes subidas a `main` se publicarán automáticamente.

Web estática de recetas saludables. Los visitantes no necesitan ChatGPT, registro ni inicio de sesión. No usa API de OpenAI, claves de acceso, base de datos ni suscripciones.

## Novedades: recetario ampliado y plan semanal en PDF

- 71 recetas y 61 ingredientes. Se han revisado las 11 guías iniciales y las 28 guías adicionales; las ideas repetidas no se duplican por cambiar de semana.
- En **Tu plan semanal, en PDF**, elige una fecha y entre 1 y 6 personas y pulsa **Generar plan semanal en PDF**. La fecha se ajusta al lunes de esa semana.
- Cada clic prepara una combinación nueva de 7 desayunos, 7 comidas y 7 cenas. Las 14 recetas principales son distintas y se alternan las familias de platos entre comida y cena. Los favoritos aumentan la prioridad; no son un filtro de exclusión.
- El PDF conserva la portada y las páginas generales del ejemplo. Regenera el menú semanal, las fichas y la compra con cantidades para las personas elegidas. El número de páginas varía según la longitud de las recetas.
- **Descargar este plan en PDF** repite la descarga de la combinación que se ve en pantalla. Para cambiar semana o personas hay que generar un nuevo plan.
- La compra suma todas las comidas de la semana, incluidos los desayunos repetidos. Se mantienen separadas cantidades en unidades diferentes y preparaciones distintas (por ejemplo, tomate fresco y triturado).
- El plan se guarda en el navegador y los títulos de las recetas abren sus fichas. El PDF se genera en el dispositivo, sin enviar los ingredientes a ningún servicio.
- El documento identifica el menú como generado automáticamente. Las páginas generales se reproducen como parte del ejemplo; no son recomendaciones nuevas calculadas por el generador.

Para actualizar un proyecto existente en Netlify, sube el nuevo ZIP de publicación en la sección **Deploys** de ese mismo proyecto. Esto mantiene la dirección de la web.

## Publicar los archivos preparados

1. Descomprime `recetas-web-publicar.zip`.
2. Sube su contenido a la carpeta pública de tu alojamiento web (por ejemplo, `public_html`). `index.html` debe quedar directamente en esa carpeta, junto a los archivos JavaScript, CSS y la carpeta `assets`.
3. Abre la dirección de tu dominio. Conserva los nombres de archivo y la estructura de carpetas.

También puedes subir esa carpeta a un servicio de alojamiento estático. No requiere compilación, instalación de paquetes ni variables de entorno. Funciona en la raíz del dominio y dentro de una subcarpeta porque usa rutas relativas.

## Proyecto editable

`recetas-proyecto-independiente.zip` contiene este proyecto sin metadatos de Sites ni de Git. La web que se publica está en `dist/`.

- `dist/index.html`: estructura de la página.
- `dist/style.css`: diseño y adaptación a móvil.
- `dist/app.js`: selección, propuestas, fichas y compra.
- `dist/data.js`: ingredientes y recetas.
- `dist/extra-recipes.js`: nuevas recetas de las guías adicionales.
- `dist/pantry.js`: aliños de las recetas.
- `dist/weekly-plan.js`: generación aleatoria, fechas y cálculo de la compra semanal.
- `dist/weekly-pdf.js`: composición del PDF.
- `dist/weekly-ui.js` y `dist/weekly.css`: botón, controles y vista semanal.
- `dist/assets/plantilla-guia.pdf`: plantilla de las páginas generales sin nombre ni semana del destinatario original.
- `dist/vendor/`: PDF-Lib, incluida localmente con su licencia MIT.
- `dist/assets/`: ilustraciones locales.
- `generate-assets.mjs`: genera las ilustraciones a partir de los datos.
- `check.mjs`: comprueba los datos y las imágenes.
- `check-weekly.mjs`: verifica 100 planes y genera un PDF de ejemplo en `../output/pdf/`.
- `server.mjs`: servidor de vista previa local; no es necesario en el hosting.
- `netlify.toml`: indica `dist` como carpeta de publicación en Netlify.

## Ver y editar en tu ordenador

Con Node.js instalado, abre una terminal en la carpeta del proyecto y ejecuta:

```sh
npm start
```

Abre `http://127.0.0.1:4173`. Para detenerlo, pulsa Ctrl+C.

No abras `index.html` con doble clic: la web usa módulos JavaScript y necesita servirse mediante HTTP o HTTPS.

```sh
npm run check
```

`npm run build` genera las ilustraciones y ejecuta las comprobaciones; los archivos de `dist` quedan listos para publicar. No hace falta `npm install` porque no hay dependencias de paquetes.

Para regenerar las ilustraciones después de cambiar los datos:

```sh
node generate-assets.mjs
```

## Datos y acceso

Los favoritos y la compra se guardan en el navegador de cada visitante, sin enviarse a un servidor. No se sincronizan entre dispositivos o dominios. Las ilustraciones están incluidas; las fuentes tipográficas se solicitan a Google Fonts y tienen fuentes de respaldo si no hay conexión.

El ZIP no incluye los documentos personales originales completos ni credenciales. Incluye una plantilla depurada de las páginas generales para mantener el formato solicitado. Las recetas se adaptaron de las guías proporcionadas. Los visitantes de tu nueva dirección web podrán acceder sin ChatGPT, siempre que tu alojamiento no añada su propia protección de acceso. El enlace antiguo de ChatGPT conserva su configuración de acceso y es independiente de esta versión.
