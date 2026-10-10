import { Resvg } from '@resvg/resvg-js';
import { createHash } from 'node:crypto';
import type { Config } from './config';
import type { Theme } from './theme';
import { escapeXml } from './favicon.ts';
import { sharingFonts } from './og-fonts.ts';

export const sharingSize = { width: 1200, height: 630, margin: 72 };
const root = '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">';
const segmenter = new Intl.Segmenter('und', { granularity: 'grapheme' });
const graphemes = (value: string) => [...segmenter.segment(value)].map(part => part.segment);
type Bounds = { x: number; y: number; width: number; height: number };

export function sharingImageUrl(url: string, png: Uint8Array): string {
  return new URL(`og/${sharingImageHash(png)}.png`, url).href;
}

export const sharingImageHash = (png: Uint8Array) => createHash('sha256').update(png).digest('hex').slice(0, 16);

export function sharingImageAlt(profile: Config['profile'], limit = Infinity): string {
  const value = `Links page for ${[`@${profile.username}`, profile.fullName, profile.title].filter(Boolean).join('; ')}.`;
  if (value.length <= limit) return value;
  let shortened = '';
  for (const { segment } of segmenter.segment(value)) {
    if (shortened.length + segment.length + 1 > limit) break;
    shortened += segment;
  }
  return shortened.trimEnd() + '…';
}

export function createSharingImage(profile: Config['profile'], theme: Theme, mode: Config['site']['mode'] = 'light') {
  const colors = theme[mode];
  const fonts = sharingFonts(theme);
  const options = { font: { fontFiles: fonts.files, loadSystemFonts: false, defaultFontFamily: fonts.heading } };
  const warnings = new Set<string>();
  const visible = (value: string) => graphemes(value.normalize('NFC')).map(part => {
    // Preserve shaping controls and variation selectors, but don't allow XML
    // control characters or bidi overrides to reorder the profile hierarchy.
    const clean = part.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f\u202a-\u202e\u2066-\u2069]/gu, '');
    if ([...clean].some(char => !/[\s\p{Default_Ignorable_Code_Point}]/u.test(char) && !fonts.covers(char.codePointAt(0)!))) {
      warnings.add('Some characters are not covered by the local theme/fallback fonts; unsupported graphemes use �. Supply a local font with the required script coverage.');
      return '�';
    }
    if (measure(clean, fonts.heading, 48, 700).height > sharingSize.height - 2 * sharingSize.margin) {
      warnings.add('An unusually tall grapheme exceeded the safe area and uses �.');
      return '�';
    }
    return clean;
  }).join('').trim();
  const text = (value: string, family: string, size: number, weight: number, x = 0, y = 0, color = colors.text) =>
    `<text x="${x}" y="${y}" font-family="${escapeXml(family)}, OG Sans, OG Humanist" font-size="${size}" font-weight="${weight}" fill="${color}">${escapeXml(value)}</text>`;
  const measurements = new Map<string, Bounds>();
  const measure = (value: string, family: string, size: number, weight: number): Bounds => {
    const key = JSON.stringify([value, family, weight]);
    let box = measurements.get(key);
    if (!box) {
      const bounds = new Resvg(`${root}${text(value, family, 100, weight)}</svg>`, options).getBBox();
      box = bounds ? { x: bounds.x, y: bounds.y, width: bounds.width, height: bounds.height } : { x: 0, y: 0, width: 0, height: 0 };
      measurements.set(key, box);
    }
    return { x: box.x * size / 100, y: box.y * size / 100, width: box.width * size / 100, height: box.height * size / 100 };
  };
  const copyWidth = sharingSize.width - sharingSize.margin * 2;
  const context = { value: 'Links', family: fonts.body, size: 36, weight: 400, color: colors.accent };
  const contextInk = measure(context.value, context.family, context.size, context.weight);
  const contextGap = 32;
  const maxHeight = sharingSize.height - sharingSize.margin * 2 - contextInk.height - contextGap;
  const specs = [
    { value: visible(`@${profile.username}`), family: fonts.heading, weight: 700, maximum: 168, minimum: 64, color: colors.text, gap: 0 },
    ...(profile.fullName?.trim() ? [{ value: visible(profile.fullName), family: fonts.body, weight: 400, maximum: 48, minimum: 36, color: colors.text, gap: 28 }] : []),
    ...(profile.title?.trim() ? [{ value: visible(profile.title), family: fonts.body, weight: 400, maximum: 36, minimum: 30, color: colors.muted, gap: 18 }] : []),
  ].filter(spec => {
    if (measure(spec.value, spec.family, spec.maximum, spec.weight).width) return true;
    warnings.add('An optional Open Graph field had no visible glyphs and was omitted.');
    return false;
  });
  // Enlarge sparse profiles. Prefer a single line when it fits above the font
  // floor; longer handles wrap instead of becoming tiny or horizontally scaled.
  const handle = specs[0];
  const singleLineSize = copyWidth * 100 / measure(handle.value, handle.family, 100, handle.weight).width;
  const maximum = specs.length === 1 ? 224 : 168;
  handle.maximum = singleLineSize >= handle.minimum ? Math.min(maximum, singleLineSize) : maximum;
  const wrap = (value: string, family: string, size: number, weight: number) => {
    const lines: string[] = [];
    let omitted = false;
    const limit = Math.ceil(maxHeight / size) + 1;
    for (const paragraph of value.split(/\r?\n/u)) {
      let line = '';
      for (const word of paragraph.split(/\s+/u).filter(Boolean)) {
        const candidate = line ? `${line} ${word}` : word;
        if (measure(candidate, family, size, weight).width <= copyWidth) { line = candidate; continue; }
        if (line) { lines.push(line); line = ''; }
        // Move intact words to the next line before considering emergency breaks.
        if (measure(word, family, size, weight).width <= copyWidth) line = word;
        else for (const unit of word.match(/[^._-]+[._-]*|[._-]+/gu) || [word]) {
          // Prefer handle separators to arbitrary mid-word breaks.
          if (measure(unit, family, size, weight).width <= copyWidth) {
            if (line && measure(line + unit, family, size, weight).width > copyWidth) { lines.push(line); line = ''; }
            line += unit;
          } else for (const { segment } of segmenter.segment(unit)) {
            if (line && measure(line + segment, family, size, weight).width > copyWidth) { lines.push(line); line = ''; }
            // Even a single pathological combining cluster can exceed the card.
            if (measure(segment, family, size, weight).width > copyWidth) {
              line += '�';
              warnings.add('An unusually wide grapheme exceeded the safe area and uses �.');
            } else line += segment;
            if (lines.length >= limit) { omitted = true; break; }
          }
          if (lines.length >= limit) { omitted = true; break; }
        }
        if (lines.length >= limit) { omitted = true; break; }
      }
      if (line || !paragraph.trim()) lines.push(line);
      if (omitted) break;
    }
    return { lines, omitted };
  };
  // Avoid a short orphan line when a long handle can fit on two readable lines.
  // Handles beyond that capacity still get as many lines as the stack permits.
  if (singleLineSize < handle.minimum && wrap(handle.value, handle.family, handle.minimum, handle.weight).lines.length <= 2) {
    let low = handle.minimum, high = handle.maximum;
    for (let i = 0; i < 7; i++) {
      const size = (low + high) / 2;
      if (wrap(handle.value, handle.family, size, handle.weight).lines.length <= 2) low = size;
      else high = size;
    }
    handle.maximum = low;
  }
  const makeBlock = (spec: typeof specs[number], progress: number, index: number) => {
    const size = spec.maximum - (spec.maximum - spec.minimum) * progress;
    const wrapped = wrap(spec.value, spec.family, size, spec.weight);
    return { ...spec, ...wrapped, size, gap: index ? spec.gap : 0 };
  };
  type Block = ReturnType<typeof makeBlock>;
  const metrics = (block: Block) => {
    const bounds = block.lines.map(line => measure(line, block.family, block.size, block.weight));
    const top = Math.min(...bounds.map(box => box.y));
    const bottom = Math.max(...bounds.map(box => box.y + box.height));
    const leading = Math.max(block.size * 1.25, bottom - top + block.size * .12);
    return { bounds, top, leading, width: Math.max(...bounds.map(box => box.width)), height: (bounds.length - 1) * leading + bottom - top };
  };
  const height = (blocks: Block[]) => blocks.reduce((sum, block) => sum + metrics(block).height + block.gap, 0);
  let blocks = specs.map((spec, index) => makeBlock(spec, 0, index));
  // Fit the complete stack, rather than independently fitting three fixed boxes.
  // Keep readable floors and preserve hierarchy at every step.
  if (height(blocks) > maxHeight || blocks.some(block => block.omitted)) {
    let low = 0, high = 1;
    for (let i = 0; i < 7; i++) {
      const progress = (low + high) / 2;
      const candidate = specs.map((spec, index) => makeBlock(spec, progress, index));
      if (height(candidate) > maxHeight || candidate.some(block => block.omitted)) low = progress;
      else high = progress;
    }
    blocks = specs.map((spec, index) => makeBlock(spec, high, index));
  }
  // A finite card cannot show unlimited input at a readable size. Ellipsis is
  // only the last resort, after natural wrapping and responsive sizing.
  while (height(blocks) > maxHeight) {
    const block = [...blocks].reverse().find(block => block.lines.length > 1);
    if (!block) throw new Error('Open Graph text cannot fit within the safe area.');
    block.lines.pop();
    block.omitted = true;
  }
  const ellipsize = (block: Block) => {
    const last = graphemes(block.lines.at(-1)!);
    while (last.length && measure(last.join('').trimEnd() + '…', block.family, block.size, block.weight).width > copyWidth) last.pop();
    block.lines[block.lines.length - 1] = last.join('').trimEnd() + '…';
    warnings.add('Open Graph text exceeded the safe area at readable font sizes; the image uses an ellipsis. Full profile text remains in the page and metadata.');
  };
  for (const block of blocks.filter(block => block.omitted)) ellipsize(block);
  // Ellipsis can change the vertical ink envelope of punctuation-only lines.
  while (height(blocks) > maxHeight) {
    const block = [...blocks].reverse().find(block => block.lines.length > 1);
    if (!block) throw new Error('Open Graph text cannot fit within the safe area.');
    block.lines.pop();
    block.omitted = true;
    ellipsize(block);
  }
  const measured = blocks.map(metrics);
  const copyHeight = height(blocks);
  const copyX = sharingSize.margin;
  const totalHeight = contextInk.height + contextGap + copyHeight;
  // Anchor the composition to the safe grid and align visible glyph edges.
  // A small upward adjustment gives display type an optical vertical center.
  const centerY = sharingSize.height / 2 - Math.min(6, (maxHeight - copyHeight) / 2);
  const contextY = centerY - totalHeight / 2;
  let y = contextY + contextInk.height + contextGap;
  const lineBounds: Bounds[] = [{ x: copyX, y: contextY, width: contextInk.width, height: contextInk.height }];
  const cue = text(context.value, context.family, context.size, context.weight, copyX - contextInk.x, contextY - contextInk.y, context.color);
  const copy = blocks.map((block, i) => {
    const metric = measured[i];
    y += block.gap;
    const markup = block.lines.map((line, j) => {
      const bounds = metric.bounds[j];
      const baseline = y - metric.top + j * metric.leading;
      lineBounds.push({ x: copyX, y: baseline + bounds.y, width: bounds.width, height: bounds.height });
      return text(line, block.family, block.size, block.weight, copyX - bounds.x, baseline, block.color);
    }).join('');
    y += metric.height;
    return markup;
  }).join('');
  const svg = `${root}<rect width="1200" height="630" fill="${colors.background}"/>${cue}${copy}</svg>`;
  return { svg, options, blocks, lineBounds, warnings: [...warnings] };
}
