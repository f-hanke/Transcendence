export enum AuthErrors {
  DuplicateEmail = 30,
  InvalidPassword,
  UnknownEmail,
  PasswordTooShort,
  PasswordTooLong,
  PasswordNotAccGuideline,
  LackingAuthorizationHeader,
  Unauthorized,
  BackendError
}

export type JwtType = {
  userId: number;
  expiresIn: string;
};

function isErrorResponseBody(arg: any): arg is AuthServiceTypes.ErrorResponseBody {
  return (
    typeof arg === "object" &&
    arg !== null &&
    "reason" in arg &&
    Object.values(AuthErrors).includes(((arg as any).reason))
  )
}

declare namespace AuthServiceTypes {
  type RegSubmissionBody = {
    email: string;
    displayName: string;
    password: string;
    // confirmPassword: string;
  };

  type LoginSubmissionBody = {
    email: string;
    password: string;
  };

  type UpdateBody = {
    email: string;
    displayName: string;
    password: string;
    image: string;
  };

  type ErrorResponseBody = {
    reason: AuthErrors;
  };

  type ErrorDuck = {
    reason: AuthErrors;
  };

  type RegSuccessResponseBody = {
    // status code 201
  };

  type AuthSuccessResponseBody = {
    // both for Login and for Refresh
    clientId: string;
    jwtToken: string;
  }

  type LogoutSuccessResponseBody = {
    // status code 200
  }

}

// POST /api/auth/register   - For new user registration
// POST /api/auth/login      - For user authentication
// GET  /api/auth/logout     - For ending sessions (only if logged in)
// GET  /api/auth/refresh    - For extending (only if logged in)

const authServiceTypeGuards = {} as const;

export { AuthServiceTypes };
