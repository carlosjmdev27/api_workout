import type { AuthResponse, LoginInput, PasswordChange, ProfileUpdate, RegisterInput, User } from '@gym/shared';
import { request, requestVoidWithBody } from './http-client';

export const authApi = {
  register: (input: RegisterInput): Promise<AuthResponse> => request('POST', '/auth/register', input),
  login: (input: LoginInput): Promise<AuthResponse> => request('POST', '/auth/login', input),
  me: (): Promise<User> => request('GET', '/auth/me'),
  updateProfile: (input: ProfileUpdate): Promise<User> => request('PUT', '/auth/profile', input),
  changePassword: (input: PasswordChange): Promise<void> => requestVoidWithBody('PUT', '/auth/password', input),
};
