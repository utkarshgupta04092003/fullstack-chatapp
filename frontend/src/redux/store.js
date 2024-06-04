// store.js
import { configureStore } from '@reduxjs/toolkit';
import messageReducer from './messageSlice';
import userReducer from './userSlice';
import themeReducer from './themeSlice';
import parentMessageReducer from './parentMessageSlice';

const store = configureStore({
  reducer: {
    messages: messageReducer,
    user: userReducer,
    theme: themeReducer,
    parentMessage: parentMessageReducer,
  },
});

export default store;
