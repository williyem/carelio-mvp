export async function replaceImageUrlsWithBase64(
  html: string
): Promise<string> {
  const imageUrlRegex = /src="([^"]*(?:https?:\/\/[^"]*|data:image[^"]*))"/g;
  let processedHtml = html;

  const matches = [...html.matchAll(imageUrlRegex)];

  for (const match of matches) {
    const imageUrl = match[1];

    if (imageUrl.startsWith('data:image')) {
      continue;
    }

    try {
      const baseUrl = process.env.AUTH_URL || 'http://localhost:3000';
      const fullImageUrl = imageUrl.startsWith('http')
        ? imageUrl
        : `${baseUrl}${imageUrl}`;

      const response = await fetch(fullImageUrl);
      if (response.ok) {
        const buffer = await response.arrayBuffer();
        const base64 = Buffer.from(buffer).toString('base64');
        const mimeType = response.headers.get('content-type') || 'image/png';
        const dataUri = `data:${mimeType};base64,${base64}`;
        processedHtml = processedHtml.replace(imageUrl, dataUri);
      }
    } catch {}
  }

  return processedHtml;
}
