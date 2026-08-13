import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import type { StaffRole } from '@/stores/staff-profile-store';

export async function buildProviderAgreementPdf({
  name,
  role,
  clinicName,
  signatureDataUrl,
}: {
  name: string;
  role: StaffRole;
  clinicName?: string;
  signatureDataUrl: string;
}): Promise<string> {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([612, 792]);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

  page.drawText('Carelio Provider Agreement', {
    x: 56,
    y: 720,
    size: 18,
    font: bold,
    color: rgb(0.1, 0.2, 0.35),
  });

  const body = [
    `Role: ${role === 'doctor' ? 'Physician' : 'Health Assistant'}`,
    clinicName ? `Practice: ${clinicName}` : '',
    '',
    'This Business Associate Agreement and telehealth addendum governs use of the Carelio platform. The undersigned agrees to protect patient information, obtain informed consent, and document care in the medical record.',
    '',
    `Signed electronically by ${name} on ${new Date().toLocaleDateString()}.`,
  ]
    .filter(Boolean)
    .join('\n');

  const lines = wrapText(body, 80);
  let y = 680;
  for (const line of lines) {
    page.drawText(line, {
      x: 56,
      y,
      size: 11,
      font,
      color: rgb(0.15, 0.15, 0.15),
    });
    y -= 16;
  }

  if (signatureDataUrl.startsWith('data:image')) {
    const base64 = signatureDataUrl.split(',')[1];
    const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
    const image = await pdf.embedPng(bytes);
    page.drawImage(image, { x: 56, y: y - 70, width: 180, height: 48 });
  }

  const bytes = await pdf.save();
  const blob = new Blob([bytes.buffer as ArrayBuffer], {
    type: 'application/pdf',
  });
  return URL.createObjectURL(blob);
}

function wrapText(text: string, width: number): string[] {
  const out: string[] = [];
  for (const paragraph of text.split('\n')) {
    if (!paragraph) {
      out.push('');
      continue;
    }
    const words = paragraph.split(' ');
    let line = '';
    for (const word of words) {
      const next = line ? `${line} ${word}` : word;
      if (next.length > width) {
        out.push(line);
        line = word;
      } else {
        line = next;
      }
    }
    if (line) out.push(line);
  }
  return out;
}
