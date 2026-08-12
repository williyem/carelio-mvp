import { NextRequest, NextResponse } from 'next/server';
import { replaceImageUrlsWithBase64 } from '@/lib/pdf-image-processing';
import { PDFDocument } from 'pdf-lib';

export async function POST(request: NextRequest) {
  try {
    const { html, title } = await request.json();
    if (!html) {
      return NextResponse.json(
        { error: 'HTML content is required' },
        { status: 400 }
      );
    }

    const processedHtml = await replaceImageUrlsWithBase64(html);

    const lambdaUrl = process.env.LAMBDA_URL;
    const apiKey = process.env.LAMBDA_API_KEY;

    if (!lambdaUrl || !apiKey) {
      return NextResponse.json(
        { error: 'Lambda configuration missing' },
        { status: 500 }
      );
    }

    const response = await fetch(lambdaUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
      },
      body: JSON.stringify({
        html: processedHtml,
        title: title || 'Document',
        metadata: {
          author: 'Carelio',
          subject: 'Scholar Agreement Document',
          creator: 'Carelio System',
          producer: 'AWS Lambda PDF Generator',
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorDetails;
      try {
        errorDetails = JSON.parse(errorText);
      } catch {
        errorDetails = { error: errorText };
      }

      return NextResponse.json(
        {
          error: 'Failed to generate PDF',
          details: errorDetails,
        },
        { status: response.status }
      );
    }

    // Lambda returns base64 string, we need to decode it
    const pdfBase64 = await response.text();
    const pdfBuffer = Buffer.from(pdfBase64, 'base64');

    // Add metadata using pdf-lib
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    pdfDoc.setTitle(title || 'Document');
    pdfDoc.setAuthor('Carelio');
    pdfDoc.setSubject('Scholar Agreement Document');
    pdfDoc.setCreator('Carelio System');
    pdfDoc.setProducer('AWS Lambda PDF Generator');
    pdfDoc.setCreationDate(new Date());
    pdfDoc.setModificationDate(new Date());

    // Save PDF with metadata
    const pdfWithMetadata = await pdfDoc.save();

    const documentTitle = title || 'Document';
    const filename = `${documentTitle.replace(/\s+/g, '_')}_${
      new Date().toISOString().split('T')[0]
    }.pdf`;

    return new NextResponse(Buffer.from(pdfWithMetadata), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate PDF',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
