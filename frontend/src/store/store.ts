import { configureStore } from "@reduxjs/toolkit";
import teamsReducer from "./teamsSlice";
import allSectionAndTeamsReducer from "./allSectionsAndTeamsSlice";

export const store = configureStore({
  reducer: {
    teams: teamsReducer,
    allData: allSectionAndTeamsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
// export default store;
