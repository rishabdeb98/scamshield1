import type { RiskLevel } from '../types/scamshield';

export function getRiskBadgeClasses(level: RiskLevel): string {
  if (level === 'CRITICAL') {
    return 'bg-rose-100 text-rose-900 border-rose-300 dark:bg-rose-950/60 dark:text-rose-200 dark:border-rose-800/80';
  }
  if (level === 'HIGH') {
    return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-300 dark:border-red-800/70';
  }
  if (level === 'MEDIUM') {
    return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800/70';
  }
  return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800/70';
}

export function getRiskLabel(level: RiskLevel): string {
  if (level === 'CRITICAL') return 'Critical';
  if (level === 'HIGH') return 'High';
  if (level === 'MEDIUM') return 'Medium';
  return 'Low';
}
