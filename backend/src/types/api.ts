export type ApiSuccess<T> = {
  success: true;
  data: T;
};

export type ApiFailure = {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};

export type AuthContext = {
  userId: string;
  role?: "student" | "mentor" | "admin";
};

declare global {
  namespace Express {
    interface Request {
      platformAuth?: AuthContext;
    }
  }
}
