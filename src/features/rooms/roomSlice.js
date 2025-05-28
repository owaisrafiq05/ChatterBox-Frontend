import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { roomService } from '../../services/roomService';

const initialState = {
  rooms: [],
  currentRoom: null,
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: '',
};

// Get all rooms
export const getRooms = createAsyncThunk(
  'rooms/getAll',
  async (_, thunkAPI) => {
    try {
      const response = await roomService.getRooms();
      return response; // The API directly returns the rooms array
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Create new room
export const createRoom = createAsyncThunk(
  'rooms/create',
  async (roomData, thunkAPI) => {
    try {
      const response = await roomService.createRoom(roomData);
      return response; // The API directly returns the created room
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get single room
export const getRoom = createAsyncThunk(
  'rooms/getOne',
  async (roomId, thunkAPI) => {
    try {
      const response = await roomService.getRoom(roomId);
      return response;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Update room status
export const updateRoomStatus = createAsyncThunk(
  'rooms/updateStatus',
  async ({ roomId, status }, thunkAPI) => {
    try {
      const response = await roomService.updateRoomStatus(roomId, status);
      return response;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Join room
export const joinRoom = createAsyncThunk(
  'rooms/join',
  async ({ roomId, accessCode }, thunkAPI) => {
    try {
      const response = await roomService.joinRoom(roomId, accessCode);
      return response;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Leave room
export const leaveRoom = createAsyncThunk(
  'rooms/leave',
  async (roomId, thunkAPI) => {
    try {
      await roomService.leaveRoom(roomId);
      return roomId;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const roomSlice = createSlice({
  name: 'rooms',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    },
    setCurrentRoom: (state, action) => {
      state.currentRoom = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getRooms.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getRooms.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.rooms = action.payload;
      })
      .addCase(getRooms.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.rooms = [];
      })
      .addCase(createRoom.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createRoom.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.rooms.push(action.payload);
      })
      .addCase(createRoom.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(getRoom.fulfilled, (state, action) => {
        state.currentRoom = action.payload;
      })
      .addCase(updateRoomStatus.fulfilled, (state, action) => {
        const index = state.rooms.findIndex((room) => room._id === action.payload._id);
        if (index !== -1) {
          state.rooms[index] = action.payload;
        }
      })
      .addCase(joinRoom.fulfilled, (state, action) => {
        state.isSuccess = true;
        state.currentRoom = action.payload;
      })
      .addCase(leaveRoom.fulfilled, (state, action) => {
        state.isSuccess = true;
        if (state.currentRoom?._id === action.payload) {
          state.currentRoom = null;
        }
      });
  },
});

export const { reset, setCurrentRoom } = roomSlice.actions;
export default roomSlice.reducer; 