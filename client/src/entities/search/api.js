import {
  documentsRequest,
  histogramsRequest,
  objectSearchRequest,
} from '../../shared/api';

export async function fetchHistogramSeries(params, token) {
  const response = await histogramsRequest(params, token);
  return response?.data || [];
}

export async function performObjectSearch(params, token) {
  const response = await objectSearchRequest(params, token);
  return {
    items: response?.items || [],
    params,
  };
}

export async function fetchDocuments(ids, token) {
  if (!ids || ids.length === 0) return [];
  const response = await documentsRequest(ids, token);
  return response;
}

export async function runCombinedSearch(params, token) {
  const [histograms, search] = await Promise.all([
    fetchHistogramSeries(params, token),
    performObjectSearch(params, token),
  ]);

  return {
    histograms,
    items: search.items,
    params: search.params,
  };
}
