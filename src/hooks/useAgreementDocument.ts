import { useState, useEffect } from 'react';
import mammoth from 'mammoth';

export type AgreementDocument = {
  html: string;
  version: string;
  loading: boolean;
  error: string | null;
};

export function useAgreementDocument(
  documentName: string,
  version: string = '1.0'
): AgreementDocument {
  const [document, setDocument] = useState<AgreementDocument>({
    html: '',
    version,
    loading: true,
    error: null,
  });

  useEffect(() => {
    async function loadAndConvertDocument() {
      try {
        setDocument((prev) => ({ ...prev, loading: true, error: null }));

        const encodedName = encodeURIComponent(documentName);
        const response = await fetch(
          `/documents/agreements/${encodedName}.docx`
        );

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

        const processedHtml = postProcessHtml(result.value);

        setDocument({
          html: processedHtml,
          version,
          loading: false,
          error: null,
        });

        if (result.messages.length > 0) {
          console.warn(
            `Mammoth conversion messages for ${documentName}:`,
            result.messages
          );
        }
      } catch (error) {
        console.error(`Failed to load document ${documentName}:`, error);
        setDocument((prev) => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        }));
      }
    }

    loadAndConvertDocument();
  }, [documentName, version]);

  return document;
}

function postProcessHtml(html: string): string {
  let processed = html;

  processed = processed.replace(
    /<a href="([^"]+)"([^>]*)>/g,
    '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-600 underline break-all"$2>'
  );

  processed = processed.replace(
    /<p>/g,
    '<p class="mb-4 whitespace-pre-line break-words">'
  );

  processed = processed.replace(
    /<ul>/g,
    '<ul class="list-disc my-2" style="list-style-type: disc; padding-left: 2.5rem;">'
  );
  processed = processed.replace(
    /<ol>/g,
    '<ol class="list-decimal mt-1" style="list-style-type: decimal; padding-left: 2.5rem;">'
  );
  processed = processed.replace(
    /<li>/g,
    '<li class="mb-2" style="display: list-item;">'
  );

  processed = processed.replace(/<strong>/g, '<strong class="font-semibold">');

  processed = processed.replace(
    /<h1>/g,
    '<h1 class="typography-paragraph-medium font-bold mb-2 text-text-li-950">'
  );
  processed = processed.replace(
    /<h2>/g,
    '<h2 class="typography-paragraph-medium font-bold mb-2 text-text-li-950">'
  );
  processed = processed.replace(
    /<h3>/g,
    '<h3 class="typography-paragraph-medium font-bold mb-2 text-text-li-950">'
  );

  return processed;
}
