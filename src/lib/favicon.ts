export const escapeXml = (text: string) => text.replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[character]!));

export function faviconSvg(monogram: string, lightAccent: string, darkAccent = lightAccent, mode?: 'light' | 'dark'): string {
  const color = mode === 'dark' ? darkAccent : lightAccent;
  const appearance = mode ? '' : `<style>@media(prefers-color-scheme:dark){text{fill:${darkAccent}}}</style>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">${appearance}<text x="32" y="46" text-anchor="middle" font-family="Arial, sans-serif" font-size="${[...monogram].length > 2 ? 32 : 40}" font-weight="700" letter-spacing="-3" fill="${color}">${escapeXml(monogram)}</text></svg>`;
}
