/**
 * Deep-link URL builders and parsers
 *
 * SINGLE SOURCE OF TRUTH for deep-link URL shape in the SPA.
 */

export function artistDeepLink(slug: string): string {
  return `/?scene=artists&artist=${encodeURIComponent(slug)}`
}

export function venueDeepLink(slug: string): string {
  return `/?scene=venues&venue=${encodeURIComponent(slug)}`
}

export function venueMapDeepLink(slug: string): string {
  return `/?scene=geography&venue=${encodeURIComponent(slug)}`
}

export function timelineYearDeepLink(year: number): string {
  return `/?scene=timeline&year=${year}`
}

export function setlistDeepLink(artistSlug: string, date: string): string {
  return `${artistDeepLink(artistSlug)}&show=${encodeURIComponent(date)}`
}

export function absoluteUrl(path: string, origin?: string): string {
  const base =
    origin ?? (typeof window !== 'undefined' ? window.location.origin : '')
  return `${base}${path}`
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

export function isValidShowDate(value: string | null | undefined): boolean {
  if (!value || !ISO_DATE.test(value)) return false
  const parsed = new Date(`${value}T00:00:00`)
  if (Number.isNaN(parsed.getTime())) return false
  const roundTrip = [
    parsed.getFullYear().toString().padStart(4, '0'),
    (parsed.getMonth() + 1).toString().padStart(2, '0'),
    parsed.getDate().toString().padStart(2, '0'),
  ].join('-')
  return roundTrip === value
}

interface ResolvableConcert {
  date: string
  headlinerNormalized: string
}

export function resolveShow<T extends ResolvableConcert>(
  concerts: T[],
  date: string | null | undefined,
  artistSlug?: string | null
): T | null {
  if (!isValidShowDate(date)) return null
  const onDate = concerts.filter(c => c.date === date)
  if (onDate.length === 0) return null
  if (artistSlug) {
    const withArtist = onDate.find(c => c.headlinerNormalized === artistSlug)
    if (withArtist) return withArtist
  }
  return onDate[0]
}
