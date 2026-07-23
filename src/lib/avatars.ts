/**
 * Generates an inline SVG data URI for an initials avatar.
 * Uses the accent color for a cohesive look with the Marque design system.
 */
export function initialsAvatar(name: string, size = 48): string {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <rect width="${size}" height="${size}" rx="${size / 2}" fill="oklch(0.58 0.22 27 / 0.15)"/>
    <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle"
          font-family="'Inter Tight', system-ui, sans-serif"
          font-size="${Math.round(size * 0.38)}"
          font-weight="600"
          font-style="italic"
          fill="oklch(0.58 0.22 27)">${initials}</text>
  </svg>`;

  return `data:image/svg+xml;base64,${btoa(svg)}`;
}
