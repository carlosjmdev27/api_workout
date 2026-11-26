import type {
  AuthResponse,
  IdentityUpdate,
  LoginInput,
  PasswordChange,
  RegisterInput,
  RegisterResponse,
  ResendVerificationInput,
  User,
} from '@gym/shared';
import { request, requestVoidWithBody } from './http-client';

export const authApi = {
  register: (input: RegisterInput): Promise<RegisterResponse> => request('POST', '/auth/register', input),
  login: (input: LoginInput): Promise<AuthResponse> => request('POST', '/auth/login', input),
  /** Always succeeds (202) whether or not the account exists. */
  resendVerification: (input: ResendVerificationInput): Promise<void> =>
    requestVoidWithBody('POST', '/auth/resend-verification', input),
  me: (): Promise<User> => request('GET', '/auth/me'),
  updateIdentity: (input: IdentityUpdate): Promise<User> => request('PUT', '/auth/identity', input),
  changePassword: (input: PasswordChange): Promise<void> => requestVoidWithBody('PUT', '/auth/password', input),
};
