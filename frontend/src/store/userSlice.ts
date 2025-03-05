import { createSlice, PayloadAction } from "@reduxjs/toolkit";

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
  isNewUser: boolean;
  userTournaments: Tournament[];
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
  isNewUser: false,
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
    setIsNewUser: (state, action: PayloadAction<boolean>) => {
      state.isNewUser = action.payload;
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
    addUserPoints: (state, action: PayloadAction<number>) => {
      state.points += action.payload;
    },
    removeUserPoints: (state, action: PayloadAction<number>) => {
      state.points -= action.payload;
    },

    setUserData: (state, action: PayloadAction<any>) => {
      const userData = action.payload;
      state.userId = userData._id;
      state.userWalletAddress = userData.walletAddress;
      state.points = userData.points;
      state.tournaments = action.payload.tournaments.length || 0;

      console.log(userData);

      state.isActive = userData.isActive;
      state.lastActivity = userData.lastActivity;
      state.createdAt = userData.createdAt;
      state.updatedAt = userData.updatedAt;
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
      state.userTournaments = [];
      state.isActive = true;
      state.lastActivity = "";
      state.createdAt = "";
      state.updatedAt = "";
      state.isError = false;
      state.error = "";
      state.loading = false;
      state.userCurrentTournament = null;
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
  addUserPoints,
  setUserCurrentTournament,
  setUserTournaments,
  removeUserPoints,
  setIsNewUser,
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
    dispatch(setIsNewUser(data.isNewUser));

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
      console.log(data);

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

export default userSlice.reducer;