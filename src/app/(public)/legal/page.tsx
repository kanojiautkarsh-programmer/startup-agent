import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Legal",
  description: "Learn more about TaskLyne's Legal."
};

export default function LegalPage() {
  return (
    <main className="w-full flex-1">
      {/* Dynamic Gradient Hero */}
      <section className="pt-40 pb-20 px-6 text-center">
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          <h1 className="text-5xl sm:text-7xl font-medium tracking-tighter mb-8 text-transparent bg-clip-text bg-gradient-to-br from-foreground to-foreground/70">
            Legal
          </h1>
          <p className="text-xl text-muted-foreground/80 font-medium">
            Discover the details around our legal.
          </p>
        </div>
      </section>

      {/* Structured Content Box */}
      <section className="py-20 px-6 bg-cream border-t border-border">
        <div className="max-w-4xl mx-auto">
          <div className="bg-card rounded-bento p-12 shadow-sm border border-border/50 text-foreground">
             <div className="prose prose-lg text-pretty max-w-none">
                <h2>Overview</h2>
                <p>Content for Legal has not been finalized yet. This page aligns strictly to the Gradient Labs design system, utilizing the large <strong>bento border</strong> container structure, off-white cream blocks, and highly-legible serif/sans typography pairs.</p>
                
                <h3>Section Details</h3>
                <p>When populated, this area will serve as the structural standard across all utility and legal pages keeping user experience extremely consistent.</p>
             </div>
          </div>
        </div>
      </section>
    </main>
  );
}




