export interface CheckIdentifierResponse {
  success: true;
  msg: string;
  data: {
    exists: boolean;
  };
}
