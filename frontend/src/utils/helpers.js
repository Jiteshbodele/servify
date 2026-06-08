const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export function dayName(n) {
  return DAYS[n] ?? `Day ${n}`;
}

export function formatDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Return YYYY-MM-DD for a future date matching day_of_week (0=Mon). */
export function nextDateForDay(dayOfWeek) {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  while (d.getDay() !== (dayOfWeek + 1) % 7) {
    // JS: 0=Sun; API: 0=Mon → map API day to JS: (dayOfWeek + 1) % 7
    d.setDate(d.getDate() + 1);
  }
  return d.toISOString().slice(0, 10);
}

export function jsDayToApiDay(jsDay) {
  // JS 0=Sun → API 6=Sun, API 0=Mon
  return jsDay === 0 ? 6 : jsDay - 1;
}

/** Resolve catalog service name from a list returned by /api/catalog/services/. */
export function getServiceName(catalog, serviceId) {
  const svc = catalog.find((s) => s.id === serviceId);
  return svc?.name || null;
}

/** Label for a provider-offered service: name + optional id suffix. */
export function providerServiceLabel(catalog, providerService) {
  const name = getServiceName(catalog, providerService.service_id);
  const idShort = providerService.service_id?.slice(0, 8);
  if (name) return `${name} (${idShort}…)`;
  return `Service ${idShort}…`;
}
