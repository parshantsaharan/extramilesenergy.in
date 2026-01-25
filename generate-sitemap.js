const fs = require("fs");
const path = require("path");

const baseUrl = "https://extramilesenergy.in";

const folders = ["products", "blogs"];

let urls = [`${baseUrl}/`];

folders.forEach(folder => {
  const dir = path.join(__dirname, folder);

  if (fs.existsSync(dir)) {
    fs.readdirSync(dir).forEach(file => {
      if (file.endsWith(".html")) {
        urls.push(`${baseUrl}/${folder}/${file}`);
      }
    });
  }
});

let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

urls.forEach(url => {
  xml += `
  <url>
    <loc>${url}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <priority>0.8</priority>
  </url>`;
});

xml += `\n</urlset>`;

fs.writeFileSync("sitemap.xml", xml);

console.log("✅ Sitemap Updated!");
