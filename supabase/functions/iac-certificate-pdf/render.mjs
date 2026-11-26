import {PDFDocument, rgb} from 'npm:pdf-lib@1.17.1';
import fontkit from 'npm:@pdf-lib/fontkit@1.1.1';
import QRCode from 'npm:qrcode@1.5.4';

const variants = {
  seminar: ['Certificate of Participation', 'Awarded for verified seminar participation in'],
  one_week: ['Bootcamp Completion Certificate', 'Awarded for completing the bootcamp and approved practical project in'],
  course: ['Course Completion Certificate', 'Awarded for completing the course and practical learning requirements in'],
  internship: ['Internship Completion Certificate', 'Awarded for completing the verified internship in'],
  skill: ['Verified Skill Certificate', 'Awarded for passing the skill assessment and completing the approved practical project in'],
  assessment: ['Skill Assessment Certificate', 'Awarded for completing the verified skill assessment in'],
  practical_task: ['Practical Task Certificate', 'Awarded for completing the approved practical task in']
};

const navy = rgb(0.054, 0.127, 0.235);
const gold = rgb(0.54, 0.30, 0.07);
const white = rgb(1, 1, 1);

function wrap(font, text, size, width) {
  const lines = [];
  let line = '';
  for (const word of text.trim().split(/\s+/u)) {
    const next = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(next, size) <= width) {
      line = next;
      continue;
    }
    if (line) lines.push(line);
    line = '';
    for (const character of Array.from(word)) {
      if (line && font.widthOfTextAtSize(line + character, size) > width) {
        lines.push(line);
        line = '';
      }
      line += character;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function centeredLines(page, font, text, box, maximum, minimum, color = navy) {
  let size = maximum;
  let lines;
  do {
    lines = wrap(font, text, size, box.width);
    if (lines.length * size * 1.24 <= box.height) break;
    size -= 1;
  } while (size >= minimum);
  if (size < minimum) throw Error('Certificate field exceeds the print layout');
  const lineHeight = size * 1.24;
  const firstBaseline = box.y + (box.height + (lines.length - 1) * lineHeight - size) / 2;
  lines.forEach((line, index) => page.drawText(line, {
    x: (page.getWidth() - font.widthOfTextAtSize(line, size)) / 2,
    y: firstBaseline - index * lineHeight, font, size, color
  }));
}

function drawQr(page, url, x, y, side) {
  const {modules} = QRCode.create(url, {errorCorrectionLevel: 'M'});
  const margin = 4;
  const step = side / (modules.size + 2 * margin);
  page.drawRectangle({x, y, width: side, height: side, color: white});
  for (let row = 0; row < modules.size; row++) {
    for (let column = 0; column < modules.size; column++) {
      if (!modules.get(row, column)) continue;
      page.drawRectangle({
        x: x + (column + margin) * step,
        y: y + (modules.size + margin - row - 1) * step,
        width: step, height: step, color: navy
      });
    }
  }
}

export async function renderIssuedCertificate({record, artwork, fontBytes}) {
  const code = String(record.certificate_code || '').trim().toUpperCase();
  if (!/^MSIAC-[A-Z0-9-]{8,70}$/.test(code) || record.revoked !== false) {
    throw Error('Certificate is not eligible for PDF rendering');
  }
  const name = String(record.recipient_name || '').trim();
  const program = String(record.program_title || '').trim();
  const description = String(record.achievement_description || '').trim();
  const issued = new Date(record.issued_at);
  if (!name || !program || Number.isNaN(issued.getTime())) throw Error('Certificate record is incomplete');
  const [title, reason] = variants[record.certificate_type] || ['Certificate of Achievement', 'Awarded for the verified achievement in'];
  const text = description || `${reason} ${program}.`;
  const date = issued.toLocaleDateString('en-IN', {dateStyle: 'long', timeZone: 'UTC'});
  const url = new URL('/certificate.html', 'https://maasatitechiac.vercel.app');
  url.searchParams.set('code', code);

  const pdf = await PDFDocument.create();
  pdf.registerFontkit(fontkit);
  const font = await pdf.embedFont(fontBytes, {subset: true});
  const glyphs = new Set(font.getCharacterSet());
  for (const character of title + name + program + text + date) {
    if (!/\s/u.test(character) && !glyphs.has(character.codePointAt(0))) {
      throw Error('The certificate font does not support all characters');
    }
  }
  const page = pdf.addPage([841.89, 595.28]);
  const template = await pdf.embedJpg(artwork);
  page.drawImage(template, {x: 0, y: 0, width: page.getWidth(), height: page.getHeight()});

  centeredLines(page, font, title, {y: 388, width: 570, height: 65}, 30, 17);
  centeredLines(page, font, name, {y: 300, width: 660, height: 78}, 43, 18, gold);
  centeredLines(page, font, program, {y: 240, width: 640, height: 54}, 20, 12);
  centeredLines(page, font, text, {y: 161, width: 640, height: 72}, 16, 10);
  centeredLines(page, font, 'Issued ' + date, {y: 94, width: 420, height: 34}, 13, 10);
  centeredLines(page, font, code, {y: 61, width: 435, height: 30}, 11, 8);
  drawQr(page, url.href, 70, 57, 78);
  pdf.setTitle(title + ' | MAA SATI IAC');
  pdf.setAuthor('MAA SATI IAC');
  return pdf.save();
}
