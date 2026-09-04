export function money(n: number) { return Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
export function dateDMY(s?: string | null) { if (!s) return ''; const [y,m,d] = s.slice(0,10).split('-'); return d && m && y ? `${d}/${m}/${y}` : s; }
export function dateRange(a?: string|null,b?: string|null) { return a && b ? `${dateDMY(a)} to ${dateDMY(b)}` : ''; }
