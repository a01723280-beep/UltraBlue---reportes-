export type PlantSlug = "cdmx" | "monterrey" | "hermosillo";

export interface Plant {
  slug: PlantSlug;
  name: string;
  fullName: string;
}

export const PLANTS: Plant[] = [
  { slug: "cdmx", name: "CDMX", fullName: "Planta Ciudad de México" },
  { slug: "monterrey", name: "Monterrey", fullName: "Planta Monterrey" },
  { slug: "hermosillo", name: "Hermosillo", fullName: "Planta Hermosillo" },
];

export function getPlant(slug: string): Plant | undefined {
  return PLANTS.find((p) => p.slug === slug);
}

export function isPlantSlug(slug: string): slug is PlantSlug {
  return PLANTS.some((p) => p.slug === slug);
}
