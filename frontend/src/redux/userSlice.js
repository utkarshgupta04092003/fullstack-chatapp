// userSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    loginUser: (state, action) => {
        console.log('login user from redux', action.payload);
      state.user = action.payload;
    },
    
  },
});

export const { loginUser } = userSlice.actions;
export default userSlice.reducer;
