import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { Segment, PopulationMetrics } from '../api/client';

export interface SegmentationFilters {
  lob: string;
  timePeriod: string;
  geography: string;
}

export interface SegmentationState {
  filters: SegmentationFilters;
  selectedSegmentId: string | null;
  comparisonMode: boolean;
  comparedSegmentIds: string[];
}

const initialState: SegmentationState = {
  filters: {
    lob: '',
    timePeriod: '',
    geography: '',
  },
  selectedSegmentId: null,
  comparisonMode: false,
  comparedSegmentIds: [],
};

const segmentationSlice = createSlice({
  name: 'segmentation',
  initialState,
  reducers: {
    setSegmentationFilters: (state, action: PayloadAction<Partial<SegmentationFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setSelectedSegmentId: (state, action: PayloadAction<string | null>) => {
      state.selectedSegmentId = action.payload;
    },
    setComparisonMode: (state, action: PayloadAction<boolean>) => {
      state.comparisonMode = action.payload;
    },
    toggleComparedSegment: (state, action: PayloadAction<string>) => {
      if (state.comparedSegmentIds.includes(action.payload)) {
        state.comparedSegmentIds = state.comparedSegmentIds.filter(id => id !== action.payload);
      } else {
        if (state.comparedSegmentIds.length < 3) {
           state.comparedSegmentIds.push(action.payload);
        }
      }
    },
    clearComparedSegments: (state) => {
      state.comparedSegmentIds = [];
    }
  },
});

export const { 
  setSegmentationFilters, 
  setSelectedSegmentId, 
  setComparisonMode, 
  toggleComparedSegment, 
  clearComparedSegments 
} = segmentationSlice.actions;

export default segmentationSlice.reducer;
