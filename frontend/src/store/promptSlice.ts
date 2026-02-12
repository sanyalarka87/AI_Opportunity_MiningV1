import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface PromptExecutionState {
  status: 'idle' | 'loading' | 'success' | 'error';
  request: { promptId?: string; promptText: string } | null;
  response: string | null;
  error: string | null;
  visible: boolean;
}

const initialState: PromptExecutionState = {
  status: 'idle',
  request: null,
  response: null,
  error: null,
  visible: false,
};

const promptSlice = createSlice({
  name: 'prompt',
  initialState,
  reducers: {
    startExecution: (state, action: PayloadAction<{ promptId?: string; promptText: string }>) => {
      state.status = 'loading';
      state.request = action.payload;
      state.response = null;
      state.error = null;
      state.visible = true;
    },
    executionSuccess: (state, action: PayloadAction<string>) => {
      state.status = 'success';
      state.response = action.payload;
      state.error = null;
    },
    executionError: (state, action: PayloadAction<string>) => {
      state.status = 'error';
      state.error = action.payload;
      state.response = null;
    },
    setPanelVisible: (state, action: PayloadAction<boolean>) => {
      state.visible = action.payload;
    },
    resetExecution: (state) => {
      state.status = 'idle';
      state.request = null;
      state.response = null;
      state.error = null;
    },
  },
});

export const { startExecution, executionSuccess, executionError, setPanelVisible, resetExecution } = promptSlice.actions;
export default promptSlice.reducer;
