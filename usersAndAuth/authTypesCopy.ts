export enum AuthErrors {
  DuplicateEmail,
  InvalidPassword,
  UnknownEmail,
  PasswordTooShort,
  PasswordTooLong,
  PasswordNotAccGuideline,
  BackendError
}

declare namespace AuthServiceTypes {
  type RegSubmissionBody = {
    email: string;
    displayName: string;
    password: string;
    // confirmPassword: string;
  };

  type ErrorResponseBody = {
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
// POST /api/auth/logout     - For ending sessions (only if logged in)
// POST /api/auth/refresh    - For extending (only if logged in)

const authServiceTypeGuards = {} as const;

export { AuthServiceTypes };
