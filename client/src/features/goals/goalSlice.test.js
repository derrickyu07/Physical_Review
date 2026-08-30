import {describe, it, expect} from 'vitest';
import reducer, {
    reset, createGoal, editGoal, getGoals, getGoal,
} from './goalSlice'

const initialState  = {
    goal: null,
    goals: [],
    isLoading: false,
    isSuccess:false,
    isError:false,
    message:'',
};

describe('goalSlice reducer',()=>{
    it('reset clears loading/success/error/message but leaves goal data alone',()=>{
        const dirtyState = {
            ...initialState,
            isLoading: true,
            isSuccess: true,
            iserror: true,
            message:'something went wrong',
            goals:[{_id:'1',goalType:'weight loss'}]
        }
        const result = reducer(dirtyState, reset());

        expect(result.isLoading).toBe(false);
        expect(result.isSuccess).toBe(false);
        expect(result.isError).toBe(false);
        expect(result.message).toBe('')
        expect(result.goals).toEqual([{_id:'1',goalType:'weight loss'}])
})
describe.each([
    ['creategoal', createGoal],
    ['editgoal',editGoal],
    ['getgoal',getGoal],
])('%s lifecycle',(_,thunk)=>{
    it('sets isLoading true on pending',()=>{
        const state=reducer(initialState,{
            type: thunk.pending.type});
            expect(state.isLoading).toBe(true);
        });
    it('sets goal, isSuccess true, isLoading false on fulfilled',()=>{
        const payload = {
            _id:'1', goalType: 'weight loss'
        };
        const state = reducer(
            {...initialState, isLoading:true},
            {type: thunk.fulfilled.type, payload},
        );
        expect(state.isLoading).toBe(false)
        expect(state.isSuccess).toBe(true);
        expect(state.goal).toEqual(payload);
    })
    it('sets isError true and message on rejected, without touching goal',()=>{
        const state = reducer(
            {...initialState, isLoading: true},
            {type: thunk.rejected.type, payload: 'Request failed'}
        );
        expect( state.isLoading).toBe(false);
        expect(state.isError).toBe(true);
        expect(state.message).toBe('Request failed');
        expect(state.goal).toBe('Request failed');
        expect(state.goal).toBeNull();
    });
    })
})

 describe('getgoals lifecycle', () => {
    it('sets isLoading true on pending', () => {
      const state = reducer(initialState, { type: getGoals.pending.type });
      expect(state.isLoading).toBe(true);
    });
 
    it('sets goals array and isSuccess true on fulfilled', () => {
      const payload = [{ _id: '1', goalType: 'weight loss' }, { _id: '2', goalType: 'muscle gain' }];
      const state = reducer(
        { ...initialState, isLoading: true },
        { type: getGoals.fulfilled.type, payload },
      );
 
      expect(state.isLoading).toBe(false);
      expect(state.isSuccess).toBe(true);
      expect(state.goals).toEqual(payload);
    });
 
    it('sets isError true and message on rejected', () => {
      const state = reducer(
        { ...initialState, isLoading: true },
        { type: getGoals.rejected.type, payload: 'Failed to load goals' },
      );
 
      expect(state.isLoading).toBe(false);
      expect(state.isError).toBe(true);
      expect(state.message).toBe('Failed to load goals');
    });
  });