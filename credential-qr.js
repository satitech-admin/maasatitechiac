const origin = 'https://maasatitechiac.vercel.app';

export function verificationUrl(page, code) {
  const url = new URL(page, origin);
  url.searchParams.set('code', code);
  return url.href;
}

export async function verificationQR(url) {
  const {toDataURL} = await import('https://esm.sh/qrcode@1.5.4');
  return toDataURL(url, {width: 256, margin: 4, errorCorrectionLevel: 'M',
    color: {dark: '#081c39', light: '#ffffff'}});
}
