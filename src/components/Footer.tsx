import { Shield } from 'lucide-react';
import type { ActiveView } from '../types/scamshield';

interface FooterProps {
  onNavigate: (view: ActiveView) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="mt-16 border-t border-slate-200 dark:border-[#273449] bg-white dark:bg-[#111827] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-slate-100 dark:border-[#273449]">
          <div className="flex flex-wrap items-center gap-2 text-slate-900 dark:text-[#F8FAFC] font-semibold text-sm">
            <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" aria-hidden="true" />
            <span>ScamShield</span>
            <span className="text-slate-300 dark:text-slate-600" aria-hidden="true">
              ·
            </span>
            <span className="font-normal text-slate-600 dark:text-[#A7B4C7]">
              Pause, inspect the domain, and verify through official apps before replying.
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-5 text-xs font-medium text-slate-600 dark:text-[#A7B4C7]">
            <button
              type="button"
              onClick={() => onNavigate('safety-center')}
              className="hover:text-slate-900 dark:hover:text-[#F8FAFC] transition-colors whitespace-nowrap"
            >
              Safety Center
            </button>
            <button
              type="button"
              onClick={() => onNavigate('scam-library')}
              className="hover:text-slate-900 dark:hover:text-[#F8FAFC] transition-colors whitespace-nowrap"
            >
              Scam Library
            </button>
            <button
              type="button"
              onClick={() => onNavigate('how-it-works')}
              className="hover:text-slate-900 dark:hover:text-[#F8FAFC] transition-colors whitespace-nowrap"
            >
              How It Works
            </button>
            <button
              type="button"
              onClick={() => onNavigate('history')}
              className="hover:text-slate-900 dark:hover:text-[#F8FAFC] transition-colors whitespace-nowrap"
            >
              History
            </button>
            <button
              type="button"
              onClick={() => onNavigate('about')}
              className="hover:text-slate-900 dark:hover:text-[#F8FAFC] transition-colors whitespace-nowrap"
            >
              About &amp; Privacy
            </button>
          </div>
        </div>
        <p className="mt-4 text-xs text-slate-500 dark:text-[#A7B4C7] leading-relaxed">
          Disclaimer: ScamShield is an independent educational and awareness tool. It is not a
          government service and does not replace official cybercrime reporting channels. Automated
          detection is not guaranteed to identify every scam or zero-day phishing campaign—always
          confirm sensitive requests independently through trusted official channels.
        </p>
      </div>
    </footer>
  );
}
