const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'src', 'app', '(public)');

// 1. Write the new layout.tsx
const layoutContent = `import { PublicHeader } from "@/components/layout/public-header"
import { PublicFooter } from "@/components/layout/public-footer"

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex flex-col">
      <PublicHeader />
      <div className="flex-1 w-full flex flex-col items-stretch">
        {children}
      </div>
      <PublicFooter />
    </div>
  )
}`;
fs.writeFileSync(path.join(publicDir, 'layout.tsx'), layoutContent);

// 2. Clean up page.tsx
const pagePath = path.join(publicDir, 'page.tsx');
let pageContent = fs.readFileSync(pagePath, 'utf-8');
const mainStartIndex = pageContent.indexOf('<main>');
const mainEndIndex = pageContent.lastIndexOf('</main>') + 7;

if (mainStartIndex !== -1 && mainEndIndex !== -1) {
  const innerContent = pageContent.substring(mainStartIndex, mainEndIndex);
  
  const newPageContent = `import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, ArrowUpRight, Upload, Search } from "lucide-react"

export default function Home() {
  return (
    <div className="bg-background">
      ${innerContent}
    </div>
  )
}
`;
  fs.writeFileSync(pagePath, newPageContent);
}

// 3. Delete existing old folders that conflict
const foldersToRemove = ['pricing', 'privacy', 'terms', 'cookies', 'security', 'integrations', 'about', 'company', 'legal', 'features', 'contact', 'careers', 'blog', 'dpa'];
foldersToRemove.forEach(folder => {
  const appPath = path.join(__dirname, 'src', 'app', folder);
  if (fs.existsSync(appPath)) {
    fs.rmSync(appPath, { recursive: true, force: true });
  }
});

// 4. Generate the 14 new pages
foldersToRemove.forEach(folder => {
  const dirPath = path.join(publicDir, folder);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
  
  // Format Title Name
  const rawTitle = folder === 'dpa' ? 'DPA' : folder.charAt(0).toUpperCase() + folder.slice(1);
  const title = rawTitle === 'Terms' ? 'Terms of Service' : 
                rawTitle === 'Privacy' ? 'Privacy Policy' : 
                rawTitle === 'Cookies' ? 'Cookie Policy' : 
                rawTitle === 'About' ? 'About Us' : rawTitle;

  const content = `export default function ${rawTitle}Page() {
  return (
    <main className="w-full flex-1">
      {/* Dynamic Gradient Hero */}
      <section className="pt-40 pb-20 px-6 text-center">
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          <h1 className="text-5xl sm:text-7xl font-medium tracking-tighter mb-8 text-transparent bg-clip-text bg-gradient-to-br from-foreground to-foreground/70">
            ${title}
          </h1>
          <p className="text-xl text-muted-foreground/80 font-medium">
            Discover the details around our ${title.toLowerCase()}.
          </p>
        </div>
      </section>

      {/* Structured Content Box */}
      <section className="py-20 px-6 bg-cream border-t border-border">
        <div className="max-w-4xl mx-auto">
          <div className="bg-card rounded-bento p-12 shadow-sm border border-border/50 text-foreground">
             <div className="prose prose-lg text-pretty max-w-none">
                <h2>Overview</h2>
                <p>Content for ${title} has not been finalized yet. This page aligns strictly to the Gradient Labs design system, utilizing the large <strong>bento border</strong> container structure, off-white cream blocks, and highly-legible serif/sans typography pairs.</p>
                
                <h3>Section Details</h3>
                <p>When populated, this area will serve as the structural standard across all utility and legal pages keeping user experience extremely consistent.</p>
             </div>
          </div>
        </div>
      </section>
    </main>
  );
}`;
  fs.writeFileSync(path.join(dirPath, 'page.tsx'), content);
});

console.log('Successfully refactored layouts and generated 14 Gradient Labs stylized pages.');
