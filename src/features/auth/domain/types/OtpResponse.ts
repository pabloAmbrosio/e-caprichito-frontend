export interface OtpResponse {
  success: true;
  msg: string;
  data: {
    expiresIn: number;
  };
}
