import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    maxSortOrder: 15, // Default value
};

const sortOrderSlice = createSlice({
    name: 'sortOrder',
    initialState,
    reducers: {
        updateSortOrderLimit: (state, action) => {
            state.maxSortOrder = action.payload; 
        },
    },
});

export const { updateSortOrderLimit } = sortOrderSlice.actions;

export default sortOrderSlice.reducer;
