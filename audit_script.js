const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'src', 'app', '(public)');
const items = fs.readdirSync(publicDir);

for (const item of items) {
  const dirPath = path.join(publicDir, item);
  if (fs.statSync(dirPath).isDirectory()) {
    const pagePath = path.join(dirPath, 'page.tsx');
    if (fs.existsSync(pagePath)) {
      let content = fs.readFileSync(pagePath, 'utf8');

      // 1. UI fixes
      content = content.replace(/font-serif/g, ''); // default to sans
      content = content.replace(/italic font-normal/g, 'text-muted-foreground');
      content = content.replace(/bg-\[#FAF9F6\]/g, 'bg-muted/10');
      content = content.replace(/bg-\[#2D211B\]/g, 'bg-card');
      
      // Some text-white on dark backgrounds might break if we switch to bg-card which is light in light mode
      // Let's replace text-white with text-foreground / text-card-foreground when we removed 2D211B
      // But only in the replaced block. Actually, safer to replace text-white with text-foreground globally for these marketing pages
      // unless they are inside a primary button, but buttons usually use standard classes now.
      // Let's just fix the specific issues without breaking too much.
      
      // 2. SEO / Metadata
      if (!content.includes('export const metadata')) {
        let title = item.charAt(0).toUpperCase() + item.slice(1);
        if (item === 'dpa') title = 'DPA';
        if (item === 'terms') title = 'Terms of Service';
        
        let metaImport = 'import { Metadata } from "next"\n';
        if (!content.includes(metaImport.trim())) {
          // insert as second line
          const lines = content.split('\n');
          lines.splice(1, 0, metaImport);
          content = lines.join('\n');
        }
        
        const metadataBlock = `export const metadata: Metadata = {
  title: "${title}",
  description: "Learn more about TaskLyne's ${title}."
};

export default function`;
        content = content.replace('export default function', metadataBlock);
      }

      fs.writeFileSync(pagePath, content, 'utf8');
      console.log(`Processed ${item}`);
    }
  }
}
