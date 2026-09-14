const KEY = "snaplogo.brand";

export function getBrand(): string | null {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function setBrand(brand: string) {
  try {
    localStorage.setItem(KEY, brand);
  } catch {
    /* ignore */
  }
}

export function clearBrand() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
