import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import activityService from './activityService';

const initialState = {
  activity: null,
  activities: [],
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: null,
};

export const createActivity = createAsyncThunk(
  'activity/create',
  async (activityData, thunkAPI) => {
    try {
      return await activityService.createActivity(activityData);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message,
      );
    }
  },
);

export const editActivity = createAsyncThunk(
  'activity/edit',
  async ({ id, activityData }, thunkAPI) => {
    try {
      return await activityService.editActivity(id, activityData);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message,
      );
    }
  },
);
export const getActivity = createAsyncThunk(
  'activity/get',
  async (id, thunkAPI) => {
    try {
      return await activityService.getActivity(id);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message,
      );
    }
  },
);
export const getActivities = createAsyncThunk(
  'activity/getAll',
  async (_, thunkAPI) => {
    try {
      return await activityService.getActivities();
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message,
      );
    }
  },
);

export const deleteActivity = createAsyncThunk(
  'activity/delete',
  async (id, thunkAPI) => {
    try {
      await activityService.deleteActivity(id);
      return id;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message,
      );
    }
  },
);

export const activitySlice = createSlice({
  name: 'activity',
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
      .addCase(createActivity.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createActivity.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.activity = action.payload;
      })
      .addCase(createActivity.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
    builder
      .addCase(editActivity.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(editActivity.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.activity = action.payload;
      })
      .addCase(editActivity.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
    builder
      .addCase(getActivity.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getActivity.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.activity = action.payload;
      })
      .addCase(getActivity.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
    builder
      .addCase(getActivities.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getActivities.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.activities = action.payload;
      })
      .addCase(getActivities.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(deleteActivity.fulfilled, (state, action) => {
        state.activities = state.activities.filter(
          (a) => a._id !== action.payload,
        );
      })
      .addCase(deleteActivity.rejected, (state, action) => {
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export default activitySlice.reducer;
export const { reset } = activitySlice.actions;
