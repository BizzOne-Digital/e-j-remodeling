// Renders logo.png, logo-mark.png, favicon.png, app icons and og-image.webp from vector markup using local Chrome.
import puppeteer from "puppeteer-core";
import sharp from "sharp";
import fs from "node:fs";
const out = "public/images/";
const mark = `<defs><linearGradient id="b" x1="0" x2="1"><stop offset="0" stop-color="#0754B8"/><stop offset=".4" stop-color="#159DFF"/><stop offset=".68" stop-color="#8fd0ff"/><stop offset="1" stop-color="#fff"/></linearGradient>
<linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff"/><stop offset=".55" stop-color="#f4f7fa"/><stop offset="1" stop-color="#C5CFDA"/></linearGradient></defs>
<path fill="url(#s)" d="M160 208 L461 36 L552 94 V68 H596 V122 L730 208 L690 206 L622 182 L461 76 L284 184 Z"/>
<path fill="url(#s)" d="M430 119h29v29h-29zM465 119h29v29h-29zM430 154h29v29h-29zM465 154h29v29h-29z"/>
<path fill="url(#b)" d="M32 360 C70 240 190 178 320 192 C410 202 450 224 540 213 C610 204 680 200 760 212 L748 235 C670 222 600 230 540 238 C440 250 400 224 310 219 C200 214 100 255 32 360 Z"/>
<path fill="url(#s)" d="M395 236 Q460 262 530 246 Q460 248 395 236 Z"/>
<text x="216" y="464" font-family="Tinos" font-weight="700" font-size="310" fill="url(#s)" textLength="516" lengthAdjust="spacingAndGlyphs">E&amp;J</text>`;
const svg = (w, h, vb, inner) => `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="${vb}">${inner}</svg>`;
const logo = svg(1200, 400, "0 0 1960 653", `<g transform="translate(0 70)">${mark}</g><g fill="#fff" font-family="Libre Baskerville" font-weight="700"><text x="812" y="370" font-size="92" textLength="528" lengthAdjust="spacingAndGlyphs">Kitchen and</text><text x="812" y="484" font-size="92" textLength="1128" lengthAdjust="spacingAndGlyphs">Bathroom Remodeling, LLC</text></g>`);
const icon = `<div style="width:512px;height:512px;border-radius:96px;background:linear-gradient(145deg,#0B2239,#040D18);display:grid;place-items:center">${svg(440, 290, "10 20 770 470", mark)}</div>`;
const bg = `data:image/webp;base64,${fs.readFileSync(out + "hero-kitchen.webp").toString("base64")}`;
const og = `<div style="width:1200px;height:630px;background:linear-gradient(90deg,rgba(4,13,24,.97) 30%,rgba(4,13,24,.5)),url(${bg}) center/cover;display:flex;align-items:center;padding-left:50px;box-sizing:border-box">${logo.replace('width="1200" height="400"', 'width="900" height="300"')}</div>`;
const exe = process.env.CHROME_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe";
const b = await puppeteer.launch({ executablePath: exe, headless: true });
const p = await b.newPage();
async function shot(html, w, h) {
  await p.setViewport({ width: w, height: h });
  await p.setContent(`<link href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:wght@700&family=Tinos:wght@700&display=block" rel="stylesheet"><style>body{margin:0}svg{display:block}</style>${html}`, { waitUntil: "domcontentloaded" });
  await p.waitForFunction(() => document.styleSheets.length >= 2, { timeout: 60000 }); await p.evaluate(async () => { await document.fonts.load("700 80px \"Libre Baskerville\""); await document.fonts.load("700 80px Tinos", "E&J"); await Promise.all([...document.images].map((i) => i.decode())); });
  return Buffer.from(await p.screenshot({ omitBackground: true }));
}
const png = (buf, f) => sharp(buf).png({ compressionLevel: 9 }).toFile(f);
await png(await shot(logo, 1200, 400), out + "logo.png");
await png(await shot(svg(770, 470, "10 20 770 470", mark), 770, 470), out + "logo-mark.png");
const ic = await shot(icon, 512, 512);
await png(ic, out + "favicon.png");
await sharp(ic).resize(96).png().toFile("app/icon.png");
await sharp(ic).flatten({ background: "#040D18" }).resize(180).png().toFile("app/apple-icon.png");
await sharp(await shot(og, 1200, 630)).webp({ quality: 82 }).toFile(out + "og-image.webp");
await b.close();
