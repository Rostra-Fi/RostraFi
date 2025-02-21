import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Card, TeamState } from "../types/team.types";

const initialState: TeamState = {
  teams: {
    "Premium Diamond": [],
    "Premium Gold": [],
    "Premium Silver": [],
    "Premium Bronze": [],
    Others: [],
  },
  loading: false,
  isError: false,
  success: false,
  errorMessage: "",
  successMessage: "",
};

interface SetTeamsPayload {
  sectionName: string;
  selectedTeam: Card[];
}

export const teamsSlice = createSlice({
  name: "Teams",
  initialState,
  reducers: {
    setTeams: (state, action: PayloadAction<SetTeamsPayload>) => {
      const { sectionName, selectedTeam } = action.payload;
      state.teams[sectionName] = selectedTeam;
    },
    setSuccess: (state, action: PayloadAction<string>) => {
      state.success = true;
      state.successMessage = action.payload;
      state.isError = false;
      state.errorMessage = "";
    },
    setError: (state, action: PayloadAction<string>) => {
      state.isError = true;
      state.errorMessage = action.payload;
      state.success = false;
      state.successMessage = "";
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    resetStatus: (state) => {
      state.success = false;
      state.isError = false;
      state.successMessage = "";
      state.errorMessage = "";
    },
  },
});

export const { setTeams, setError, setLoading, setSuccess, resetStatus } =
  teamsSlice.actions;

// Thunk for saving teams
export const saveTeams =
  (teams: TeamState["teams"]) => async (dispatch: any) => {
    try {
      dispatch(setLoading(true));
      const response = await fetch("/api/teams", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(teams),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to save teams");
      }

      dispatch(setSuccess("Teams saved successfully"));
      return data;
    } catch (error) {
      if (error instanceof Error) {
        dispatch(setError(error.message));
      } else {
        dispatch(setError("An unknown error occurred"));
      }
    } finally {
      dispatch(setLoading(false));
    }
  };

export default teamsSlice.reducer;
