export type ThemePalette = 'emerald' | 'blue' | 'rose' | 'purple' | 'amber' | 'slate';

export const THEME_PALETTES: Record<ThemePalette, Record<number, string>> = {
  emerald: { 50: '#ecfdf5', 100: '#d1fae5', 200: '#a7f3d0', 300: '#6ee7b7', 400: '#34d399', 500: '#10b981', 600: '#059669', 700: '#047857', 800: '#065f46', 900: '#064e3b', 950: '#022c22' },
  blue: { 50: '#eff6ff', 100: '#dbeafe', 200: '#bfdbfe', 300: '#93c5fd', 400: '#60a5fa', 500: '#3b82f6', 600: '#2563eb', 700: '#1d4ed8', 800: '#1e40af', 900: '#1e3a8a', 950: '#172554' },
  rose: { 50: '#fff1f2', 100: '#ffe4e6', 200: '#fecdd3', 300: '#fda4af', 400: '#fb7185', 500: '#f43f5e', 600: '#e11d48', 700: '#be123c', 800: '#9f1239', 900: '#881337', 950: '#4c0519' },
  purple: { 50: '#faf5ff', 100: '#f3e8ff', 200: '#e9d5ff', 300: '#d8b4fe', 400: '#c084fc', 500: '#a855f7', 600: '#9333ea', 700: '#7e22ce', 800: '#6b21a8', 900: '#581c87', 950: '#3b0764' },
  amber: { 50: '#fffbeb', 100: '#fef3c7', 200: '#fde68a', 300: '#fcd34d', 400: '#fbbf24', 500: '#f59e0b', 600: '#d97706', 700: '#b45309', 800: '#92400e', 900: '#78350f', 950: '#451a03' },
  slate: { 50: '#f8fafc', 100: '#f1f5f9', 200: '#e2e8f0', 300: '#cbd5e1', 400: '#94a3b8', 500: '#64748b', 600: '#475569', 700: '#334155', 800: '#1e293b', 900: '#0f172a', 950: '#020617' }
};

export const getThemeCSS = (palette: ThemePalette) => {
  if (palette === 'emerald') return '';
  const colors = THEME_PALETTES[palette];
  return ':root {\n' +
    '  --color-emerald-50: ' + colors[50] + ';\n' +
    '  --color-emerald-100: ' + colors[100] + ';\n' +
    '  --color-emerald-200: ' + colors[200] + ';\n' +
    '  --color-emerald-300: ' + colors[300] + ';\n' +
    '  --color-emerald-400: ' + colors[400] + ';\n' +
    '  --color-emerald-500: ' + colors[500] + ';\n' +
    '  --color-emerald-600: ' + colors[600] + ';\n' +
    '  --color-emerald-700: ' + colors[700] + ';\n' +
    '  --color-emerald-800: ' + colors[800] + ';\n' +
    '  --color-emerald-900: ' + colors[900] + ';\n' +
    '  --color-emerald-950: ' + colors[950] + ';\n' +
    '}';
};
