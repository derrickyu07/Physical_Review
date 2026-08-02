import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import dashboardService from './dashboardService';

const initialState = {
  calorieSummary: null,
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: '',
};

export const getCalorieSummary = createAsyncThunk(
  'dashboard/get',
  async ({ startDate, endDate }, thunkAPI) => {
    try {
      return await dashboardService.getCalorieSummary(startDate, endDate);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message,
      );
    }
  },
);

export const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getCalorieSummary.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getCalorieSummary.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.calorieSummary = action.payload;
      })

      .addCase(getCalorieSummary.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export default dashboardSlice.reducer;
export const { reset } = dashboardSlice.actions;
