/**
 * Normalize venue name to match keys in venues-metadata.json
 *
 * Applies the same normalization logic as the venue enrichment script:
 * - Convert to lowercase
 * - Remove all non-alphanumeric characters
 * - Trim whitespace
 *
 * @example
 * normalizeVenueName("The Coach House") // => "thecoachhouse"
 * normalizeVenueName("Irvine Meadows") // => "irvinemeadows"
 */
export function normalizeVenueName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')
    .trim()
}
