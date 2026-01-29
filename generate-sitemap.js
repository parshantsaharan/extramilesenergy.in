const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

/* ================= CONFIG ================= */

const BASE_URL = "https://extramilesenergy.in";
const OUTPUT_FILE = "sitemap.xml";

/* Folders jahan blogs & products hain */
const CONTENT_FOLDERS = [
  "blogs",
  "products"
];

/* ========================================== */

// Get last git commit date of file
function getGitLastModified(filePath) {
  try {
    const cmd = `git log -1 --format=%cI -- "${filePath}"`;
    return execSync(cmd).toString().trim();
  } catch (err) {
    return new Date().toISOString();
  }
}

// Scan folder recursively
function scanFolder(dir) {
  let result = [];

  if (!fs.existsSync(dir)) return result;

  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const fullPath = path.join(dir, file);

    if (fs.statSync(fullPath).isDirectory()) {
      result = result.concat(scanFolder(fullPath));
    }

    if (file.endsWith(".html")) {
      result.push(fullPath);
    }
  });

  return result;
}

// Build URL list
function collectUrls() {

  let urls = [];

  /* Homepage */
  urls.push({
    loc: `${BASE_URL}/`,
    lastmod: new Date().toISOString(),
    priority: "1.0"
  });

  /* Scan blogs & products */
  CONTENT_FOLDERS.forEach(folder => {

    const pages = scanFolder(folder);

    pages.forEach(file => {

      const cleanPath = file.replace(/\\/g, "/");

      urls.push({
        loc: `${BASE_URL}/${cleanPath}`,
        lastmod: getGitLastModified(file),
        priority: "0.8"
      });

    });

  });

  return urls;
}

// Generate XML
function generateSitemap(urls) {

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  urls.forEach(u => {

    xml += `  <url>\n`;
    xml += `    <loc>${u.loc}</loc>\n`;
    xml += `    <lastmod>${u.lastmod}</lastmod>\n`;
    xml += `    <priority>${u.priority}</priority>\n`;
    xml += `  </url>\n`;

  });

  xml += `</urlset>`;

  return xml;
}

// Main Run
function main() {

  console.log("🚀 Generating sitemap...");

  const urls = collectUrls();

  const sitemap = generateSitemap(urls);

  fs.writeFileSync(OUTPUT_FILE, sitemap);

  console.log(`✅ Sitemap created: ${OUTPUT_FILE}`);
  console.log(`📄 Total URLs: ${urls.length}`);
}

main();
