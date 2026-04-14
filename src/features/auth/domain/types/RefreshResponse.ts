export interface RefreshResponse {
  success: true;
  msg: string;
  data: {
    accessToken: string;
  };
}
