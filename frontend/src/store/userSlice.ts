import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface TournamentPoint {
  tournamentId: string;
  points: number;
  teamSelectionPoints: number;
  createdAt: string;
}

interface Section {
  name: string;
  sectionId: {
    _id: string;
    name: string;
    id: string;
  };
  selectedTeams: Team[];
  _id: string;
  id: string;
}

interface Team {
  _id: string;
  name: string;
  image: string;
  description: string;
  followers: number;
  points: number;
}

interface Tournament {
  _id: string;
  name: string;
  startDate: string;
  endDate: string;
  prizePool: number;
  image: string;
  icon: string;
  platform: string;
  isActive: boolean;
  isOngoing: boolean;
  id: string;
}

interface UserTournament {
  _id: string;
  userId: string;
  walletUserId: string;
  teamName: string;
  sections: Section[];
  tournamentId: Tournament;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  totalFollowers: number;
  id: string;
}

interface UserState {
  userWalletAddress: string;
  userId: string;
  currentTournament: string;
  userCurrentTournament: UserTournament | null;
  points: number;
  tournaments: number;
  tournamentPoints: TournamentPoint[];
  userTournaments: Tournament[];
  isActive: boolean;
  lastActivity: string;
  createdAt: string;
  updatedAt: string;
  isError: boolean;
  error: string;
  loading: boolean;
}

interface AddPointsPayload {
  tournamentId: string;
  points: number;
}

interface DeductPointsPayload {
  tournamentId: string;
  points: number;
}


const initialState: UserState = {
  userWalletAddress: "",
  userId: "",
  currentTournament: "",
  points: 0,
  tournamentPoints: [],
  tournaments: 0,
  isActive: true,
  userCurrentTournament: null,
  userTournaments: [],
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
    setUserCurrentTournament: (
      state,
      action: PayloadAction<UserTournament | null>
    ) => {
      state.userCurrentTournament = action.payload;
    },
    setCurrentTournament: (state, action: PayloadAction<string>) => {
      state.currentTournament = action.payload;
    },
    setUserTournaments: (state, action: PayloadAction<Tournament[]>) => {
      state.userTournaments = action.payload;
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
        // Update existing tournament's teamSelectionPoints
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
    setUserData: (state, action: PayloadAction<any>) => {
      const userData = action.payload;
      state.userId = userData._id;
      state.userWalletAddress = userData.walletAddress;
      state.points = userData.points;
      state.tournaments = action.payload.tournaments.length || 0;
      console.log(userData);

      // Initialize tournamentPoints with teamSelectionPoints if provided, otherwise set default
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
        // Update existing tournament points
        state.tournamentPoints[existingTournamentIndex].points = points;
        if (teamSelectionPoints !== undefined) {
          state.tournamentPoints[existingTournamentIndex].teamSelectionPoints =
            teamSelectionPoints;
        }
      } else {
        // Add new tournament points with default teamSelectionPoints if not provided
        state.tournamentPoints.push({
          ...action.payload,
          teamSelectionPoints:
            teamSelectionPoints !== undefined ? teamSelectionPoints : 1000,
        });
      }
    },
    setTournamentPoints: (state, action: PayloadAction<TournamentPoint[]>) => {
      // Ensure all tournament points have teamSelectionPoints
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
      state.userTournaments = [];
      state.isActive = true;
      state.lastActivity = "";
      state.createdAt = "";
      state.updatedAt = "";
      state.isError = false;
      state.error = "";
      state.loading = false;
      state.userCurrentTournament = null;
    },    // Add the missing addPoints reducer
    addPoints: (state, action: PayloadAction<AddPointsPayload>) => {
      const { tournamentId, points } = action.payload;
      
      // Add to total user points
      state.points += points;
      
      // Add to tournament-specific points
      const existingTournamentIndex = state.tournamentPoints.findIndex(
        (tp) => tp.tournamentId === tournamentId
      );

      if (existingTournamentIndex >= 0) {
        // Update existing tournament's points
        state.tournamentPoints[existingTournamentIndex].points += points;
        
        // Also update teamSelectionPoints if needed
        if (state.tournamentPoints[existingTournamentIndex].teamSelectionPoints !== undefined) {
          state.tournamentPoints[existingTournamentIndex].teamSelectionPoints += points;
        }
      } else {
        // Add new tournament points entry
        state.tournamentPoints.push({
          tournamentId,
          points,
          teamSelectionPoints: points,
          createdAt: new Date().toISOString(),
        });
      }
    },
    deductPoints: (state, action: PayloadAction<DeductPointsPayload>) => {
      const { tournamentId, points } = action.payload;
      
      // Deduct from total user points
      state.points = Math.max(0, state.points - points);
      
      // Deduct from tournament-specific points
      const existingTournamentIndex = state.tournamentPoints.findIndex(
        (tp) => tp.tournamentId === tournamentId
      );
    
      if (existingTournamentIndex >= 0) {
        // Update existing tournament's points
        state.tournamentPoints[existingTournamentIndex].points = 
          Math.max(0, state.tournamentPoints[existingTournamentIndex].points - points);
        
        // Also update teamSelectionPoints if needed
        if (state.tournamentPoints[existingTournamentIndex].teamSelectionPoints !== undefined) {
          state.tournamentPoints[existingTournamentIndex].teamSelectionPoints = 
            Math.max(0, state.tournamentPoints[existingTournamentIndex].teamSelectionPoints - points);
        }
      }
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
  setUserCurrentTournament,
  setUserTournaments,
  addPoints,
  deductPoints,
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

    // Use the new setUserData action to set all user data at once
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

export const userCurrentTournaments =
  (userId: string, walletUserId: string) => async (dispatch: any) => {
    try {
      dispatch(setLoading(true));
      const response = await fetch(
        `http://127.0.0.1:3001/api/v1/userTeams/${walletUserId}/${userId}`
      );

      const data = await response.json();
      console.log(data);

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch user tournaments");
      }

      if (data.status === "success" && data.data && data.data.length > 0) {
        dispatch(setUserCurrentTournament(data.data));
      } else {
        dispatch(setUserCurrentTournament(null));
      }

      return data.data;
    } catch (e) {
      if (e instanceof Error) {
        dispatch(setError(e.message));
      } else {
        dispatch(setError("An unknown error occurred"));
      }
      return null;
    } finally {
      dispatch(setLoading(false));
    }
  };

export const fetchUserTournaments =
  (walletAddress: string) => async (dispatch: any) => {
    try {
      dispatch(setLoading(true));
      const response = await fetch(
        `http://127.0.0.1:3001/api/v1/walletUser/${walletAddress}/tournaments`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch user tournaments");
      }

      if (data.success && data.data) {
        dispatch(setUserTournaments(data.data));
        return data.data;
      } else {
        dispatch(setUserTournaments([]));
        return [];
      }
    } catch (e) {
      if (e instanceof Error) {
        dispatch(setError(e.message));
      } else {
        dispatch(setError("An unknown error occurred"));
      }
      dispatch(setUserTournaments([]));
      return [];
    } finally {
      dispatch(setLoading(false));
    }
  };

// Function to get tournament-specific points
export const getTournamentPoints = (
  state: { user: UserState },
  tournamentId: string
): number => {
  const tournamentPoint = state.user.tournamentPoints.find(
    (tp) => tp.tournamentId === tournamentId
  );
  return tournamentPoint ? tournamentPoint.points : 0;
};

// Function to get tournament-specific team selection points
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