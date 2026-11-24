// End-to-end checks against a running server started with a disposable database:
//   STRIPE_SECRET_KEY=sk_test_fake STRIPE_WEBHOOK_SECRET=whsec_test PORT=3100 node scripts/dev-memory.mjs start
//   BASE=http://localhost:3100 npm run test:e2e
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import puppeteer from "puppeteer-core";
import sharp from "sharp";
import Stripe from "stripe";

const BASE = process.env.BASE || "http://localhost:3100";
const SHOTS = process.env.SHOTS || fs.mkdtempSync(path.join(os.tmpdir(), "ej-shots-"));
const WH = process.env.STRIPE_WEBHOOK_SECRET || "whsec_test";
fs.mkdirSync(SHOTS, { recursive: true });
let cookie = "", pass = 0, fail = 0, ip = 1;
const check = (name, cond, info = "") => { if (cond) pass++; else { fail++; console.log("FAIL", name, info); } };
async function call(url, { method, body, auth = true, origin = BASE, form } = {}) {
  const r = await fetch(BASE + url, { method: method ?? (body || form ? "POST" : "GET"), redirect: "manual", headers: { ...(origin && { Origin: origin }), ...(auth && cookie && { Cookie: cookie }), "X-Real-IP": `10.0.0.${ip}`, ...(body && { "Content-Type": "application/json" }) }, body: form ?? (body ? JSON.stringify(body) : undefined) });
  const text = await r.text();
  let json = null; try { json = JSON.parse(text); } catch {}
  return { status: r.status, json, text, headers: r.headers };
}
const old = () => Date.now() - 60000, sub = () => crypto.randomUUID();
const day = (n) => { const d = new Date(Date.now() + n * 864e5); return d.toISOString().slice(0, 10); };

// ---------- public pages
for (const p of ["/", "/services", "/testimonials", "/booking", "/contact", "/payment", "/payment/success", "/payment/cancel", "/privacy-policy", "/terms-and-conditions", "/admin/login", "/sitemap.xml", "/robots.txt"]) check("page " + p, (await call(p)).status === 200);
check("404", (await call("/nope")).status === 404);
const homeHtml = (await call("/")).text;
check("csp header", (await call("/")).headers.get("content-security-policy")?.includes("frame-ancestors"));
check("canonical", homeHtml.includes('rel="canonical"')); check("jsonld", homeHtml.includes("HomeAndConstructionBusiness")); check("no fake rating", !homeHtml.includes("aggregateRating"));
check("noindex", (await call("/payment")).headers.get("x-robots-tag")?.includes("noindex"));
const titles = new Set(); for (const p of ["/", "/services", "/testimonials", "/booking", "/contact"]) titles.add((await call(p)).text.match(/<title>(.*?)<\/title>/)[1]); check("unique titles", titles.size === 5);

// ---------- auth
for (const u of ["/api/admin/stats", "/api/admin/bookings", "/api/admin/payments/export", "/api/admin/singleton/settings", "/api/admin/account"]) check("401 " + u, (await call(u)).status === 401);
check("panel redirect", (await call("/admin/dashboard")).status === 307);
check("upload 401", (await call("/api/upload", { method: "POST" })).status === 401);
check("bad login", (await call("/api/auth/login", { body: { email: "admin@example.com", password: "nope" } })).status === 401);
check("nosql login", (await call("/api/auth/login", { body: { email: { $gt: "" }, password: { $gt: "" } } })).status === 400);
check("csrf", (await call("/api/auth/login", { body: { email: "admin@example.com", password: "local-demo-password" }, origin: "https://evil.example" })).status === 403);
check("csrf no origin", (await call("/api/contact", { body: {}, origin: null })).status === 403);
const li = await call("/api/auth/login", { body: { email: "admin@example.com", password: "local-demo-password" } });
check("login", li.status === 200, li.text); const sc = li.headers.get("set-cookie") ?? ""; check("cookie flags", /HttpOnly/i.test(sc) && /SameSite=lax/i.test(sc)); cookie = sc.split(";")[0];
const st = await call("/api/admin/stats"); check("stats+seed", st.status === 200 && st.json.stats.bookings === 0, st.text);

// ---------- booking
const bk = { requestType: "Free Estimate", fullName: "Pat Doe", email: "pat@example.com", phone: "570-555-0100", address: "1 Main Street", city: "Scranton", zip: "18503", service: "Showers", preferredDate: day(5), preferredTime: "Morning", budget: "", description: "Replace a tub with a shower", contactMethod: "Phone", consent: true, website: "", startedAt: old(), submissionId: sub() };
const b1 = await call("/api/bookings", { body: bk }); check("booking", b1.status === 201 && /^EJ-/.test(b1.json.reference), b1.text);
const b2 = await call("/api/bookings", { body: bk }); check("booking dedupe", b2.json?.reference === b1.json.reference);
check("past date", (await call("/api/bookings", { body: { ...bk, submissionId: sub(), preferredDate: day(-2) } })).status === 400);
check("fake date", (await call("/api/bookings", { body: { ...bk, submissionId: sub(), preferredDate: "2027-02-31" } })).status === 400);
check("bad slot", (await call("/api/bookings", { body: { ...bk, submissionId: sub(), preferredTime: "3am" } })).status === 400);
ip++;
await call("/api/bookings", { body: { ...bk, submissionId: sub(), website: "spam" } });
await call("/api/bookings", { body: { ...bk, submissionId: sub(), startedAt: Date.now() } });
let list = await call("/api/admin/bookings?q=pat"); check("spam dropped, one stored", list.json.total === 1, list.text.slice(0, 200));
const bid = list.json.items[0]._id;
check("booking edit", (await call(`/api/admin/bookings/${bid}`, { method: "PATCH", body: { status: "Confirmed", preferredDate: day(9), preferredTime: "10:00 AM", adminNotes: "note" } })).json?.item.status === "Confirmed");
check("bad status", (await call(`/api/admin/bookings/${bid}`, { method: "PATCH", body: { status: "Hacked", preferredDate: day(9), preferredTime: "x", adminNotes: "" } })).status === 400);
check("status filter", (await call("/api/admin/bookings?status=Pending")).json.total === 0);
check("regex safe", (await call("/api/admin/bookings?q=" + encodeURIComponent(".*("))).json.total === 0);
const av = (await call("/api/admin/singleton/availability")).json.data;
check("availability save", (await call("/api/admin/singleton/availability", { method: "PUT", body: { ...av, blockedDates: [day(6)] } })).status === 200);
check("blocked date", (await call("/api/bookings", { body: { ...bk, submissionId: sub(), preferredDate: day(6) } })).status === 400);
check("availability public", (await call("/api/bookings/availability")).json.blockedDates.length === 1);
check("availability invalid", (await call("/api/admin/singleton/availability", { method: "PUT", body: { ...av, weekdays: [] } })).status === 400);

// ---------- contact + rate limit
ip++;
const ct = { fullName: "Sam Lee", email: "sam@example.com", phone: "5705550111", service: "Floors", subject: "Kitchen floor", message: "Hello <script>alert(1)</script>", consent: true, startedAt: old(), submissionId: sub() };
check("contact", (await call("/api/contact", { body: ct })).status === 201); check("contact dedupe", (await call("/api/contact", { body: ct })).status === 200);
check("contact invalid", (await call("/api/contact", { body: { ...ct, email: "x", submissionId: sub() } })).json.fields?.email);
let limited = false; for (let i = 0; i < 8; i++) limited ||= (await call("/api/contact", { body: { ...ct, submissionId: sub() } })).status === 429; check("rate limit", limited);
const iq = (await call("/api/admin/inquiries?read=false")).json; check("inquiry stored", iq.total >= 1);
check("inquiry update", (await call(`/api/admin/inquiries/${iq.items[0]._id}`, { method: "PATCH", body: { read: true, status: "Resolved", adminNotes: "n" } })).json?.item.read === true);
check("inquiry delete", (await call(`/api/admin/inquiries/${iq.items[1]._id}`, { method: "DELETE" })).status === 200);

// ---------- reviews
ip++;
check("review", (await call("/api/testimonials", { body: { fullName: "Test Reviewer", email: "secret@example.com", service: "Cabinets", rating: 5, message: "E2E review text, lovely.", consent: true, startedAt: old(), submissionId: sub() } })).status === 201);
check("review hidden", !(await call("/testimonials")).text.includes("E2E review text"));
const rv = (await call("/api/admin/testimonials")).json.items[0];
check("no publish unapproved", (await call(`/api/admin/testimonials/${rv._id}`, { method: "PATCH", body: { status: "Pending", published: true, message: rv.message, image: "" } })).status === 400);
check("approve", (await call(`/api/admin/testimonials/${rv._id}`, { method: "PATCH", body: { status: "Approved", published: true, message: rv.message, image: "" } })).status === 200);
const tp = (await call("/testimonials")).text; check("review visible (cache invalidated)", tp.includes("E2E review text")); check("email private", !tp.includes("secret@example.com") && !(await call("/api/testimonials")).text.includes("secret@"));

// ---------- CRUD + cache invalidation
const fq = await call("/api/admin/faqs", { body: { question: "E2E question?", answer: "Yes", published: true } }); check("faq create", fq.status === 201, fq.text);
check("faq live", (await call("/")).text.includes("E2E question?"));
check("faq hide", (await call(`/api/admin/faqs/${fq.json.item._id}`, { method: "PATCH", body: { question: "E2E question?", answer: "Yes", published: false } })).status === 200 && !(await call("/")).text.includes("E2E question?"));
check("faq delete", (await call(`/api/admin/faqs/${fq.json.item._id}`, { method: "DELETE" })).status === 200);
const sv = (await call("/api/admin/services")).json.items; check("6 services seeded", sv.length === 6);
check("reorder", (await call("/api/admin/services", { method: "PUT", body: { ids: sv.map((s) => s._id).reverse() } })).status === 200 && (await call("/api/admin/services")).json.items[0].slug === "floors");
await call("/api/admin/services", { method: "PUT", body: { ids: sv.map((s) => s._id) } });
check("dup slug", (await call("/api/admin/services", { body: { title: "X", slug: "floors", shortDescription: "x", description: "", icon: "wrench", image: "", benefits: [], options: [], published: false } })).status === 409);
check("unknown resource", (await call("/api/admin/constructor")).status === 404);
check("no booking create", (await call("/api/admin/bookings", { body: {} })).status === 405);
const set = (await call("/api/admin/singleton/settings")).json.data;
check("settings save", (await call("/api/admin/singleton/settings", { method: "PUT", body: { ...set, serviceAreas: "E2E Area" } })).status === 200 && (await call("/")).text.includes("E2E Area"));
check("settings xss url", (await call("/api/admin/singleton/settings", { method: "PUT", body: { ...set, social: { ...set.social, facebookUrl: "javascript:1" } } })).status === 400);
await call("/api/admin/singleton/settings", { method: "PUT", body: set });
const home = (await call("/api/admin/singleton/home")).json.data;
await call("/api/admin/singleton/home", { method: "PUT", body: { ...home, sections: { ...home.sections, faq: false } } }); check("section hidden", !(await call("/")).text.includes('id="faq-h"'));
await call("/api/admin/singleton/home", { method: "PUT", body: home });

// ---------- uploads
const png = await sharp({ create: { width: 900, height: 700, channels: 3, background: "#0754B8" } }).png().toBuffer();
const form = (buf, type, folder) => { const f = new FormData(); f.set("file", new File([buf], "x.png", { type })); f.set("folder", folder); return f; };
const up = await call("/api/upload", { form: form(png, "image/png", "gallery") }); check("upload", up.status === 201, up.text);
check("upload folder", (await call("/api/upload", { form: form(png, "image/png", "../etc") })).status === 400);
check("upload spoof", (await call("/api/upload", { form: form(Buffer.from("<script>alert(1)</script>....."), "image/png", "misc") })).status === 400);
check("upload svg", (await call("/api/upload", { form: form(Buffer.from("<svg/>"), "image/svg+xml", "misc") })).status === 400);
check("upload big", (await call("/api/upload", { form: form(Buffer.alloc(5e6), "image/png", "misc") })).status === 413);
const im = await call(up.json.url); check("serve", im.status === 200 && im.headers.get("content-type") === "image/png" && im.headers.get("cache-control").includes("immutable") && im.text.length > 100);
check("optimizer", (await call(`/_next/image?url=${encodeURIComponent(up.json.url)}&w=640&q=75`)).status === 200);
check("traversal", (await call("/api/uploads/gallery/..%2f..%2fpackage.json")).status === 404); check("missing", (await call("/api/uploads/gallery/1700000000000-aaaaaaaaaaaaaaaaaaaaaaaa.png")).status === 404);
const up2 = await call("/api/upload", { form: form(png, "image/png", "gallery") });
const gal = { title: "E2E pair", description: "", category: "Kitchens", kind: "project", image: up.json.url, beforeImage: "", afterImage: "", published: true };
check("pair must be project", (await call("/api/admin/gallery", { body: { ...gal, kind: "inspiration", beforeImage: up.json.url, afterImage: up2.json.url } })).status === 400);
check("external img", (await call("/api/admin/gallery", { body: { ...gal, image: "https://evil.example/a.png" } })).status === 400);
const gi = await call("/api/admin/gallery", { body: gal }); check("gallery create", gi.status === 201, gi.text);
check("replace image", (await call(`/api/admin/gallery/${gi.json.item._id}`, { method: "PATCH", body: { ...gal, image: up2.json.url } })).status === 200);
check("old upload removed", (await call(up.json.url)).status === 404); check("new upload kept", (await call(up2.json.url)).status === 200);
check("gallery delete", (await call(`/api/admin/gallery/${gi.json.item._id}`, { method: "DELETE" })).status === 200 && (await call(up2.json.url)).status === 404);
check("sweep", (await call("/api/admin/uploads/sweep", { method: "POST" })).status === 200);

// ---------- payments
const mk = (amount, extra = {}) => call("/api/admin/payments", { body: { type: "Project Deposit", description: "Deposit", customerName: "Pat Doe", customerEmail: "pat@example.com", bookingReference: b1.json.reference, amount, ...extra } });
const p1 = await mk(1234.56); check("payment create", p1.status === 201 && p1.json.item.amountCents === 123456, p1.text);
check("payment min", (await mk(0.1)).status === 400); check("payment booking", (await mk(5, { bookingReference: "EJ-NONE" })).status === 400);
const pay = p1.json.item, page = await call(`/payment?token=${pay.token}`); check("pay page", page.text.includes("$1,234.56")); check("no email leak", !page.text.includes("pat@example.com"));
ip++;
check("lookup", (await call("/api/payments/lookup", { body: { reference: pay.reference, email: "pat@example.com" } })).json?.token === pay.token); check("lookup wrong", (await call("/api/payments/lookup", { body: { reference: pay.reference, email: "x@example.com" } })).status === 404);
const stripe = new Stripe("sk_test_fake");
const send = async (ev, sig) => { const payload = JSON.stringify(ev); return (await fetch(BASE + "/api/webhooks/stripe", { method: "POST", headers: { "stripe-signature": sig ?? stripe.webhooks.generateTestHeaderString({ payload, secret: WH }) }, body: payload })).status; };
const ev = (type, object, id = "evt_" + sub()) => ({ id, object: "event", type, created: Math.floor(Date.now() / 1000), data: { object } });
const sess = (p, o = {}) => ({ id: "cs_" + p.reference, object: "checkout.session", metadata: { paymentId: p._id }, amount_total: p.amountCents, currency: "usd", payment_status: "paid", payment_intent: "pi_" + p.reference, ...o });
const status = async (p) => (await call(`/api/payments/status?token=${p.token}`)).json.status;
check("bad sig", (await send(ev("checkout.session.completed", sess(pay)), "t=1,v1=bad")) === 400);
await call(`/payment/success?token=${pay.token}`); check("redirect does not pay", (await status(pay)) === "Unpaid");
await send(ev("checkout.session.completed", sess(pay, { amount_total: 100 }))); check("amount mismatch", (await status(pay)) === "Unpaid");
const good = ev("checkout.session.completed", sess(pay)); check("webhook ok", (await send(good)) === 200); check("paid", (await status(pay)) === "Paid"); check("replay", (await send(good)) === 200);
await send(ev("checkout.session.expired", sess(pay))); check("late expiry ignored", (await status(pay)) === "Paid");
check("cancel paid blocked", (await call(`/api/admin/payments/${pay._id}`, { method: "PATCH", body: { action: "cancel" } })).status === 409);
check("stats paid", (await call("/api/admin/stats")).json.stats.paidCents === 123456);
check("checkout paid blocked", (await call("/api/payments/checkout", { body: { token: pay.token } })).status === 409);
await send(ev("charge.refunded", { object: "charge", payment_intent: "pi_" + pay.reference, amount_refunded: 5000, refunded: false, metadata: { paymentId: pay._id } })); check("partial refund", (await status(pay)) === "Paid" && (await call("/api/admin/stats")).json.stats.paidCents === 118456);
await send(ev("charge.refunded", { object: "charge", payment_intent: "pi_" + pay.reference, amount_refunded: 123456, refunded: true, metadata: { paymentId: pay._id } })); check("refund", (await status(pay)) === "Refunded");
const p2 = (await mk(50)).json.item; check("admin cancel", (await call(`/api/admin/payments/${p2._id}`, { method: "PATCH", body: { action: "cancel" } })).status === 200 && (await status(p2)) === "Cancelled");
check("no payment delete", (await call(`/api/admin/payments/${p2._id}`, { method: "DELETE" })).status === 405);
const csv = await call("/api/admin/payments/export"); check("csv", csv.text.includes(pay.reference) && csv.headers.get("content-type").includes("csv"));

// ---------- password + sessions
check("weak pw", (await call("/api/admin/account", { method: "PATCH", body: { current: "local-demo-password", next: "short" } })).status === 400);
check("change pw", (await call("/api/admin/account", { method: "PATCH", body: { current: "local-demo-password", next: "another-demo-password" } })).status === 200);
ip++; check("old pw dead", (await call("/api/auth/login", { body: { email: "admin@example.com", password: "local-demo-password" } })).status === 401);
await call("/api/admin/account", { method: "PATCH", body: { current: "another-demo-password", next: "local-demo-password" } });

// ---------- browser
const b = await puppeteer.launch({ executablePath: process.env.CHROME_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true });
const pg = await b.newPage(); const errs = [];
await pg.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]); // smooth scrolling would move targets mid-click
pg.on("console", (m) => m.type() === "error" && errs.push(pg.url() + " " + m.text())); pg.on("pageerror", (e) => errs.push(pg.url() + " " + e.message));
const go = (u) => pg.goto(BASE + u, { waitUntil: "load" });
const settle = (ms) => new Promise((r) => setTimeout(r, ms));
for (const w of [320, 375, 390, 430, 768, 1024, 1280, 1440, 1920]) {
  await pg.setViewport({ width: w, height: w < 768 ? 800 : 950 });
  for (const u of ["/", "/services", "/testimonials", "/booking", "/contact", "/payment", `/payment?token=${p2.token}`]) {
    await go(u); const over = await pg.evaluate(() => { const vw = document.documentElement.clientWidth; return { sw: document.documentElement.scrollWidth - vw, clip: [...document.querySelectorAll("h1,h2,h3,header a,header button")].filter((e) => { const r = e.getBoundingClientRect(); return r.width && r.right > vw + 1; }).map((e) => e.textContent.slice(0, 40)) }; });
    check(`overflow ${w} ${u.slice(0, 10)}`, over.sw <= 0 && !over.clip.length, JSON.stringify(over));
  }
}
const shot = async (u, name, w, h, full) => { await pg.setViewport({ width: w, height: h }); await go(u); if (full) { for (let y = 0; y < await pg.evaluate(() => document.body.scrollHeight); y += 500) { await pg.evaluate((v) => window.scrollTo({ top: v, behavior: "instant" }), y); await settle(150); } await pg.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" })); await pg.addStyleTag({ content: ".reveal,.reveal-line,.wave{animation:none!important}" }); } await settle(1800); await pg.screenshot({ path: path.join(SHOTS, name + ".png"), fullPage: !!full }); };
await shot("/", "hero", 1536, 1024); await shot("/", "home", 1440, 900, true); await shot("/", "mobile", 390, 844, true); await shot("/", "tablet", 820, 1100); await shot("/services", "services", 1440, 900, true); await shot("/booking", "booking", 1440, 900, true); await shot("/contact", "contact", 390, 844, true); await shot("/testimonials", "testimonials", 1440, 900, true);
// navigation
await pg.setViewport({ width: 1440, height: 900 }); await go("/"); await settle(500);
await pg.hover('header a[href="/services"]'); await settle(400); check("dropdown", await pg.$eval("#services-menu", (e) => getComputedStyle(e).visibility === "visible"));
await pg.click('#services-menu a[href="/services#showers"]'); await pg.waitForFunction(() => location.hash === "#showers" && location.pathname === "/services"); await settle(1500); check("anchor", await pg.$eval("#showers", (e) => Math.abs(e.getBoundingClientRect().top) < 250));
await go("/"); await settle(800);
const btnText = async (t) => (await pg.$$("button")).reduce(async (a, x) => (await a) ?? ((await x.evaluate((e) => e.textContent.trim())) === t ? x : null), null);
await (await btnText("Bathrooms")).click(); await settle(700); check("gallery filter", (await pg.$$eval('button[data-lightbox]', (e) => e.length)) === 2);
await (await pg.$('button[data-lightbox]')).click(); await pg.waitForSelector('[role="dialog"]'); await settle(800); await pg.keyboard.press("ArrowRight"); check("lightbox", (await pg.$eval('[role="dialog"]', (e) => e.textContent)).includes("2 of 2")); await pg.screenshot({ path: path.join(SHOTS, "lightbox.png") }); await pg.keyboard.press("Escape"); await settle(400); check("lightbox closed", !(await pg.$('[role="dialog"]')));
const fb = await btnText("Do you provide free estimates?"); await fb.click(); await settle(400); check("faq", await fb.evaluate((e) => e.ariaExpanded === "true"));
await pg.setViewport({ width: 390, height: 844 }); await go("/"); await settle(500); await pg.click('button[aria-label="Open menu"]'); await settle(500); await pg.screenshot({ path: path.join(SHOTS, "drawer.png") }); await pg.click('[role="dialog"] a[href="/contact"]'); await pg.waitForFunction(() => location.pathname === "/contact"); check("drawer closes", !(await pg.$('[role="dialog"]')));
// booking in the browser
await pg.setViewport({ width: 1280, height: 900 }); await go("/booking?type=estimate&service=Floors"); await settle(3200);
check("prefill", (await pg.$eval('select[name="service"]', (e) => e.value)) === "Floors");
await pg.click('button[type="submit"]'); await settle(700); check("inline errors", (await pg.$$('[role="alert"]')).length > 4);
for (const [k, v] of [["fullName", "Browser Booker"], ["email", "bb@example.com"], ["phone", "5705550199"], ["address", "22 Oak Street"], ["city", "Scranton"], ["zip", "18503"], ["description", "New flooring in the kitchen"]]) await pg.type(`form [name="${k}"]`, v);
await pg.select('[name="contactMethod"]', "Email"); await pg.select('[name="preferredTime"]', "Morning");
await pg.$eval('[name="preferredDate"]', (e, v) => { Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set.call(e, v); e.dispatchEvent(new Event("input", { bubbles: true })); e.dispatchEvent(new Event("change", { bubbles: true })); }, day(10));
await pg.click('[name="consent"]'); await pg.click('button[type="submit"]'); await pg.waitForFunction(() => /EJ-[A-Z2-9]{8}/.test(document.body.innerText), { timeout: 8000 }).catch(() => {});
check("browser booking", /EJ-[A-Z2-9]{8}/.test(await pg.evaluate(() => document.body.innerText))); check("says unconfirmed", (await pg.evaluate(() => document.body.innerText)).includes("not confirmed yet"));
const publicErrs = [...errs]; check("no console errors (public)", !publicErrs.length, publicErrs.slice(0, 5).join("\n"));
// admin in the browser
errs.length = 0; await go("/admin/login"); await pg.type('[name="email"]', "admin@example.com"); await pg.type('[name="password"]', "local-demo-password"); await Promise.all([pg.waitForFunction(() => location.pathname === "/admin/dashboard"), pg.click('button:not([type="button"])')]); await settle(1500);
for (const s of ["dashboard", "bookings", "availability", "inquiries", "payments", "testimonials", "homepage", "services", "gallery", "faqs", "settings", "account"]) for (const w of [1280, 375]) { await pg.setViewport({ width: w, height: 850 }); await go("/admin/" + s); await pg.waitForFunction(() => !document.querySelector('[aria-label="Loading"]'), { timeout: 8000 }).catch(() => {}); await settle(500); check(`admin ${s} ${w}`, await pg.evaluate(() => !document.querySelector('[aria-label="Loading"]') && document.documentElement.scrollWidth <= document.documentElement.clientWidth)); if (["dashboard", "bookings", "homepage"].includes(s)) await pg.screenshot({ path: path.join(SHOTS, `admin-${s}-${w}.png`) }); }
await pg.setViewport({ width: 1280, height: 900 }); await go("/admin/gallery"); await settle(1000); await (await btnText("Add gallery entry")).click(); await settle(400);
const big = path.join(SHOTS, "big.jpg"); await sharp(Buffer.from(Array.from({ length: 3000 * 2400 * 3 }, () => (Math.random() * 256) | 0)), { raw: { width: 3000, height: 2400, channels: 3 } }).jpeg({ quality: 62 }).toFile(big); const bigSize = fs.statSync(big).size;
await (await pg.$('input[aria-label="Image file"]')).uploadFile(big); await pg.waitForSelector('[role="dialog"] img[src^="/api/uploads/gallery/"]', { timeout: 20000 }).catch(() => {}); check(`client compression (${(bigSize / 1e6).toFixed(1)}MB)`, await pg.$('[role="dialog"] img[src^="/api/uploads/gallery/"]')); await pg.screenshot({ path: path.join(SHOTS, "admin-upload.png") });
check("no console errors (admin)", !errs.length, errs.slice(0, 5).join("\n"));
await b.close();
const lo = await call("/api/auth/logout", { method: "POST" }); check("logout", lo.status === 200 && (await call("/api/admin/stats")).status === 401);
console.log(`${pass} passed, ${fail} failed. Screenshots: ${SHOTS}`);
process.exit(fail ? 1 : 0);
