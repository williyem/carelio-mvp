import mammoth from 'mammoth';
import { format } from 'date-fns';

import {
  injectFormFields,
  getReleaseOfInformationFields,
} from './document-field-injection';

function getProxiedImageUrl(originalUrl: string): string {
  return originalUrl;
}

function postProcessHtml(html: string): string {
  let processed = html;

  processed = processed.replace(/<p>/g, '<p class="mb-4">');
  processed = processed.replace(
    /<ul>/g,
    '<ul class="list-disc" style="list-style-type: disc; padding-left: 2.5rem;">'
  );
  processed = processed.replace(
    /<ol>/g,
    '<ol class="list-decimal" style="list-style-type: decimal; padding-left: 2.5rem;">'
  );
  processed = processed.replace(
    /<li>/g,
    '<li class="mb-2" style="display: list-item;">'
  );
  processed = processed.replace(/<a /g, '<a class="text-blue-600 underline" ');
  processed = processed.replace(/<strong>/g, '<strong class="font-semibold">');
  processed = processed.replace(
    /<h1>/g,
    '<h1 class="text-2xl font-bold mb-4">'
  );
  processed = processed.replace(/<h2>/g, '<h2 class="text-xl font-bold mb-3">');
  processed = processed.replace(/<h3>/g, '<h3 class="text-lg font-bold mb-2">');

  return processed;
}

async function fetchAndConvertWordDoc(documentName: string): Promise<string> {
  const encodedName = encodeURIComponent(documentName);
  const response = await fetch(`/documents/agreements/${encodedName}.docx`);

  if (!response.ok) {
    throw new Error(`Failed to fetch document: ${response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();

  const result = await mammoth.convertToHtml(
    {
      arrayBuffer,
    },
    {
      styleMap: [
        "p[style-name='List Paragraph'] => ul > li:fresh",
        "p[style-name='Bullet List'] => ul > li:fresh",
        "p[style-name='Numbered List'] => ol > li:fresh",
      ],
    }
  );

  return postProcessHtml(result.value);
}

function buildSignedAgreementHtml(params: {
  documentHtml: string;
  title: string;
  signedBy: string;
  signedAt: string | Date;
  signatureSrc: string;
}): string {
  const { documentHtml, title, signedBy, signedAt, signatureSrc } = params;

  const dateStr =
    typeof signedAt === 'string'
      ? format(new Date(signedAt), 'MMMM dd, yyyy')
      : format(new Date(signedAt), 'MMMM dd, yyyy');

  return `
    <div style="width:794px; padding:32px; background:#fff; color:#111827; font-family:Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; font-size:16px; line-height:1.7;">
      <div style="display:flex; flex-direction:column; align-items:flex-start; gap:16px;">
        <h5 style="margin:0; font-size:28px; font-weight:700; color:#0B1324;">${escapeHtml(
          title
        )}</h5>
        <div style="width:100%;">
          ${documentHtml}
        </div>
        <div style="margin-top:32px; padding-top:24px; border-top:2px solid #e5e7eb; width:100%;">
          <div style="margin-bottom:16px;">
            <div style="font-weight:600; margin-bottom:8px;">Printed Name:</div>
            <div style="border-bottom:2px dotted #9ca3af; padding-bottom:4px; font-size:16px; width:300px;">${escapeHtml(
              signedBy
            )}</div>
          </div>
          <div style="margin-bottom:16px;">
            <div style="font-weight:600; margin-bottom:8px;">Signature:</div>
            <div style="border-bottom:2px dotted #9ca3af; padding-bottom:4px; height:60px; display:flex; align-items:center; width:300px;">
              <img src="${signatureSrc}" alt="Signature" style="max-width:300px; max-height:60px; object-fit:contain;" />
            </div>
          </div>
          <div> 
            <div style="font-weight:600; margin-bottom:8px;">Date:</div>
            <div style="border-bottom:2px dotted #9ca3af; padding-bottom:4px; width:200px;">${dateStr}</div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function buildStaticAgreementHtml(params: {
  documentHtml: string;
  title: string;
}): string {
  const { documentHtml, title } = params;

  return `
    <div style="width:794px; padding:32px; background:#fff; color:#111827; font-family:Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; font-size:16px; line-height:1.7;">
      <div style="display:flex; flex-direction:column; align-items:flex-start; gap:16px;">
        <h5 style="margin:0; font-size:28px; font-weight:700; color:#0B1324;">${escapeHtml(
          title
        )}</h5>
        <div style="width:100%;">
          ${documentHtml}
        </div>
      </div>
    </div>
  `;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export type GenerateWordDocPdfOptions = {
  documentName: string;
  title: string;
  signedBy?: string;
  signedAt?: string | Date;
  signatureUrl?: string;
  fileName?: string;
  returnBlob?: boolean;
};

export async function generateWordDocPdf(
  options: GenerateWordDocPdfOptions
): Promise<void | Blob> {
  const {
    documentName,
    title,
    signedBy,
    signedAt,
    signatureUrl,
    fileName,
    returnBlob,
  } = options;

  const documentHtml = await fetchAndConvertWordDoc(documentName);

  let processedHtml;
  if (documentName === 'Release of Information') {
    processedHtml = injectFormFields(
      documentHtml,
      getReleaseOfInformationFields(),
      true
    );
  } else {
    processedHtml = documentHtml;
  }

  let html: string;
  if (signedBy && signedAt && signatureUrl) {
    const signatureSrc = signatureUrl.startsWith('data:')
      ? signatureUrl
      : getProxiedImageUrl(signatureUrl);

    html = buildSignedAgreementHtml({
      documentHtml: processedHtml,
      title,
      signedBy,
      signedAt,
      signatureSrc,
    });
  } else {
    html = buildStaticAgreementHtml({ documentHtml: processedHtml, title });
  }

  try {
    const response = await fetch('/api/generate-pdf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        html,
        title,
        signedBy,
        signedAt,
        signatureUrl,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate PDF');
    }

    if (returnBlob) {
      const blob = await response.blob();
      return blob;
    } else {
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download =
        fileName ||
        `${title.replace(/\s+/g, '_')}_${format(new Date(), 'yyyyMMdd')}.pdf`;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  } catch (error) {
    console.error('PDF generation error:', error);
    throw error;
  }
}

export async function openWordDocPdfInNewTab(
  options: GenerateWordDocPdfOptions
): Promise<void | Blob> {
  const { documentName, title, signedBy, signedAt, signatureUrl, returnBlob } =
    options;

  const documentHtml = await fetchAndConvertWordDoc(documentName);

  let processedHtml;
  if (documentName === 'Release of Information') {
    processedHtml = injectFormFields(
      documentHtml,
      getReleaseOfInformationFields(),
      true
    );
  } else {
    processedHtml = documentHtml;
  }

  let html: string;
  if (signedBy && signedAt && signatureUrl) {
    const signatureSrc = signatureUrl.startsWith('data:')
      ? signatureUrl
      : getProxiedImageUrl(signatureUrl);
    html = buildSignedAgreementHtml({
      documentHtml: processedHtml,
      title,
      signedBy,
      signedAt,
      signatureSrc,
    });
  } else {
    html = buildStaticAgreementHtml({ documentHtml: processedHtml, title });
  }

  try {
    const response = await fetch('/api/generate-pdf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        html,
        title,
        signedBy,
        signedAt,
        signatureUrl,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate PDF');
    }

    if (returnBlob) {
      const blob = await response.blob();
      return blob;
    } else {
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      const newWindow = window.open('', '_blank');
      if (newWindow) {
        newWindow.document.title = `${title} - ${format(
          new Date(),
          'yyyyMMdd'
        )}`;
        newWindow.location.href = url;
      }

      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    }
  } catch (error) {
    console.error('PDF generation error:', error);
    throw error;
  }
}

export function downloadWordDocument(
  documentName: string,
  version: string = '1.0'
): void {
  const encodedName = encodeURIComponent(`${documentName} v${version}`);
  const link = document.createElement('a');
  link.href = `/documents/agreements/${encodedName}.docx`;
  link.download = `${documentName} v${version}.docx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
