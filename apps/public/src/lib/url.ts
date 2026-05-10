const base = import.meta.env.BASE_URL.replace(/\/$/, "");

export function withBase(path: string): string {
  if (!path) return base || "/";
  if (/^([a-z]+:)?\/\//i.test(path)) return path;
  if (path.startsWith("#") || path.startsWith("mailto:") || path.startsWith("tel:")) {
    return path;
  }
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `${base}${clean}`;
}
