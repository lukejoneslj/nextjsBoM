import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Scripture Analysis Dashboard",
  description: "Interactive dashboard for exploring scripture data and insights",
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex min-h-screen flex-col">
          <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur">
            <div className="container flex h-16 items-center justify-between py-4">
              <div className="flex gap-6 md:gap-10">
                <Link href="/" className="flex items-center space-x-2">
                  <span className="font-bold inline-block text-xl">Scripture Analysis</span>
                </Link>
                <nav className="hidden gap-6 md:flex">
                  <Link 
                    href="/" 
                    className="flex items-center text-sm font-medium transition-colors hover:text-primary"
                  >
                    Dashboard
                  </Link>
                  <Link 
                    href="/books" 
                    className="flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                  >
                    Books
                  </Link>
                  <Link 
                    href="/chapters" 
                    className="flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                  >
                    Chapters
                  </Link>
                  <Link 
                    href="/scores" 
                    className="flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                  >
                    Scores
                  </Link>
                  <Link 
                    href="/compare" 
                    className="flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                  >
                    Compare
                  </Link>
                </nav>
              </div>
            </div>
          </header>
          <div className="flex-1">
            {children}
          </div>
          <footer className="border-t py-6 md:py-0">
            <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
              <p className="text-sm text-muted-foreground text-center md:text-left">
                Scripture Analysis Dashboard. Data processed and visualized using Next.js and shadcn/ui.
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
