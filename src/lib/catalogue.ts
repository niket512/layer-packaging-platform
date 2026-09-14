import raw from "@/data/catalogue.json";

export type Product = {
  id: string;
  manufacturer: string;
  name: string;
  design: string;
  material: string;
  sizes_ml: number[];
  size_label: string;
  codes: string;
  tags: string[];
  notes: string;
  neck: string;
  neck_type: string;
  weight: string;
  diameter: string;
  height: string;
  capacity_raw: string;
  alternate_sizes_raw: string;
  group: string;
  review_required: boolean;
  source_file: string;
  page: number;
  file_key: string;
  classification_status: string;
  specification_status: string;
  pouring_performance: string;
  compatibility_status: string;
  material_evidence: string;
  raw_page_text: string;
  image: string;
};

export type DesignFamily = {
  id: string;
  name: string;
  group: string;
  definition: string;
  count: number;
  inventory_status: string;
};

export type Source = {
  key: string;
  name: string;
  manufacturer: string;
  pages: number;
  path: string;
  sha256: string;
  groups: number;
};

export type Reference = {
  name: string;
  image_path: string;
  source_file: string;
  note: string;
};

const data = raw as unknown as {
  products: Product[];
  taxonomy: DesignFamily[];
  sources: Source[];
  references: Reference[];
};

export const products = data.products.filter((p) => p.material?.toUpperCase() !== "PET");
export const taxonomy = data.taxonomy;

const designNames: Record<string, string> = Object.fromEntries(
  (data.taxonomy as DesignFamily[]).map((t) => [t.id, t.name]),
);
export const designName = (id: string) => designNames[id] ?? id;
export const sources = data.sources;
export const references = data.references;

export const manufacturers = Array.from(new Set(products.map((p) => p.manufacturer))).sort();

export const capacities = Array.from(
  new Set(products.flatMap((p) => p.sizes_ml || [])),
).sort((a, b) => a - b);

const isShoulder = (t: string) => /shoulder|neck|waist/i.test(t);

export const shoulderTags = Array.from(
  new Set(products.flatMap((p) => (p.tags || []).filter(isShoulder))),
).sort();

export const featureTags = Array.from(
  new Set(products.flatMap((p) => (p.tags || []).filter((t) => !isShoulder(t)))),
).sort();

export const materials = Array.from(
  new Set(products.map((p) => p.material).filter(Boolean)),
).sort();

export type Filters = {
  query: string;
  group: string;
  designs: string[];
  material: string;
  manufacturer: string;
  capacity: string;
  shoulder: string;
  feature: string;
  source: string;
  reviewOnly: boolean;
  sort: "featured" | "name" | "capacity" | "maker";
};

export const emptyFilters: Filters = {
  query: "",
  group: "Containers",
  designs: [],
  material: "",
  manufacturer: "",
  capacity: "",
  shoulder: "",
  feature: "",
  source: "",
  reviewOnly: false,
  sort: "featured",
};

export function filterProducts(f: Filters): Product[] {
  const q = f.query.trim().toLowerCase();
  let list = products.filter((p) => {
    if (f.group && p.group !== f.group) return false;
    if (f.designs.length && !f.designs.includes(p.design)) return false;
    if (f.material && p.material !== f.material) return false;
    if (f.manufacturer && p.manufacturer !== f.manufacturer) return false;
    if (f.capacity && !(p.sizes_ml || []).includes(Number(f.capacity))) return false;
    if (f.shoulder && !(p.tags || []).includes(f.shoulder)) return false;
    if (f.feature && !(p.tags || []).includes(f.feature)) return false;
    if (f.source && p.file_key !== f.source) return false;
    if (f.reviewOnly && !p.review_required) return false;
    if (q) {
      const hay = [p.name, p.codes, p.manufacturer, p.material, p.size_label, (p.tags || []).join(" ")]
        .join(" ")
        .toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  if (f.sort === "name") list = [...list].sort((a, b) => a.name.localeCompare(b.name));
  if (f.sort === "maker") list = [...list].sort((a, b) => a.manufacturer.localeCompare(b.manufacturer));
  if (f.sort === "capacity")
    list = [...list].sort((a, b) => (a.sizes_ml?.[0] ?? 1e9) - (b.sizes_ml?.[0] ?? 1e9));

  return list;
}

export function productById(id: string) {
  return products.find((p) => p.id === id);
}

const SHORTLIST_KEY = "snaplogo.shortlist";
const COMPARE_KEY = "snaplogo.compare";

function read(key: string): string[] {
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as string[]) : [];
  } catch {
    return [];
  }
}

function write(key: string, ids: string[]) {
  try {
    localStorage.setItem(key, JSON.stringify(ids));
  } catch {
    /* ignore */
  }
}

export const shortlistStore = {
  get: () => read(SHORTLIST_KEY),
  set: (ids: string[]) => write(SHORTLIST_KEY, ids),
};

export const compareStore = {
  get: () => read(COMPARE_KEY),
  set: (ids: string[]) => write(COMPARE_KEY, ids),
};
