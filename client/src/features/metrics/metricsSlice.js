import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import metricsService from './metricsService';

const initialState = {
  metric: null,
  metrics: [],
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: null,
};

export const createMetric = createAsyncThunk(
  'metric/create',
  async (data, thunkAPI) => {
    try {
      return await metricsService.createMetric(data);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message,
      );
    }
  },
);

export const updateMetric = createAsyncThunk(
  'metric/update',
  async ({id,data}, thunkAPI) => {
    try {
      return await metricsService.upsertMetric(id,data);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message,
      );
    }
  },
);

export const getMetric = createAsyncThunk('metric/get', async (_, thunkAPI) => {
  try {
    return await metricsService.getMetric();
  } catch (error) {
    return thunkAPI.rejectWithValue(
      error.response?.data?.message || error.message,
    );
  }
});

export const metricSlice = createSlice({
  name: 'metric',
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
      .addCase(createMetric.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createMetric.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.metric = action.payload;
      })
      .addCase(createMetric.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(updateMetric.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateMetric.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.metric = action.payload;
      })
      .addCase(updateMetric.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(getMetric.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getMetric.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.metric = action.payload;
      })
      .addCase(getMetric.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export default metricSlice.reducer;
export const { reset } = metricSlice.actions;
