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

enum AuthErrors {
  DuplicateEmail,
  InvalidPassword,
  UnknownEmail,
  PasswordTooShort,
  PasswordTooLong,
  PasswordNotAccGuideline,
  BackendError
}

const authErrorsToMsgMap: Record<AuthErrors, string> = {
  [AuthErrors.DuplicateEmail]: "That email is already taken. Try logging in or use a different one.",
  [AuthErrors.InvalidPassword]: "Hmm... that password doesn’t look right. Try again?",
  [AuthErrors.UnknownEmail]: "We couldn’t find an account with that email.",
  [AuthErrors.PasswordTooShort]: "Your password is a bit too short. Add a few more characters.",
  [AuthErrors.PasswordTooLong]: "That’s a mighty long password! Try shortening it a bit.",
  [AuthErrors.PasswordNotAccGuideline]: "Your password must meet our security guidelines.",
  [AuthErrors.BackendError]: "Oops! Something went wrong on our end. Please try again later.",
}

// POST /api/auth/register   - For new user registration
// POST /api/auth/login      - For user authentication
// POST /api/auth/logout     - For ending sessions (only if logged in)
// POST /api/auth/refresh    - For extending (only if logged in)

function isErrorResponseBody(obj: any): obj is AuthServiceTypes.ErrorResponseBody
{
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'reason' in obj &&
    typeof (obj as any).reason === 'number' &&
    Object.values(AuthErrors).includes((obj as any).reason)
  ); 
}

const authServiceTypeGuards = {
  isErrorResponseBody
} as const;

export type { 
  AuthServiceTypes 
};

export {
  authServiceTypeGuards,
  authErrorsToMsgMap
}





