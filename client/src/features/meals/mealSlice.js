import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import mealService from './mealService';

const initialState = {
  meal: null,
  meals: [],
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: '',
};

export const createMeal = createAsyncThunk(
  'meal/create',
  async (mealData, thunkAPI) => {
    try {
      return await mealService.createMeal(mealData);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message,
      );
    }
  },
);

export const editMeal = createAsyncThunk(
  'meal/edit',
  async ({ id, mealData }, thunkAPI) => {
    try {
      return await mealService.editMeal(id, mealData);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message,
      );
    }
  },
);
export const getMeal = createAsyncThunk('meal/get', async (id, thunkAPI) => {
  try {
    return await mealService.getMeal(id);
  } catch (error) {
    return thunkAPI.rejectWithValue(
      error.response?.data?.message || error.message,
    );
  }
});
export const getMeals = createAsyncThunk('meal/getAll', async (_, thunkAPI) => {
  try {
    return await mealService.getMeals();
  } catch (error) {
    return thunkAPI.rejectWithValue(
      error.response?.data?.message || error.message,
    );
  }
});

export const deleteMeal = createAsyncThunk(
  'meal/delete',
  async (id, thunkAPI) => {
    try {
      await mealService.deleteMeal(id);
      return id;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message,
      );
    }
  },
);

export const mealSlice = createSlice({
  name: 'meal',
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
      .addCase(createMeal.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createMeal.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.meal = action.payload;
      })
      .addCase(createMeal.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(editMeal.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(editMeal.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.meal = action.payload;
      })
      .addCase(editMeal.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(getMeal.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getMeal.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.meal = action.payload;
      })
      .addCase(getMeal.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(getMeals.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getMeals.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.meals = action.payload;
      })
      .addCase(getMeals.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
            .addCase(deleteMeal.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteMeal.fulfilled, (state, action) => {
        state.meals = state.meals.filter((m) => m._id !== action.payload);
      })
      .addCase(deleteMeal.rejected, (state, action) => {
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export default mealSlice.reducer;
export const { reset } = mealSlice.actions;
