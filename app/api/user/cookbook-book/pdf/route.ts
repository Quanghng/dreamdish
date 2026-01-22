import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { aiRateLimiter } from '@/lib/utils';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type PdfBookEntry = {
  id: string;
  createdAt: string;
  imageUrl: string;
  category: string | null;
  recipe: {
    title: string;
    description: string;
    prepTime: number;
    cookTime: number;
    servings: number;
    difficulty: string;
    ingredients: Array<{ name: string; quantity: string; unit: string }>;
    instructions: Array<{ stepNumber: number; title: string; instruction: string; tips?: string | null }>;
  };
  ai?: { beautifulDescription?: string; chefTips?: string[] };
};

type PdfBookPayload = {
  bookTitle: string;
  intro: string;
  generatedAt: string;
  entries: PdfBookEntry[];
};

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function safeText(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function clampInt(value: number, fallback: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return fallback;
  return Math.max(min, Math.min(max, Math.trunc(value)));
}

function buildFilenameBase(title: string): string {
  return (title || 'Mon livre')
    .replace(/[\\/:*?"<>|]/g, '-')
    .replace(/\s+/g, ' ')
    .trim();
}

function renderHtml(payload: PdfBookPayload, userLabel: string): string {
  const bookTitle = escapeHtml(payload.bookTitle || 'Mon cookbook');
  const intro = escapeHtml(payload.intro || '');
  const generatedAtLabel = (() => {
    const d = new Date(payload.generatedAt || Date.now());
    return escapeHtml(
      d.toLocaleString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      })
    );
  })();

  const author = escapeHtml(userLabel || '');

  const mosaic = payload.entries
    .slice(0, 9)
    .map((e, idx) => {
      const src = escapeHtml(safeText(e?.imageUrl, ''));
      const alt = escapeHtml(safeText(e?.recipe?.title, `Recette ${idx + 1}`));
      if (!src) {
        return `<div class="mosaic-tile mosaic-fallback"></div>`;
      }
      return `
        <div class="mosaic-tile">
          <img src="${src}" alt="${alt}" />
          <div class="mosaic-shade"></div>
        </div>
      `;
    })
    .join('');

  const toc = payload.entries
    .map((e, idx) => {
      const title = escapeHtml(safeText(e?.recipe?.title, 'Recette'));
      const category = escapeHtml(safeText(e?.category ?? '', ''));
      const estimatedPage = 3 + idx;
      return `
        <div class="toc-row">
          <div class="toc-left">
            <div class="toc-title">${idx + 1}. ${title}</div>
            ${category ? `<div class="toc-meta">${category}</div>` : ''}
          </div>
          <div class="toc-page">${estimatedPage}</div>
        </div>
      `;
    })
    .join('');

  const recipes = payload.entries
    .map((e) => {
      const title = escapeHtml(safeText(e?.recipe?.title, 'Recette'));
      const category = escapeHtml(safeText(e?.category ?? '', 'Sans catégorie'));
      const beautiful = escapeHtml(safeText(e?.ai?.beautifulDescription, safeText(e?.recipe?.description, '')));
      const servings = clampInt(Number((e?.recipe as any)?.servings), 2, 1, 20);
      const prep = clampInt(Number((e?.recipe as any)?.prepTime), 0, 0, 999);
      const cook = clampInt(Number((e?.recipe as any)?.cookTime), 0, 0, 999);
      const difficulty = escapeHtml(safeText((e?.recipe as any)?.difficulty, ''));
      const createdAtLabel = (() => {
        const d = new Date(e.createdAt || Date.now());
        return escapeHtml(
          d.toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: '2-digit',
          })
        );
      })();

      const ingredients = Array.isArray(e?.recipe?.ingredients)
        ? e.recipe.ingredients
            .filter((i) => i && typeof i.name === 'string' && i.name.trim())
            .map((i) => {
              const name = escapeHtml(i.name);
              const qty = escapeHtml(safeText(i.quantity, ''));
              const unit = escapeHtml(safeText(i.unit, ''));
              const right = `${qty}${qty && unit ? ' ' : ''}${unit}`.trim();
              return `<div class="ing-row"><div class="ing-name">${name}</div><div class="ing-qty">${right}</div></div>`;
            })
            .join('')
        : '';

      const tips = Array.isArray(e?.ai?.chefTips)
        ? e.ai!.chefTips
            .filter((t) => typeof t === 'string' && t.trim())
            .slice(0, 6)
            .map((t) => `<li>${escapeHtml(t.trim())}</li>`)
            .join('')
        : '';

      const instructions = Array.isArray(e?.recipe?.instructions)
        ? e.recipe.instructions
            .filter((s) => s && typeof s.stepNumber === 'number')
            .map((s) => {
              const n = clampInt(s.stepNumber, 1, 1, 99);
              const st = escapeHtml(safeText(s.title, ''));
              const ins = escapeHtml(safeText(s.instruction, ''));
              const tip = escapeHtml(safeText(s.tips ?? '', ''));
              return `
                <div class="step">
                  <div class="step-title">${n}. ${st}</div>
                  <div class="step-body">${ins}</div>
                  ${tip ? `<div class="step-tip">Astuce: ${tip}</div>` : ''}
                </div>
              `;
            })
            .join('')
        : '';

      const imageUrl = escapeHtml(safeText(e.imageUrl, ''));

      return `
        <section class="page break">
          <div class="page-inner">
          <div class="sheet">
            <div class="recipe-header">
              <div>
                <div class="kicker">RECETTE</div>
                <h2 class="h2">${title}</h2>
                <div class="meta">${category} • ${createdAtLabel}</div>
                <div class="pills">
                  <span class="pill">${servings} portion(s)</span>
                  <span class="pill">${prep} min prep</span>
                  <span class="pill">${cook} min cuisson</span>
                  ${difficulty ? `<span class="pill">${difficulty}</span>` : ''}
                </div>
              </div>
              ${imageUrl ? `<img class="hero" src="${imageUrl}" alt="${title}" />` : ''}
            </div>

            <p class="lead">${beautiful}</p>

            <div class="grid">
              <div class="card">
                <div class="card-title">Ingrédients</div>
                <div class="ing">${ingredients || '<div class="muted">(non renseigné)</div>'}</div>
              </div>
              <div class="card">
                <div class="card-title">Astuces</div>
                ${tips ? `<ul class="tips">${tips}</ul>` : '<div class="muted">Aucune astuce générée.</div>'}
              </div>
            </div>

            <div class="card card-wide">
              <div class="card-title">Instructions</div>
              <div class="steps">${instructions || '<div class="muted">(non renseigné)</div>'}</div>
            </div>
          </div>
          </div>
        </section>
      `;
    })
    .join('');

  return `
<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${bookTitle}</title>
  <style>
    :root {
      --ink: #17120d;
      --muted: #6b5a4a;
      --paper: #ffffff;
      --line: #f1e3d2;
      --accent: #ff6a00;
      --accent2: #b45309;
      --gold: #ffb703;
      --wash: #fff1e6;
    }

    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji";
      color: var(--ink);
      background: linear-gradient(180deg, #fff0e3 0%, #ffffff 45%, #fff7f0 100%);
    }

    .page {
      padding: 6mm 0;
    }

    .page-inner {
      width: 100%;
      max-width: 186mm;
      margin: 0 auto;
    }

    .break {
      page-break-before: always;
      break-before: page;
    }

    h1, h2, h3 { margin: 0; break-after: avoid; page-break-after: avoid; }
    p { orphans: 3; widows: 3; }

    .cover {
      min-height: 232mm;
      border: 1px solid var(--line);
      border-radius: 18px;
      background:
        radial-gradient(820px 520px at 0% 0%, rgba(255, 106, 0, 0.28), transparent),
        radial-gradient(820px 520px at 100% 100%, rgba(180, 83, 9, 0.20), transparent),
        linear-gradient(135deg, #fff1e6, #ffffff);
      padding: 12mm 12mm;
    }

    .brand {
      letter-spacing: 0.22em;
      font-weight: 800;
      font-size: 11px;
      color: var(--muted);
    }

    .brand-dot {
      display: inline-block;
      width: 7px;
      height: 7px;
      border-radius: 999px;
      margin-left: 8px;
      background: linear-gradient(90deg, var(--accent), var(--accent2));
      vertical-align: middle;
    }

    .cover-title {
      margin-top: 10px;
      font-size: 52px;
      line-height: 1.02;
      letter-spacing: -0.02em;
      font-weight: 900;
    }

    .cover-subtitle {
      margin-top: 8px;
      font-size: 14px;
      letter-spacing: 0.14em;
      font-weight: 800;
      color: var(--muted);
      text-transform: uppercase;
    }

    .slogan {
      margin-top: 10px;
      font-size: 16px;
      color: var(--muted);
    }

    .rule {
      margin-top: 18px;
      height: 1px;
      background: linear-gradient(90deg, var(--accent), var(--gold), var(--accent2));
    }

    .cover-grid {
      margin-top: 18px;
      display: grid;
      grid-template-columns: 1fr 1.1fr;
      gap: 14px;
    }

    .mosaic {
      border: 1px solid var(--line);
      border-radius: 16px;
      overflow: hidden;
      background: rgba(255,255,255,0.85);
      padding: 8px;
    }

    .mosaic-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
    }

    .mosaic-tile {
      position: relative;
      border-radius: 12px;
      overflow: hidden;
      border: 1px solid var(--line);
      height: 102px;
      background: #fff;
    }

    .mosaic-tile img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    .mosaic-shade {
      position: absolute;
      inset: 0;
      background: linear-gradient(180deg, transparent, rgba(0,0,0,0.28));
    }

    .mosaic-fallback {
      background: linear-gradient(135deg, rgba(255, 106, 0, 0.16), rgba(180, 83, 9, 0.12));
    }

    .panel {
      border: 1px solid var(--line);
      border-radius: 16px;
      background: rgba(255,255,255,0.85);
      padding: 14px 16px;
      break-inside: avoid;
      page-break-inside: avoid;
    }

    .panel-kicker {
      font-size: 11px;
      letter-spacing: 0.18em;
      font-weight: 800;
      color: var(--accent2);
      break-after: avoid;
      page-break-after: avoid;
    }

    .panel-title {
      margin-top: 8px;
      font-size: 28px;
      font-weight: 900;
    }

    .panel-meta {
      margin-top: 8px;
      font-size: 12px;
      color: var(--muted);
      font-weight: 600;
    }

    .intro {
      margin-top: 10px;
      font-size: 14px;
      line-height: 1.55;
      color: var(--ink);
      white-space: pre-wrap;
    }

    .toc {
      border: 1px solid var(--line);
      border-radius: 18px;
      padding: 18px 18px 6px;
      background: rgba(255,255,255,0.78);
      break-inside: avoid;
      page-break-inside: avoid;
    }

    .toc .kicker {
      font-size: 11px;
      letter-spacing: 0.18em;
      font-weight: 900;
      color: var(--accent2);
      break-after: avoid;
      page-break-after: avoid;
    }
    .sheet {
      border: 1px solid var(--line);
      border-radius: 18px;
      background:
        linear-gradient(90deg, rgba(255, 106, 0, 0.16) 0%, rgba(255, 255, 255, 0.0) 14%, rgba(255, 255, 255, 0.0) 86%, rgba(180, 83, 9, 0.14) 100%),
        linear-gradient(135deg, rgba(255, 241, 230, 0.78), rgba(255,255,255,0.92));
      padding: 14px 14px 16px;
      box-shadow: 0 10px 24px rgba(0,0,0,0.06);
      break-inside: avoid;
      page-break-inside: avoid;
    }

    .preface {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 14px;
      margin-bottom: 14px;
      break-inside: avoid;
      page-break-inside: avoid;
    }

    .preface .panel {
      background: rgba(255,255,255,0.82);
    }

    .h2 {
      margin-top: 6px;
      font-size: 30px;
      font-weight: 900;
      letter-spacing: -0.02em;
      break-after: avoid;
      page-break-after: avoid;
    }

    .toc-rule {
      margin-top: 12px;
      height: 1px;
      background: var(--line);
    }

    .toc-row {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 18px;
      padding: 10px 2px;
      border-bottom: 1px dashed #f3e8d8;
      break-inside: avoid;
      page-break-inside: avoid;
    }

    .toc-title { font-weight: 800; font-size: 13px; }
    .toc-meta { margin-top: 3px; font-size: 11px; color: var(--muted); }
    .toc-page { font-weight: 800; color: var(--muted); }

    .recipe-header {
      display: grid;
      grid-template-columns: 1fr 160px;
      gap: 16px;
      align-items: start;
      break-inside: avoid;
      page-break-inside: avoid;
    }

    .kicker {
      font-size: 11px;
      letter-spacing: 0.18em;
      font-weight: 900;
      color: var(--accent2);
      break-after: avoid;
      page-break-after: avoid;
    }

    .meta {
      margin-top: 6px;
      font-size: 12px;
      color: var(--muted);
      font-weight: 600;
    }

    .pills { margin-top: 10px; display: flex; flex-wrap: wrap; gap: 8px; }
    .pill {
      display: inline-block;
      padding: 6px 10px;
      border-radius: 999px;
      border: 1px solid var(--line);
      background: rgba(255,255,255,0.92);
      font-size: 11px;
      font-weight: 700;
      color: var(--ink);
    }

    .hero {
      width: 160px;
      height: 160px;
      object-fit: cover;
      border-radius: 16px;
      border: 1px solid var(--line);
    }

    .lead {
      margin: 14px 0 0;
      font-size: 14px;
      line-height: 1.6;
      color: var(--ink);
    }

    .grid {
      margin-top: 14px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 14px;
      break-inside: avoid;
      page-break-inside: avoid;
    }

    .card {
      border: 1px solid var(--line);
      border-radius: 16px;
      background: linear-gradient(180deg, rgba(255, 244, 236, 0.75), rgba(255,255,255,0.92));
      padding: 12px 14px;
      break-inside: avoid;
      page-break-inside: avoid;
    }

    .card-wide { margin-top: 14px; break-inside: avoid; page-break-inside: avoid; }

    .card-title {
      font-size: 12px;
      letter-spacing: 0.16em;
      font-weight: 900;
      color: var(--ink);
      break-after: avoid;
      page-break-after: avoid;
    }

    .ing { margin-top: 10px; }
    .ing-row { display: flex; justify-content: space-between; gap: 10px; padding: 6px 0; border-bottom: 1px solid #f7efe5; break-inside: avoid; page-break-inside: avoid; }
    .ing-row:last-child { border-bottom: none; }
    .ing-name { font-size: 12px; font-weight: 600; }
    .ing-qty { font-size: 12px; font-weight: 700; color: var(--muted); white-space: nowrap; }

    .tips { margin: 10px 0 0; padding-left: 18px; }
    .tips li { margin: 6px 0; font-size: 12px; break-inside: avoid; page-break-inside: avoid; }

    .steps { margin-top: 10px; }
    .step { border: 1px solid #f2e6d6; border-radius: 14px; background: #fff; padding: 10px 12px; margin-bottom: 10px; break-inside: avoid; page-break-inside: avoid; }
    .step-title { font-weight: 900; font-size: 12px; }
    .step-body { margin-top: 6px; font-size: 12px; line-height: 1.55; white-space: pre-wrap; }
    .step-tip { margin-top: 6px; font-size: 11px; color: var(--muted); font-weight: 700; }

    .muted { color: var(--muted); font-size: 12px; }

    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body>
  <section class="page">
    <div class="page-inner">
    <div class="cover">
      <div class="brand">DREAMDISH<span class="brand-dot"></span></div>
      <h1 class="cover-title">Mon Cookbook</h1>
      <div class="cover-subtitle">Luxury edition</div>
      <div class="slogan">Des recettes qui font rêver, des saveurs qui rassemblent.</div>
      <div class="rule"></div>

      <div class="cover-grid">
        <div class="panel">
          <div class="panel-kicker">TITRE</div>
          <div class="panel-title">${bookTitle}</div>
          ${author ? `<div class="panel-meta">Par ${author}</div>` : ''}
          <div class="panel-meta">Généré le ${generatedAtLabel}</div>
          <div class="panel" style="margin-top: 12px; border-style: dashed; background: rgba(255,255,255,0.75);">
            <div class="panel-kicker">APERÇU</div>
            <div class="intro">Photos + descriptions + astuces — sélection de recettes.</div>
          </div>
        </div>
        <div class="mosaic">
          <div class="panel-kicker" style="margin: 6px 6px 10px;">SÉLECTION</div>
          <div class="mosaic-grid">${mosaic}</div>
        </div>
      </div>
    </div>
    </div>
  </section>

  <section class="page break">
    <div class="page-inner">
    <div class="sheet">
      <div class="preface">
        <div class="panel">
          <div class="panel-kicker">PRÉFACE</div>
          <div class="intro">${intro}</div>
        </div>
        <div class="panel">
          <div class="panel-kicker">AUTEUR</div>
          <div class="panel-title" style="font-size: 22px;">${author || '—'}</div>
          <div class="panel-meta">Édition DreamDish • ${generatedAtLabel}</div>
          <div class="panel" style="margin-top: 10px; border-color: rgba(255, 106, 0, 0.38); background: rgba(255,255,255,0.75);">
            <div class="panel-kicker">SIGNATURE</div>
            <div class="intro">Une édition colorée, élégante et personnelle.</div>
          </div>
        </div>
      </div>
      <div class="toc">
        <div class="kicker">TABLE DES MATIÈRES</div>
        <h2 class="h2">Recettes</h2>
        <div class="toc-rule"></div>
        ${toc}
      </div>
    </div>
    </div>
  </section>

  ${recipes}
</body>
</html>
  `.trim();
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
  }

  const clientIp = request.headers.get('x-forwarded-for') || 'anonymous';
  const rateLimitResult = aiRateLimiter.check(`cookbook-book-pdf:${session.user.id}:${clientIp}`);
  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      {
        error: 'Trop de requêtes. Veuillez patienter.',
        retryAfter: Math.ceil((rateLimitResult.resetAt - Date.now()) / 1000),
      },
      { status: 429 }
    );
  }

  const body = (await request.json().catch(() => null)) as PdfBookPayload | null;
  if (!body || typeof body.bookTitle !== 'string' || typeof body.intro !== 'string' || typeof body.generatedAt !== 'string' || !Array.isArray(body.entries)) {
    return NextResponse.json({ error: 'Format de livre invalide.' }, { status: 400 });
  }

  // Hard safety limits
  const entries = body.entries.slice(0, 12);
  const payload: PdfBookPayload = {
    bookTitle: body.bookTitle.slice(0, 140),
    intro: body.intro.slice(0, 4000),
    generatedAt: body.generatedAt,
    entries,
  };

  const userLabel = (session.user.name || session.user.email || '').trim();

  let chromium: any;
  try {
    ({ chromium } = await import('playwright'));
  } catch {
    return NextResponse.json(
      { error: 'Génération PDF indisponible (Playwright non installé sur le serveur).' },
      { status: 501 }
    );
  }

  const html = renderHtml(payload, userLabel);

  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 794, height: 1123 } });
    await page.setContent(html, { waitUntil: 'networkidle' });

    const safeTitle = buildFilenameBase(payload.bookTitle);

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      displayHeaderFooter: true,
      margin: { top: '16mm', bottom: '16mm', left: '12mm', right: '12mm' },
      headerTemplate: `
        <div style="width:100%; padding:0 12mm; font-size:9px; font-family: ui-sans-serif, system-ui; color:#6b5a4a;">
          <div style="height:2px; background:linear-gradient(90deg,#ff7a00,#00b894,#ff3d7f); border-radius:999px; margin-bottom:4px;"></div>
          <span style="font-weight:800; letter-spacing:.18em; color:#7c2d12;">DREAMDISH</span>
          <span style="margin-left:10px; font-weight:700; color:#17120d;">${escapeHtml(payload.bookTitle || 'Mon cookbook')}</span>
        </div>
      `,
      footerTemplate: `
        <div style="width:100%; padding:0 12mm; font-size:9px; font-family: ui-sans-serif, system-ui; color:#6b5a4a; display:flex; justify-content:space-between; align-items:flex-end;">
          <span style="font-weight:700; color:#7c2d12;">${escapeHtml(userLabel || '')}</span>
          <span style="font-weight:800; color:#17120d;"><span class="pageNumber"></span> / <span class="totalPages"></span></span>
        </div>
      `,
    });

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${safeTitle || 'Mon livre'}.pdf"`,
        'Cache-Control': 'no-store',
      },
    });
  } finally {
    await browser.close();
  }
}
