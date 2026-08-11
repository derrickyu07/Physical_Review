import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import healthLogService from './healthLogService';

const initialState = {
    healthLog:null,
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: '',
};

export const createHealthLog = createAsyncThunk(
    'healthLog/create',
  async (data, thunkAPI) => {
    try {
      return await healthLogService.createHealthLog(data);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message,
      );
    }
  },
);


export const healthLogSlice = createSlice({
  name: 'healthLog',
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
      .addCase(createHealthLog.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createHealthLog.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.healthLog = action.payload;
      })
      .addCase(createHealthLog.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
    }
})
