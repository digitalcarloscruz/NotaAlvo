import { writeFile } from 'node:fs/promises';
import { createElement as h } from 'react';
import { ImageResponse } from 'next/og.js';

const image = new ImageResponse(
  h('div', { style: { width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: 72, background: '#123e2b', color: '#f6f8ef', fontFamily: 'sans-serif' } },
    h('div', { style: { display: 'flex', alignItems: 'center', gap: 22, fontSize: 48, fontWeight: 700 } },
      h('svg', { width: 64, height: 64, viewBox: '0 0 32 32', fill: 'none' },
        h('circle', { cx: 16, cy: 16, r: 12, stroke: '#d8ef86', strokeWidth: 2 }),
        h('circle', { cx: 16, cy: 16, r: 6, stroke: '#d8ef86', strokeWidth: 2 }),
        h('circle', { cx: 16, cy: 16, r: 2, fill: '#d8ef86' }),
        h('path', { d: 'M19 13 29 3M23 3h6v6', stroke: '#d8ef86', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' })),
      'Nota Alvo'),
    h('div', { style: { display: 'flex', flexDirection: 'column', gap: 20 } },
      h('div', { style: { fontSize: 72, fontWeight: 700, lineHeight: 1.1, maxWidth: 920 } }, 'Seu próximo acerto começa aqui.'),
      h('div', { style: { fontSize: 28, color: '#d8ef86' } }, 'Teste seus conhecimentos. Prepare-se para o ENEM.')),
    h('div', { style: { fontSize: 24, color: '#c2d2c7' } }, 'www.notaalvo.com.br')),
  { width: 1200, height: 630 },
);
await writeFile(new URL('../public/og.png', import.meta.url), Buffer.from(await image.arrayBuffer()));
