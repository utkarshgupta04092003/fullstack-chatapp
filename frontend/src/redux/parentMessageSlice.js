// parentMessageSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  parentMessage: null,
};

const parentMessageSlice = createSlice({
  name: 'parentMessage',
  initialState,
  reducers: {
    setParentMessage: (state, action) => {
      console.log('parent message', action.payload);
      state.parentMessage = action.payload;
    },
  },
});

export const { setParentMessage } = parentMessageSlice.actions;
export default parentMessageSlice.reducer;
