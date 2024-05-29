// store.js
import { configureStore } from '@reduxjs/toolkit';
import messageReducer from './messageSlice';
import userReducer from './userSlice';
import themeReducer from './themeSlice';

const store = configureStore({
  reducer: {
    messages: messageReducer,
    user: userReducer,
    theme: themeReducer,
  },
});

export default store;
