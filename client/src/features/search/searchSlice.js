import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { documentsRequest, histogramsRequest, objectSearchRequest } from '../../shared/api';

export const runSearch = createAsyncThunk(
  'search/runSearch',
  async ({ payload, token }, { rejectWithValue }) => {
    try {
      const [histograms, objectSearch] = await Promise.all([
        histogramsRequest(payload, token),
        objectSearchRequest(payload, token),
      ]);
      return { histograms, items: objectSearch.items, params: payload };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const loadDocuments = createAsyncThunk(
  'search/loadDocuments',
  async ({ token }, { getState, rejectWithValue }) => {
    const state = getState().search;
    const nextStart = state.loadedCount;
    const nextIds = state.ids.slice(nextStart, nextStart + 10);
    if (nextIds.length === 0) return [];

    try {
      const docs = await documentsRequest(nextIds, token);
      return docs;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const initialState = {
  params: null,
  histograms: [],
  histogramsLoading: false,
  histogramsError: null,
  ids: [],
  docs: [],
  docsLoading: false,
  docsError: null,
  loadedCount: 0,
};

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    resetSearch: () => ({ ...initialState }),
  },
  extraReducers: (builder) => {
    builder
      .addCase(runSearch.pending, (state) => {
        state.histogramsLoading = true;
        state.histogramsError = null;
        state.histograms = [];
        state.ids = [];
        state.docs = [];
        state.docsError = null;
        state.loadedCount = 0;
      })
      .addCase(runSearch.fulfilled, (state, action) => {
        state.histogramsLoading = false;
        state.histograms = action.payload.histograms?.data || [];
        state.ids = (action.payload.items || []).map((item) => item.encodedId);
        state.params = action.payload.params;
      })
      .addCase(runSearch.rejected, (state, action) => {
        state.histogramsLoading = false;
        state.histogramsError = action.payload || 'Не удалось выполнить поиск';
      })
      .addCase(loadDocuments.pending, (state) => {
        state.docsLoading = true;
        state.docsError = null;
      })
      .addCase(loadDocuments.fulfilled, (state, action) => {
        state.docsLoading = false;
        state.docs.push(...action.payload);
        state.loadedCount = Math.min(state.ids.length, state.loadedCount + action.payload.length);
      })
      .addCase(loadDocuments.rejected, (state, action) => {
        state.docsLoading = false;
        state.docsError = action.payload || 'Не удалось загрузить документы';
      });
  },
});

export const { resetSearch } = searchSlice.actions;
export default searchSlice.reducer;
