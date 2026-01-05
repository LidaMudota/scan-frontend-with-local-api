import { configureStore } from '@reduxjs/toolkit';
import accountReducer from '../features/account/accountSlice';
import searchReducer from '../features/search/searchSlice';

export const store = configureStore({
  reducer: {
    account: accountReducer,
    search: searchReducer,
  },
});
