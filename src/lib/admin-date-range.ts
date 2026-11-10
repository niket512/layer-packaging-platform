export type AdminDateRange = { from: string; to: string };

export function inAdminDateRange(timestamp: string, range: AdminDateRange): boolean {
  if (!range.from && !range.to) return true;
  if (range.from && range.to && range.from > range.to) return false;
  const time = Date.parse(timestamp);
  if (!Number.isFinite(time)) return false;
  return (!range.from || time >= Date.parse(`${range.from}T00:00:00+05:30`))
    && (!range.to || time <= Date.parse(`${range.to}T23:59:59.999+05:30`));
}