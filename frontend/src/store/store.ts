import { configureStore } from "@reduxjs/toolkit";
import teamsReducer from "./teamsSlice";
import allSectionAndTeamsReducer from "./allSectionsAndTeamsSlice";
import userSliceReducer from "./userSlice";
import tournamentsReducer from "./tournamentSlice";

export const store = configureStore({
  reducer: {
    teams: teamsReducer,
    allData: allSectionAndTeamsReducer,
    user: userSliceReducer,
    tournaments: tournamentsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
// export default store;
