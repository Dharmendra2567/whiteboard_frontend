import { configureStore } from "@reduxjs/toolkit";
import whiteboardReducer from "./whiteboardSlice";

const STORAGE_KEY = "whiteboard_scene_v1";

const store = configureStore({
  reducer: {
    whiteboard: whiteboardReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // Disable serializable check for whiteboard actions since Excalidraw 
      // elements may contain complex objects
      serializableCheck: {
        ignoredActions: ["whiteboard/setScene", "whiteboard/clearScene"],
        ignoredPaths: ["whiteboard.elements", "whiteboard.appState"],
      },
      // Disable immutability check for whiteboard - Excalidraw needs mutable elements
      immutableCheck: {
        ignoredPaths: ["whiteboard"],
      },
    }),
});

// persist to localStorage on changes (throttle lightly if needed)
store.subscribe(() => {
  try {
    const state = store.getState();
    const payload = state.whiteboard || { elements: [], appState: {} };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (e) {
    console.warn("failed to persist whiteboard state", e);
  }
});

export default store;

