'use client';

import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useScrollReveal } from '@/lib/useScrollReveal';

const MODULES = [
  { href: '/me/boards', label: '画板', glyph: '✎' },
  { href: '/me/joy', label: '小确幸', glyph: '☀' },
  { href: '/me/daily', label: '每日一问', glyph: '?' },
  { href: '/me/think', label: '思考一下', glyph: '思' },
];

export default function MeHubPage() {
  useScrollReveal();

  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <Navbar />

      <main className="flex-grow pt-32 pb-20">
        <div className="max-w-5xl mx-auto px-6 sm:px-10 lg:px-14">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-16 reveal">
            me
          </h1>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {MODULES.map((m, idx) => (
              <Link
                key={m.href}
                href={m.href}
                className={`group flex items-center justify-between gap-4 border border-white/10 bg-white/[0.02] hover:border-white/40 hover:bg-white/[0.05] px-7 py-8 transition-all duration-500 reveal reveal-delay-${Math.min(idx + 1, 3)}`}
              >
                <span className="flex items-center gap-4">
                  <span className="text-2xl text-white/50 group-hover:text-white transition-colors">
                    {m.glyph}
                  </span>
                  <span className="text-2xl font-bold tracking-tight">{m.label}</span>
                </span>
                <span className="text-white/30 group-hover:text-white transition-all group-hover:translate-x-1">
                  →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
