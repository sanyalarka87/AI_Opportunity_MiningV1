import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface DashboardFilters {
  lob: string;
  timePeriod: string;
  geography: string;
  segment: string;
}

export interface DashboardState {
  filters: DashboardFilters;
  chatOverlayOpen: boolean;
  promptPanelOpen: boolean;
  drillDownKey: string | null;
}

const initialState: DashboardState = {
  filters: {
    lob: '',
    timePeriod: '',
    geography: '',
    segment: '',
  },
  chatOverlayOpen: false,
  promptPanelOpen: false,
  drillDownKey: null,
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<DashboardFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setChatOverlayOpen: (state, action: PayloadAction<boolean>) => {
      state.chatOverlayOpen = action.payload;
    },
    setPromptPanelOpen: (state, action: PayloadAction<boolean>) => {
      state.promptPanelOpen = action.payload;
    },
    setDrillDownKey: (state, action: PayloadAction<string | null>) => {
      state.drillDownKey = action.payload;
    },
  },
});

export const { setFilters, setChatOverlayOpen, setPromptPanelOpen, setDrillDownKey } = dashboardSlice.actions;
export default dashboardSlice.reducer;
