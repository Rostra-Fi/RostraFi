import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface TournamentPoint {
  tournamentId: string;
  points: number;
  teamSelectionPoints: number;
  createdAt: string;
}

interface UserState {
  userWalletAddress: string;
  userId: string;
  currentTournament: string;
  points: number;
  tournamentPoints: TournamentPoint[];
  isActive: boolean;
  lastActivity: string;
  createdAt: string;
  updatedAt: string;
  isError: boolean;
  error: string;
  loading: boolean;
}

const initialState: UserState = {
  userWalletAddress: "",
  userId: "",
  currentTournament: "",
  points: 0,
  tournamentPoints: [],
  isActive: true,
  lastActivity: "",
  createdAt: "",
  updatedAt: "",
  isError: false,
  error: "",
  loading: false,
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUserId: (state, action: PayloadAction<string>) => {
      state.userId = action.payload;
    },
    setUserWalletAddress: (state, action: PayloadAction<string>) => {
      state.userWalletAddress = action.payload;
    },
    setCurrentTournament: (state, action: PayloadAction<string>) => {
      state.currentTournament = action.payload;
    },
    setUserPoints: (state, action: PayloadAction<number>) => {
      state.points = action.payload;
    },
    updateTournamentTeamSelectionPoints: (
      state,
      action: PayloadAction<{ tournamentId: string; points: number }>
    ) => {
      const { tournamentId, points } = action.payload;
      const existingTournamentIndex = state.tournamentPoints.findIndex(
        (tp) => tp.tournamentId === tournamentId
      );

      if (existingTournamentIndex >= 0) {
        if (
          state.tournamentPoints[existingTournamentIndex]
            .teamSelectionPoints !== undefined
        ) {
          state.tournamentPoints[existingTournamentIndex].teamSelectionPoints +=
            points;
        } else {
          state.tournamentPoints[existingTournamentIndex].teamSelectionPoints =
            0.0 + points;
        }
      }
    },

    addPoints: (
      state,
      action: PayloadAction<{ tournamentId: string; points: number }>
    ) => {
      const { tournamentId, points } = action.payload;
      const existingTournamentIndex = state.tournamentPoints.findIndex(
        (tp) => tp.tournamentId === tournamentId
      );
      if (existingTournamentIndex >= 0) {
        state.tournamentPoints[existingTournamentIndex].teamSelectionPoints += points;
      } else {
        state.tournamentPoints.push({
          tournamentId,
          points: 0,
          teamSelectionPoints: points,
          createdAt: new Date().toISOString(),
        });
      }
    },

    setUserData: (state, action: PayloadAction<any>) => {
      const userData = action.payload;
      state.userId = userData._id;
      state.userWalletAddress = userData.walletAddress;
      state.points = userData.points;
      console.log(userData);

      state.tournamentPoints =
        userData.tournamentPoints?.map((tp: any) => ({
          ...tp,
          teamSelectionPoints: tp.points !== undefined ? tp.points : 1000,
        })) || [];

      state.isActive = userData.isActive;
      state.lastActivity = userData.lastActivity;
      state.createdAt = userData.createdAt;
      state.updatedAt = userData.updatedAt;
    },
    updateTournamentPoints: (state, action: PayloadAction<TournamentPoint>) => {
      const { tournamentId, points, teamSelectionPoints } = action.payload;
      const existingTournamentIndex = state.tournamentPoints.findIndex(
        (tp) => tp.tournamentId === tournamentId
      );

      if (existingTournamentIndex >= 0) {
        state.tournamentPoints[existingTournamentIndex].points = points;
        if (teamSelectionPoints !== undefined) {
          state.tournamentPoints[existingTournamentIndex].teamSelectionPoints =
            teamSelectionPoints;
        }
      } else {
        state.tournamentPoints.push({
          ...action.payload,
          teamSelectionPoints:
            teamSelectionPoints !== undefined ? teamSelectionPoints : 1000,
        });
      }
    },
    setTournamentPoints: (state, action: PayloadAction<TournamentPoint[]>) => {
      state.tournamentPoints = action.payload.map((tp) => ({
        ...tp,
        teamSelectionPoints:
          tp.teamSelectionPoints !== undefined ? tp.teamSelectionPoints : 1000,
      }));
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.isError = true;
      state.error = action.payload;
    },
    resetError: (state) => {
      state.isError = false;
      state.error = "";
    },
    logoutUser: (state) => {
      state.userId = "";
      state.userWalletAddress = "";
      state.points = 0;
      state.tournamentPoints = [];
      state.isActive = true;
      state.lastActivity = "";
      state.createdAt = "";
      state.updatedAt = "";
      state.isError = false;
      state.error = "";
      state.loading = false;
    },
  },
});

export const {
  setUserId,
  setUserPoints,
  setUserData,
  setError,
  resetError,
  logoutUser,
  setLoading,
  setUserWalletAddress,
  setCurrentTournament,
  updateTournamentPoints,
  updateTournamentTeamSelectionPoints,
  setTournamentPoints,
  addPoints, 
} = userSlice.actions;

export const userWalletConnect = (userId: string) => async (dispatch: any) => {
  try {
    dispatch(setLoading(true));
    const response = await fetch("http://127.0.0.1:3001/api/v1/walletUser", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        walletAddress: userId,
      }),
    });

    const data = await response.json();
    console.log(data);

    if (!response.ok) {
      throw new Error(data.message || "Failed to connect wallet");
    }

    dispatch(setUserData(data.data));

    return data.data.walletAddress;
  } catch (e) {
    if (e instanceof Error) {
      dispatch(setError(e.message));
    } else {
      dispatch(setError("An unknown error occurred"));
    }
  } finally {
    dispatch(setLoading(false));
  }
};

export const getTournamentPoints = (
  state: { user: UserState },
  tournamentId: string
): number => {
  const tournamentPoint = state.user.tournamentPoints.find(
    (tp) => tp.tournamentId === tournamentId
  );
  return tournamentPoint ? tournamentPoint.points : 0;
};

export const getTournamentTeamSelectionPoints = (
  state: { user: UserState },
  tournamentId: string
): number => {
  const tournamentPoint = state.user.tournamentPoints.find(
    (tp) => tp.tournamentId === tournamentId
  );
  console.log(tournamentId);
  return tournamentPoint && tournamentPoint.teamSelectionPoints !== undefined
    ? tournamentPoint.teamSelectionPoints
    : 0.0;
};

export default userSlice.reducer;