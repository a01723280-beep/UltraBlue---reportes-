export function generateFolio(reportCode: string, plant: string): string {
  const stamp = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 5).toUpperCase();
  return `${reportCode}-${plant.slice(0, 3).toUpperCase()}-${stamp}${rand}`;
}
