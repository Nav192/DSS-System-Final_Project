export interface AHPCalculateResponse {
  weights: number[];
  cr: number;
  is_consistent: boolean;
  message: string;
  criteria: string[];
}
