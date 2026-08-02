import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import reportService from './reportService';

const initialState = {
  reports: [],
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: '',
};

export const createWeeklyHealthReport = createAsyncThunk(
  'reports/create',
  async (data, thunkAPI) => {
    try {
      return await reportService.createWeeklyHealthReport(data);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message,
      );
    }
  },
);

export const getReports = createAsyncThunk(
  'reports/get',
  async (data, thunkAPI) => {
    try {
      return await reportService.getReports(data);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message,
      );
    }
  },
);

export const deleteReport = createAsyncThunk(
  'reports/delete',
  async(id,thunkAPI)=>{
    try{
      await reportService.deleteReport(id);
      return id
    }catch(error){
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message,
      )
    }
  }
)

export const reportSlice = createSlice({
  name: 'report',
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
      .addCase(createWeeklyHealthReport.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createWeeklyHealthReport.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.report = action.payload;
      })
      .addCase(createWeeklyHealthReport.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(getReports.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
      })
      .addCase(getReports.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.reports = action.payload;
      })
      .addCase(getReports.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(deleteReport.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.message = '';
      })
      .addCase(deleteReport.fulfilled, (state,action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.reports= state.reports.filter((report)=>report._id!==action.payload)
      })
      .addCase(deleteReport.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export default reportSlice.reducer;
export const { reset } = reportSlice.actions;
