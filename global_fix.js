const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir(path.join(__dirname, 'src'), function(filePath) {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // 1. UI typography fixes
    content = content.replace(/font-serif/g, 'font-bold tracking-tight');
    content = content.replace(/italic font-normal/g, 'text-muted-foreground');
    content = content.replace(/font-bold tracking-tight font-bold/g, 'font-bold tracking-tight'); // cleanup accidental doubles
    
    // 2. Color / Theme fixes
    content = content.replace(/bg-\[#FAF9F6\]/g, 'bg-muted/10');
    content = content.replace(/bg-\[#2D211B\]/g, 'bg-card');
    
    // 3. Button fixes
    content = content.replace(/bg-emphasis text-emphasis-fg hover:bg-emphasis-hover/g, 'bg-primary text-primary-foreground hover:bg-primary/90');

    // 4. Metadata for Client Components (Fix: remove metadata if we accidentally injected it into use client)
    // Actually we only injected into (public) which are server components, so we are safe.
    
    // Add Metadata to Phase 2/3 pages that are NOT client components
    if (filePath.endsWith('page.tsx') && !content.includes('export const metadata') && !content.includes('"use client"') && !content.includes("'use client'")) {
       let dirname = path.basename(path.dirname(filePath));
       if (dirname !== 'app' && !dirname.startsWith('(') && !dirname.startsWith('[')) {
          let title = dirname.charAt(0).toUpperCase() + dirname.slice(1);
          let metaImport = 'import { Metadata } from "next";\n';
          
          if (!content.includes('import { Metadata }') && !content.includes('import type { Metadata }')) {
            const lines = content.split('\n');
            // skip dynamic exports
            let insertIndex = 0;
            while(insertIndex < lines.length && (lines[insertIndex].trim() === '' || lines[insertIndex].includes('export const dynamic'))) {
              insertIndex++;
            }
            lines.splice(insertIndex, 0, metaImport);
            content = lines.join('\n');
          }
          
          const metadataBlock = `export const metadata: Metadata = {
  title: "${title}",
  description: "TaskLyne ${title}"
};

export default function`;
          content = content.replace('export default function', metadataBlock);
       }
    }

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Fixed:', filePath);
    }
  }
});
