import { SITE_IMAGES, absoluteUrl } from "@/lib/site";

export function GET() {
  const urls = SITE_IMAGES.map(({ pagePath, images }) => {
    const imageTags = images
      .map(
        (src) => `    <image:image>
      <image:loc>${absoluteUrl(src)}</image:loc>
    </image:image>`,
      )
      .join("\n");

    return `  <url>
    <loc>${absoluteUrl(pagePath)}</loc>
${imageTags}
  </url>`;
  }).join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
