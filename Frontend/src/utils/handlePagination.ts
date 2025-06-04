interface PaginationPayload<T> {
  results: T[];
  next: string | null;
}

interface PaginationMeta {
  arg: { append?: boolean };
}

interface PaginationState<T> {
  results: T[];
  nextPage: string | null;
}

export function handlePagination<T>(
  state: PaginationState<T>,
  payload: PaginationPayload<T>,
  meta: PaginationMeta
): void {
  const { results, next } = payload;

  state.results = meta.arg.append
    ? [...state.results, ...results]
    : results;

  state.nextPage = next;
}
