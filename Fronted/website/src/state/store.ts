import { configureStore, createSlice } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage"; // Using localStorage to persist state in the browser
import { combineReducers } from "redux";

// Create a slice for user state
const userSlice = createSlice({ // A slice represents a single piece of state and its reducers
    name: "user", // The name of the slice
    initialState: { // Initial values for the slice
        firstName: "",
        lastName: "",
        email: "",
        createdAt: "",
    },
    reducers: { // Reducers are functions that define how the state can be updated
        setUser: (state, action) => { // action.payload contains the new data for the state
            state.firstName = action.payload.firstName;
            state.lastName = action.payload.lastName;
            state.email = action.payload.email;
            state.createdAt = action.payload.createdAt;
        },
    },
});

export const { setUser } = userSlice.actions; // Export actions to update the state from components

// Combine multiple reducers into one root reducer (useful if you add more slices in the future)
const rootReducer = combineReducers({
  user: userSlice.reducer,
});

// Configuration for redux-persist
const persistConfig = {
  key: "root",         // Key used in localStorage to store the state
  storage,             // Define the storage engine (here, localStorage)
  whitelist: ["user"], // Only persist the 'user' slice (you can add more slices if needed)
};

// Wrap the rootReducer with persistReducer to enable persistence
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Create the Redux store using the persisted reducer
export const store = configureStore({
    reducer: persistedReducer, // Use persistedReducer instead of the plain rootReducer
});

// Create a persistor to control persisting and rehydration
export const persistor = persistStore(store); // PersistGate will use this to wait until state is loaded
