import { Session, SessionData } from 'express-session';
import { Request } from 'express';

declare module 'express-session' {
  interface SessionData {
    user?: {
      id: string;
      username: string | null;
      email: string | null;
      profileImageUrl: string | null;
    };
  }
}

declare global {
  namespace Express {
    interface Request {
      session: Session & {
        user?: {
          id: string;
          username: string | null;
          email: string | null;
          profileImageUrl: string | null;
        };
      };
    }
  }
}