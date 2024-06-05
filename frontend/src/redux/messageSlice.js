// messageSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { addDocumentRoute, addMessageRoute } from "../Routes";
import getAccessTokenFromCookie from "../utils/getAccessToken";
const initialState = {
  messages: [],
  status: "idle",
  error: null,
};
// Define the thunk action for adding a message
export const addMessage = createAsyncThunk(
  "messages/addMessage",
  async (payload, { rejectWithValue }) => {
    try {
      const headers = {
        Authorization: `Bearer ${getAccessTokenFromCookie()}`,
      };
      const response = await axios.post(
        addMessageRoute,
        {
          message: payload.input,
          messageType: payload.messageType || "text",
          receiver: payload.receiverId,
          fileName: payload.fileName,
          parentMessage: payload.parentMessage,
        },
        { headers }
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);
// Define the thunk action for uploading a file
// manually add the file to the form data and update in db
export const uploadFile = createAsyncThunk(
  "messages/uploadFile",
  async (payload, { rejectWithValue }) => {
    try {
      const headers = {
        Authorization: `Bearer ${getAccessTokenFromCookie()}`,
        "Content-Type": "multipart/form-data",
      };
      const formData = new FormData();
      formData.append("photos", payload.photos);
      formData.append("receiver", payload.receiverId);
      formData.append("messageType", "image");
      const response = await axios.post(addDocumentRoute, formData, {
        headers,
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);
const messageSlice = createSlice({
  name: "messages",
  initialState,
  reducers: {
    setMessages: (state, action) => {
      state.messages = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Handling addMessage
      .addCase(addMessage.pending, (state) => {
        state.status = "loading";
      })
      .addCase(addMessage.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.messages.push(action.payload);
      })
      .addCase(addMessage.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Handling uploadFile
      .addCase(uploadFile.pending, (state) => {
        state.status = "loading";
      })
      .addCase(uploadFile.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.messages.push(action.payload);
      })
      .addCase(uploadFile.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});
export const { setMessages } = messageSlice.actions;
export default messageSlice.reducer;
