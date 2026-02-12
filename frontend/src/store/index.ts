import { configureStore } from '@reduxjs/toolkit';
import dashboardReducer from './dashboardSlice';
import promptReducer from './promptSlice';
import segmentationReducer from './segmentationSlice';

export const store = configureStore({
  reducer: {
    dashboard: dashboardReducer,
    prompt: promptReducer,
    segmentation: segmentationReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
