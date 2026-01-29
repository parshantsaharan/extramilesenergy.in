const fs = require("fs");
const path = require("path");

const baseUrl = "https://extramilesenergy.in";

// Folders to scan
const folders = ["products", "blogs"];

// Files/folders to ignore
const ignore = ["node_modules", ".git", ".github", "admin"];

let urls = [];

/**
 * Scan directory recursively
 */
function scanDir(dir, webPath = "") {
  if (!fs.existsSync(dir)) return;

  const files = fs.readdirSync(dir);

  files.forEach(file => {
    if (ignore.includes(file)) return;

    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      scanDir(fullPath, `${webPath}/${file}`);
    }

    else if (file.endsWith(".html")) {
      let cleanName = file.replace("index.html", "");
      const url = `${baseUrl}${webPath}/${cleanName}`
        .replace(/\/+/g, "/")
        .replace("https:/", "https://");

      urls.push(url);
    }
  });
}

/* Homepage */
urls.push(`${baseUrl}/`);

/* Scan main folders */
folders.forEach(folder => {
  scanDir(path.join(__dirname, folder), `/${folder}`);
});

/* Scan root for pages (about.html etc) */
scanDir(__dirname, "");

/* Remove duplicates */
urls = [...new Set(urls)];

/* Generate XML */
let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

urls.forEach(url => {
  const priority = url === `${baseUrl}/` ? "1.0" : "0.8";

  xml += `
  <url>
    <loc>${url}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <priority>${priority}</priority>
  </url>`;
});

xml += `\n</urlset>`;

/* Save */
fs.writeFileSync("sitemap.xml", xml);

console.log("✅ Sitemap Auto Updated:", urls.length, "URLs");
