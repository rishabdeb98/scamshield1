import { Moon, Plus, ShieldCheck, Sun } from 'lucide-react';
import type { ActiveView } from '../types/scamshield';
import type { ThemeMode } from '../utils/theme';

interface HeaderProps {
  activeView: ActiveView;
  onNavigate: (view: ActiveView) => void;
  onNewScan: () => void;
  historyCount: number;
  theme: ThemeMode;
  onToggleTheme: () => void;
}

export function Header({
  activeView,
  onNavigate,
  onNewScan,
  historyCount,
  theme,
  onToggleTheme,
}: HeaderProps) {
  const navItems: Array<{ id: ActiveView; label: string }> = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'message-scanner', label: 'Message Scanner' },
    { id: 'url-scanner', label: 'URL Scanner' },
    { id: 'scam-library', label: 'Scam Library' },
    { id: 'safety-center', label: 'Safety Center' },
    { id: 'history', label: historyCount > 0 ? `Scan History (${historyCount})` : 'Scan History' },
    { id: 'settings', label: 'Settings' },
  ];

  const isDark = theme === 'dark';

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-[#111827]/95 backdrop-blur-sm border-b border-slate-200 dark:border-[#273449] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4 xl:gap-6">
        {/* Left: ScamShield logo & subtitle */}
        <button
          type="button"
          onClick={() => onNavigate('dashboard')}
          className="inline-flex items-center gap-2.5 text-left whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600 rounded"
        >
          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-800/60 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" aria-hidden="true" />
          </div>
          <div className="leading-tight">
            <div className="text-base font-bold tracking-tight text-slate-900 dark:text-[#F8FAFC]">
              ScamShield
            </div>
            <div className="hidden sm:block text-[11px] font-medium text-slate-500 dark:text-[#A7B4C7]">
              Cybersecurity Threat Intelligence
            </div>
          </div>
        </button>

        {/* Right: Navigation + Theme Toggle + New Scan CTA */}
        <div className="flex items-center gap-3 xl:gap-5">
          <nav aria-label="Main navigation" className="hidden xl:flex items-center gap-4">
            {navItems.map((item) => {
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onNavigate(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`text-sm font-medium whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600 ${
                    isActive
                      ? 'text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400'
                      : 'text-slate-600 dark:text-[#A7B4C7] border-transparent hover:text-slate-900 dark:hover:text-[#F8FAFC] hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-pressed={isDark}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-slate-200 dark:border-[#273449] bg-slate-50 dark:bg-[#172033] text-slate-700 dark:text-amber-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            {isDark ? (
              <Sun className="w-4 h-4" aria-hidden="true" />
            ) : (
              <Moon className="w-4 h-4" aria-hidden="true" />
            )}
          </button>

          <button
            type="button"
            onClick={onNewScan}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 rounded-lg transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            <span>New Scan</span>
          </button>
        </div>
      </div>

      {/* Responsive tablet/mobile navigation strip */}
      <nav
        aria-label="Mobile navigation"
        className="xl:hidden border-t border-slate-100 dark:border-[#273449] px-4 py-2 flex items-center gap-2 overflow-x-auto bg-white dark:bg-[#111827]"
      >
        {navItems.map((item) => {
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              aria-current={isActive ? 'page' : undefined}
              className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap shrink-0 transition-colors ${
                isActive
                  ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 font-semibold'
                  : 'text-slate-600 dark:text-[#A7B4C7] hover:text-slate-900 dark:hover:text-[#F8FAFC]'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </nav>
    </header>
  );
}
