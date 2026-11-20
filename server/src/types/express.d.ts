// Adds the authenticated user to Express requests (set by the authenticate middleware).
export interface AuthenticatedUser {
  id: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}
