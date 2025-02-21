export interface Card {
  title: string;
  description: string;
  src: string;
  content: () => React.ReactNode | string;
}

export interface TeamState {
  teams: {
    [key: string]: Card[];
  };
  loading: boolean;
  isError: boolean;
  success: boolean;
  errorMessage: string;
  successMessage: string;
}
