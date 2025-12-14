import './globals.css';
import { Inter } from 'next/font/google';
import Link from 'next/link';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: "Scott's Favorite Recipes",
  description: 'A curated collection of delicious recipes.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <nav style={{
          padding: '20px 0',
          borderBottom: '1px solid var(--border-color)',
          background: 'rgba(15, 17, 21, 0.8)',
          backdropFilter: 'blur(10px)',
          position: 'sticky',
          top: 0,
          zIndex: 100
        }}>
          <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Link href="/" style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--accent-color)' }}>
              Scott's Favorite Recipes
            </Link>
            <div style={{ display: 'flex', gap: '20px' }}>
              <Link href="/add-recipe" className="nav-link">Add Recipe</Link>
            </div>
          </div>
        </nav>
        <main style={{ minHeight: '90vh', paddingBottom: '80px' }}>
          {children}
        </main>
      </body>
    </html>
  );
}
