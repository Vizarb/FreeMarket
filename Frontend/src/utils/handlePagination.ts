interface PaginationPayload<T> {
  results: T[];       // Array of data items of type T
  next: string | null; // URL or token to get the next page (null if no more pages)
}


interface PaginationMeta {
  arg: { append?: boolean }; // append = true means we should append to existing data
}


interface PaginationState<T> {
  results: T[];          // Currently stored data
  nextPage: string | null; // Pointer to next page
}


export function handlePagination<T>(
  state: PaginationState<T>,
  payload: PaginationPayload<T>,
  meta: PaginationMeta,
  getId: (item: T) => string | number
): void {
  const { results, next } = payload;

  if (meta.arg.append) {
    const existingIds = new Set(state.results.map(getId));
    const newResults = results.filter((item) => !existingIds.has(getId(item)));

    state.results = [...state.results, ...newResults];
  } else {
    state.results = results;
  }

  state.nextPage = next;
}

