// Vite's import.meta.glob – declare so tsc accepts it (admin is built with tsc but consumed by Vite apps)
interface ImportMeta {
  glob<T = unknown>(
    pattern: string,
    options?: { eager?: boolean; import?: string }
  ): Record<string, T>;
}
