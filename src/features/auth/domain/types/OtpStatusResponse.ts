export interface OtpStatusResponse {
  success: true;
  data: {
    active: boolean;
    remainingSeconds: number;
    expiresAt: string | null;
  };
}
