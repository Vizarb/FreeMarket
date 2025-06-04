// src/utils/buildSearchParams.ts

export function buildSearchParams(params: Record<string, string | number | undefined | null>): string {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== '' && value !== null && value !== undefined) {
      query.append(key, String(value));
    }
  });

  return query.toString();
}
