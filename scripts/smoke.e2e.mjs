/**
 * Interaction smoke test for the landing page and the dashboard.
 * Stubs the API, then drives the real UI and asserts on what renders.
 *
 * Usage:
 *   npm i -D playwright && npx playwright install chromium
 *   npm run build && npx vite preview --port 4173 --host 127.0.0.1
 *   node scripts/smoke.e2e.mjs
 */
import { chromium } from 'playwright';

const PLANS = [
  { id: 'basic', name: 'Package 1', monthlyPrice: 9, annualPrice: 105, annualDiscount: 3, popular: false,
    features: ['Up to 100 menu items'], maxMenuItems: 100, allowedTemplates: ['bistro'] },
  { id: 'pro', name: 'Package 2', monthlyPrice: 17, annualPrice: 199, annualDiscount: 3, popular: true,
    features: ['Up to 200 menu items'], maxMenuItems: 200, allowedTemplates: ['bistro', 'fresh', 'vibrant'] },
  { id: 'premium', name: 'Package 3', monthlyPrice: 24, annualPrice: 259, annualDiscount: 10, popular: false,
    features: ['Unlimited menu items'], maxMenuItems: null, allowedTemplates: ['bistro', 'fresh', 'vibrant', 'luxury', 'nakhil'] },
];

const USER = {
  id: 'u1', email: 'y@a.com', name: 'Yusef', country: 'TR', phone: '+90', role: 'USER', status: 'ACTIVE',
  authProvider: 'LOCAL', joinDate: '2026-06-08T00:00:00Z', slug: 'asnaf', plan: 'pro', billingCycle: 'MONTHLY',
  subscription: { status: 'ACTIVE', planId: 'pro', billingCycle: 'MONTHLY', trialEndsAt: null, currentPeriodEnd: '2026-08-08T00:00:00Z' },
};

const CATEGORIES = [
  { id: 'c1', name: 'شاورما', icon: 'Sandwich', nameTranslations: { ar: 'شاورما', en: 'Shawarma', tr: 'Savarma' },
    items: [{ id: 'i1', name: 'شاورما عربي', description: 'لحم', price: 230, imageUrl: '', extras: [],
      nameTranslations: { ar: 'شاورما عربي', en: 'Arabic Shawarma', tr: 'Arap' }, descriptionTranslations: { ar: 'لحم', en: 'Beef', tr: 'Et' } }] },
  { id: 'c2', name: 'المشروبات', icon: 'CupSoda', nameTranslations: { ar: 'المشروبات', en: 'Drinks', tr: 'Icecek' },
    items: [{ id: 'i2', name: 'لاتيه', description: 'قهوة', price: 45, imageUrl: '', extras: [],
      nameTranslations: { ar: 'لاتيه', en: 'Latte', tr: 'Latte' }, descriptionTranslations: { ar: 'قهوة', en: 'Coffee', tr: 'Kahve' } }] },
];

const RESTAURANT = {
  info: { id: 'r1', slug: 'asnaf', name: 'مطعم أصناف', description: 'وصف', nameTranslations: { ar: 'مطعم أصناف', en: 'Asnaf', tr: 'Asnaf' },
    descriptionTranslations: { ar: 'وصف', en: 'd', tr: 'd' }, logo: '', logoWidth: 120, coverImage: '', country: 'TR',
    currency: 'TRY', phone: '+90', whatsapp: '+905551112233', email: 'a@b.com', address: 'إسطنبول', mapLink: '',
    theme: { primaryColor: '#06b6d4', template: 'bistro' }, socialLinks: {},
    operatingHours: [{ day: 'Monday', open: '11:00', close: '23:00', isClosed: false }] },
  categories: CATEGORIES,
};

const SUB = { status: 'ACTIVE', planId: 'pro', billingCycle: 'MONTHLY', trialEndsAt: null,
  currentPeriodEnd: '2026-08-08T00:00:00Z', stripeCustomerId: 'cus_1' };

const routes = [
  [/\/api\/auth\/me/, USER], [/\/api\/plans/, PLANS], [/\/api\/restaurants\/me/, RESTAURANT],
  [/\/api\/subscriptions\/me/, SUB], [/\/api\/menus\/categories/, CATEGORIES],
];

const results = [];
const check = (name, ok, detail = '') => {
  results.push({ name, ok, detail });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? '  — ' + detail : ''}`);
};

const browser = await chromium.launch();

async function newPage({ auth = true, width = 1440, height = 950 } = {}) {
  const ctx = await browser.newContext({ viewport: { width, height } });
  await ctx.route('**/api/**', (route) => {
    const u = route.request().url();
    for (const [re, body] of routes) {
      if (re.test(u)) return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
    }
    return route.fulfill({ status: 404, contentType: 'application/json', body: '{}' });
  });
  await ctx.route('**/images.unsplash.com/**', (r) => r.abort());
  await ctx.route('**/up6.cc/**', (r) => r.abort());
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  // ignore the images this harness deliberately blocks
  const isNoise = (t) => /ERR_TUNNEL_CONNECTION_FAILED|ERR_FAILED|Failed to load resource/.test(t);
  page.on('console', (m) => { if (m.type() === 'error' && !isNoise(m.text())) errors.push(m.text()); });
  if (auth) await page.addInitScript(() => sessionStorage.setItem('asnafi_access_token', 'tok'));
  return { ctx, page, errors };
}

const BASE = 'http://127.0.0.1:4173';

/* ---------------------------- landing page ---------------------------- */
{
  const { ctx, page, errors } = await newPage({ auth: false });
  await page.goto(BASE + '/', { waitUntil: 'networkidle' });

  check('landing: html dir is rtl by default', await page.getAttribute('html', 'dir') === 'rtl');
  check('landing: 5 carousel posters render', await page.locator('.menu-poster').count() === 5);
  check('landing: 3 plans render from the API', await page.locator('.plans article').count() === 3);
  check('landing: popular plan is highlighted', await page.locator('.plans article.chosen').count() === 1);

  const monthly = (await page.locator('.plans article .price').first().innerText()).replace(/\s/g, '');
  await page.locator('.switch button').nth(1).click();
  await page.waitForTimeout(200);
  const yearly = (await page.locator('.plans article .price').first().innerText()).replace(/\s/g, '');
  check('landing: yearly toggle changes the price', monthly !== yearly, `${monthly} -> ${yearly}`);

  // language switch to English flips direction
  await page.locator('.lang').click();
  await page.locator('.langmenu button', { hasText: 'English' }).click();
  await page.waitForTimeout(400);
  check('landing: switching to English flips dir to ltr', await page.getAttribute('html', 'dir') === 'ltr');
  check('landing: copy is translated', (await page.locator('.copy h1').innerText()).includes('digital menu'));

  check('landing: no console/page errors', errors.length === 0, errors.slice(0, 2).join(' | '));
  await ctx.close();
}

/* ------------------------- dashboard navigation ------------------------ */
{
  const { ctx, page, errors } = await newPage();
  await page.goto(BASE + '/dashboard', { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);

  check('dashboard: sidebar shows 8 nav links', await page.locator('aside nav a').count() === 8);
  check('dashboard: menu health computed from real data',
    (await page.locator('text=75%').count()) > 0);
  check('dashboard: item count comes from the API', (await page.locator('text=/^2$/').count()) > 0);

  // navigate through every page and make sure each one renders its heading
  const pages = [
    ['/dashboard/restaurant', 'معلومات المطعم'],
    ['/dashboard/menu', 'إدارة المنيو'],
    ['/dashboard/design', 'إعدادات التصميم'],
    ['/dashboard/analytics', 'التحليلات والإحصائيات'],
    ['/dashboard/share', 'شارك المنيو'],
    ['/dashboard/subscription', 'الاشتراك والفواتير'],
    ['/dashboard/settings', 'الإعدادات'],
  ];
  for (const [path, heading] of pages) {
    await page.goto(BASE + path, { waitUntil: 'networkidle' });
    await page.waitForTimeout(400);
    const ok = await page.locator('h1', { hasText: heading }).count() > 0;
    check(`route ${path} renders`, ok);
  }

  check('dashboard: no console/page errors', errors.length === 0, errors.slice(0, 3).join(' | '));
  await ctx.close();
}

/* ------------------------ menu manager interaction --------------------- */
{
  const { ctx, page, errors } = await newPage();
  await page.goto(BASE + '/dashboard/menu', { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);

  check('menu: both categories render', await page.locator('h1 ~ * , .space-y-3 > div').count() >= 2);

  // search filters
  await page.getByPlaceholder('ابحث في المنيو…').fill('لاتيه');
  await page.waitForTimeout(300);
  const visibleCats = await page.locator('text=المشروبات').count();
  const shawarmaGone = await page.locator('text=شاورما عربي').count();
  check('menu: search filters categories', visibleCats > 0 && shawarmaGone === 0);
  await page.getByPlaceholder('ابحث في المنيو…').fill('');
  await page.waitForTimeout(300);

  // add-category modal opens with the trilingual field
  await page.getByRole('button', { name: /إضافة تصنيف/ }).first().click();
  await page.waitForTimeout(400);
  check('menu: add-category modal opens', await page.getByRole('dialog').count() === 1);
  check('menu: modal has 3 language tabs',
    await page.getByRole('dialog').locator('button', { hasText: /العربية|English|Türkçe/ }).count() >= 3);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
  check('menu: Escape closes the modal', await page.getByRole('dialog').count() === 0);

  // collapse all
  await page.getByRole('button', { name: /طي الكل/ }).click();
  await page.waitForTimeout(300);
  check('menu: collapse-all hides items', await page.locator('text=شاورما عربي').count() === 0);

  check('menu: no console/page errors', errors.length === 0, errors.slice(0, 3).join(' | '));
  await ctx.close();
}

/* ---------------------------- deep links ------------------------------ */
{
  const { ctx, page } = await newPage();
  await page.goto(BASE + '/dashboard/menu?new=category', { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  check('deep link ?new=category opens the modal', await page.getByRole('dialog').count() === 1);
  await ctx.close();
}

await browser.close();

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
if (failed.length) {
  console.log('FAILED:', failed.map((f) => f.name).join(', '));
  process.exit(1);
}
