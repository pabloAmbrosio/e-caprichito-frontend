export interface ResetPasswordInput {
  userId: string;
  code: string;
  newPassword: string;
}
