export interface ForgotPasswordResponse {
  success: true;
  msg: string;
  data: {
    userId: string;
    channel: 'sms' | 'email';
    maskedDestination: string;
    expiresIn: number;
  };
}
