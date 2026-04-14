import type { CartIssue } from './CartIssue';

export interface CartValidation {
  valid: boolean;
  issues: CartIssue[];
}
