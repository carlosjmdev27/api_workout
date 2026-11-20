import type { AuthResponse, LoginInput, RegisterInput, User } from '@gym/shared';
import { request } from './http-client';

export const authApi = {
  register: (input: RegisterInput): Promise<AuthResponse> => request('POST', '/auth/register', input),
  login: (input: LoginInput): Promise<AuthResponse> => request('POST', '/auth/login', input),
  me: (): Promise<User> => request('GET', '/auth/me'),
};
