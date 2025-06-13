import { defineConfig } from 'vite';
import fs from 'fs';
import path from 'path';

function base64EncodeAssets() {
  return {
    name: 'base64-encode-assets',
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        // Load and inline CSS
        const cssPath = path.resolve(__dirname, 'src/style.css');
        const cssContent = fs.readFileSync(cssPath, 'utf-8');
        
        // Process CSS content to inline any assets referenced in it
        let processedCss = cssContent.replace(/url\(['"]?\.\.\/assets\/([^'"]+)['"]?\)/g, (match, file) => {
          const assetPath = path.resolve(__dirname, 'assets', file);
          const buffer = fs.readFileSync(assetPath);
          const base64 = buffer.toString('base64');
          const ext = path.extname(file).substring(1);
          const mimeType = {
            woff: 'font/woff',
            jpg: 'image/jpeg'
          }[ext] || 'application/octet-stream';
          return `url(data:${mimeType};base64,${base64})`;
        });

        // Replace the CSS link with an inline style tag
        html = html.replace(
          /<link[^>]+href=["']src\/style\.css["'][^>]*>/,
          `<style>${processedCss}</style>`
        );

        // Inline mp3 in HTML
        html = html.replace(/src=["']assets\/([^"']+)["']/g, (match, file) => {
          const filePath = path.resolve(__dirname, 'assets', file);
          const buffer = fs.readFileSync(filePath);
          const base64 = buffer.toString('base64');
          return `src="data:audio/mpeg;base64,${base64}"`;
        });

        // Inline JavaScript
        html = html.replace(/<script[^>]*?src=["']([^"']+)["'][^>]*?>\s*<\/script>/g, (match, file) => {
          const jsPath = path.resolve(__dirname, file);
          const jsContent = fs.readFileSync(jsPath, 'utf-8');
          return `<script>${jsContent}</script>`;
        });

        return html;
      }
    }
  };
}

export default defineConfig({
  plugins: [base64EncodeAssets()],
  build: {
    rollupOptions: {
      input: 'index.html'
    },
    outDir: 'dist',
    assetsInlineLimit: Infinity,
    emptyOutDir: true,
    cssCodeSplit: false
  }
});
