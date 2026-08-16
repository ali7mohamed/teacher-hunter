export interface SearchFilters {
  subject?: string;
  educationLevel?: string;
  country?: string;
  minSubscribers?: number;
}

export interface SearchRequest {
  query: string;
  filters?: SearchFilters;
}

export interface SearchMeta {
  count: number;
}

export interface SearchResponse<TResult> {
  results: TResult[];
  meta: SearchMeta;
}
