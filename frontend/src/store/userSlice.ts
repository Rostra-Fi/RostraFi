import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState = {
  userWalletAddress: "",
  userId: "",
  currentTournament: "",
  points: 0,
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
      console.log(action.payload);
    },
    setCurrentTournament: (state, action: PayloadAction<string>) => {
      state.currentTournament = action.payload;
    },
    setUserPoints: (state, action: PayloadAction<number>) => {
      state.points = action.payload;
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
      state.isError = false;
      state.error = "";
      state.loading = false;
    },
  },
});

export const {
  setUserId,
  setUserPoints,
  setError,
  resetError,
  logoutUser,
  setLoading,
  setUserWalletAddress,
  setCurrentTournament,
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
      throw new Error(data.message || "Failed to save teams");
    }

    dispatch(setUserWalletAddress(data.data.walletAddress));
    dispatch(setUserId(data.data._id));
    return data.walletAddress;
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

export default userSlice.reducer;
