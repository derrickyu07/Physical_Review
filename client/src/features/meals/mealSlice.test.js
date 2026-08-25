import {describe, it, expect} from 'vitest';
import reducer, {
    reset,createMeal,editMeal,getMeal, getMeals,deleteMeal,
} from './mealSlice'

const initialState = {
    meal: null,
    meals: [],
    isLoading: false,
    isSucess: false,
    isError: false,
    message:'',
};

describe('mealSlice reducer',()=>{
    it('returns the initial state for an unknown action',()=>{
        expect(reducer(undefined,{type:'unknown'})).toEqual(initialState);
    });
    it('reset clears loading/success/error/message but leaves meal data alone',()=>{
        const dirtyState = {
            ...initialState,
            isLoading: true,
            isSuccess: true,
            isError: true,
            message:'something went wrong',
            meals:[{_id: '1',name:'Oatmeal'}]
        }
        const result = reducer(dirtyState,reset());

        expect(result.isLoading).toBe(false);
        expect(result.isSuccess).toBe(false);
        expect(result.isError).toBe(false);
        expect(result.message).toBe('')
        expect(result.meals).toEqual([{_id:'1',name:'Oatmeal'}])
    })
  describe.each([
    ['createMeal', createMeal],
    ['editMeal', editMeal],
    ['getMeal', getMeal],
  ])('%s lifecycle', (_, thunk) => {
    it('sets isLoading true on pending', () => {
      const state = reducer(initialState, { type: thunk.pending.type });
      expect(state.isLoading).toBe(true);
    });
 
    it('sets meal, isSuccess true, isLoading false on fulfilled', () => {
      const payload = { _id: '1', name: 'Grilled Chicken' };
      const state = reducer(
        { ...initialState, isLoading: true },
        { type: thunk.fulfilled.type, payload },
      );
 
      expect(state.isLoading).toBe(false);
      expect(state.isSuccess).toBe(true);
      expect(state.meal).toEqual(payload);
    });
 
    it('sets isError true and message on rejected, without touching meal', () => {
      const state = reducer(
        { ...initialState, isLoading: true },
        { type: thunk.rejected.type, payload: 'Request failed' },
      );
 
      expect(state.isLoading).toBe(false);
      expect(state.isError).toBe(true);
      expect(state.message).toBe('Request failed');
      expect(state.meal).toBeNull();
    });
  });
 
  describe('getMeals lifecycle', () => {
    it('sets isLoading true on pending', () => {
      const state = reducer(initialState, { type: getMeals.pending.type });
      expect(state.isLoading).toBe(true);
    });
 
    it('sets meals array and isSuccess true on fulfilled', () => {
      const payload = [{ _id: '1', name: 'Oatmeal' }, { _id: '2', name: 'Toast' }];
      const state = reducer(
        { ...initialState, isLoading: true },
        { type: getMeals.fulfilled.type, payload },
      );
 
      expect(state.isLoading).toBe(false);
      expect(state.isSuccess).toBe(true);
      expect(state.meals).toEqual(payload);
    });
 
    it('sets isError true and message on rejected', () => {
      const state = reducer(
        { ...initialState, isLoading: true },
        { type: getMeals.rejected.type, payload: 'Failed to load meals' },
      );
 
      expect(state.isLoading).toBe(false);
      expect(state.isError).toBe(true);
      expect(state.message).toBe('Failed to load meals');
    });
  });
   describe('deleteMeal lifecycle', () => {
    it('has no pending case — isLoading is unaffected while a delete is in flight', () => {
      // Documents current behavior rather than asserting it's correct —
      // worth confirming this omission (no pending reducer case) is
      // intentional, since every other thunk here does set isLoading.
      const state = reducer(initialState, { type: deleteMeal.pending.type });
      expect(state).toEqual(initialState);
    });
 
    it('removes the deleted meal from the meals array on fulfilled', () => {
      const state = {
        ...initialState,
        meals: [
          { _id: '1', name: 'Oatmeal' },
          { _id: '2', name: 'Toast' },
        ],
      };
 
      const result = reducer(state, {
        type: deleteMeal.fulfilled.type,
        payload: '1',
      });
 
      expect(result.meals).toEqual([{ _id: '2', name: 'Toast' }]);
    });
 
    it('sets isError and message on rejected without mutating meals', () => {
      const state = { ...initialState, meals: [{ _id: '1', name: 'Oatmeal' }] };
 
      const result = reducer(state, {
        type: deleteMeal.rejected.type,
        payload: 'Delete failed',
      });
 
      expect(result.isError).toBe(true);
      expect(result.message).toBe('Delete failed');
      expect(result.meals).toEqual([{ _id: '1', name: 'Oatmeal' }]);
    });
  });
});
 