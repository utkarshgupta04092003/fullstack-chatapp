// parentMessageSlice.js
import { createSlice } from '@reduxjs/toolkit';
const initialState = {
  parentMessage: "",
};
const parentMessageSlice = createSlice({
  name: 'parentMessage',
  initialState,
  reducers: {
    setParentMessage: (state, action) => {
      state.parentMessage = action.payload;
    },
  },
});
export const { setParentMessage } = parentMessageSlice.actions;
export default parentMessageSlice.reducer;
