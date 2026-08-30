import {describe, it, expect} from 'vitest';
import reducer, {
    reset, createActivity, editActivity, getActivities, getActivity, deleteActivity,
} from './activitySlice'

const initialState  = {
    activity: null,
    activities: [],
    isLoading: false,
    isSuccess:false,
    isError:false,
    message:'',
};

describe('activitySlice reducer',()=>{
    it('reset clears loading/success/error/message but leaves activity data alone',()=>{
        const dirtyState = {
            ...initialState,
            isLoading: true,
            isSuccess: true,
            iserror: true,
            message:'something went wrong',
            activities:[{_id:'1',activityType:'running'}]
        }
        const result = reducer(dirtyState, reset());

        expect(result.isLoading).toBe(false);
        expect(result.isSuccess).toBe(false);
        expect(result.isError).toBe(false);
        expect(result.message).toBe('')
        expect(result.activities).toEqual([{_id:'1',activityType:'running'}])
})
describe.each([
    ['createActivity', createActivity],
    ['editActivity',editActivity],
    ['getActivity',getActivity],
])('%s lifecycle',(_,thunk)=>{
    it('sets isLoading true on pending',()=>{
        const state=reducer(initialState,{
            type: thunk.pending.type});
            expect(state.isLoading).toBe(true);
        });
    it('sets activity, isSuccess true, isLoading false on fulfilled',()=>{
        const payload = {
            _id:'1', activityType: 'running'
        };
        const state = reducer(
            {...initialState, isLoading:true},
            {type: thunk.fulfilled.type, payload},
        );
        expect(state.isLoading).toBe(false)
        expect(state.isSuccess).toBe(true);
        expect(state.activity).toEqual(payload);
    })
    it('sets isError true and message on rejected, without touching activity',()=>{
        const state = reducer(
            {...initialState, isLoading: true},
            {type: thunk.rejected.type, payload: 'Request failed'}
        );
        expect( state.isLoading).toBe(false);
        expect(state.isError).toBe(true);
        expect(state.message).toBe('Request failed');
        expect(state.activity).toBe('Request failed');
        expect(state.activity).toBeNull();
    });
    })
})

 describe('getActivities lifecycle', () => {
    it('sets isLoading true on pending', () => {
      const state = reducer(initialState, { type: getActivities.pending.type });
      expect(state.isLoading).toBe(true);
    });
 
    it('sets activities array and isSuccess true on fulfilled', () => {
      const payload = [{ _id: '1', activityType: 'running' }, { _id: '2', activityType: 'basketball' }];
      const state = reducer(
        { ...initialState, isLoading: true },
        { type: getActivities.fulfilled.type, payload },
      );
 
      expect(state.isLoading).toBe(false);
      expect(state.isSuccess).toBe(true);
      expect(state.activities).toEqual(payload);
    });
 
    it('sets isError true and message on rejected', () => {
      const state = reducer(
        { ...initialState, isLoading: true },
        { type: getActivities.rejected.type, payload: 'Failed to load activities' },
      );
 
      expect(state.isLoading).toBe(false);
      expect(state.isError).toBe(true);
      expect(state.message).toBe('Failed to load activities');
    });
  });
   describe('deleteActivity lifecycle', () => {
    it('has no pending case — isLoading is unaffected while a delete is in flight', () => {
      // Documents current behavior rather than asserting it's correct —
      // worth confirming this omission (no pending reducer case) is
      // intentional, since every other thunk here does set isLoading.
      const state = reducer(initialState, { type: deleteActivity.pending.type });
      expect(state).toEqual(initialState);
    });
 
    it('removes the deleted activity from the activities array on fulfilled', () => {
      const state = {
        ...initialState,
        activities: [
          { _id: '1', activityType: 'running' },
          { _id: '2', activityType: 'basketball' },
        ],
      };
 
      const result = reducer(state, {
        type: deleteActivity.fulfilled.type,
        payload: '1',
      });
 
      expect(result.activities).toEqual([{ _id: '2', activityType: 'Toast' }]);
    });
 
    it('sets isError and message on rejected without mutating activities', () => {
      const state = { ...initialState, activities: [{ _id: '1', activityType: 'running' }] };
 
      const result = reducer(state, {
        type: deleteActivity.rejected.type,
        payload: 'Delete failed',
      });
 
      expect(result.isError).toBe(true);
      expect(result.message).toBe('Delete failed');
      expect(result.activities).toEqual([{ _id: '1', activityType: 'running' }]);
    });
  });
 
