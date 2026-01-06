import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { fetchAccount } from '../../entities/account/api';

export const fetchAccountInfo = createAsyncThunk(
  'account/fetchAccountInfo',
  async (token, { rejectWithValue }) => {
    try {
      const data = await fetchAccount(token);
      return data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const initialState = {
  data: null,
  loading: false,
  error: null,
};

const accountSlice = createSlice({
  name: 'account',
  initialState,
  reducers: {
    clearAccount: (state) => {
      state.data = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAccountInfo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAccountInfo.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchAccountInfo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Не удалось загрузить данные аккаунта';
      });
  },
});

export const { clearAccount } = accountSlice.actions;
export default accountSlice.reducer;
