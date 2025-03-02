import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Influencer {
  _id: string;
  title: string;
  description: string;
  image: string;
  points: number;
  voteCost: number;
  yesVotes: number;
  noVotes: number;
  totalVotes: number;
  isActive: boolean;
  startDate: string;
  endDate: string;
  duration: number;
  yesPercentage: number;
  noPercentage: number;
  timeRemaining: number;
  isExpired: boolean;
  id: string;
}

interface ContentState {
  content: Influencer[];
  loading: boolean;
  isError: boolean;
  success: boolean;
  errorMessage: string;
  successMessage: string;
}

const initialState: ContentState = {
  content: [],
  loading: false,
  isError: false,
  success: false,
  errorMessage: "",
  successMessage: "",
};

interface SetContentPayload {
  content: Influencer[];
}

export const contentSlice = createSlice({
  name: "Content",
  initialState,
  reducers: {
    setContent: (state, action: PayloadAction<SetContentPayload>) => {
      state.content = action.payload.content;
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
      state.content = [];
      state.loading = false;
    },
  },
});

export const { setContent, setError, setLoading, setSuccess, resetStatus } =
  contentSlice.actions;

export const fetchContent = () => async (dispatch: any) => {
  try {
    dispatch(setLoading(true));

    const response = await fetch("http://127.0.0.1:3001/api/v1/content");

    const data = await response.json();
    console.log(data);

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch content");
    }

    dispatch(setContent({ content: data.data || data }));
    dispatch(setSuccess("Content fetched successfully"));

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

export default contentSlice.reducer;
