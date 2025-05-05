declare namespace AuthServiceTypes {
  type RegSubmissionBody = {
    email: string;
    displayName: string;
    password: string;
    // confirmPassword: string;
  };

  type LoginSubmissionBody = Pick<RegSubmissionBody, "email" | "password">

  type ErrorResponseBody = {
    reason: AuthErrors;
  };

  type RegSuccessResponseBody = {
    // status code 201
  };

  type VerifySuccessResponseBody = {
    userId: string
  };

  type AuthSuccessResponseBody = {
    // both for Login and for Refresh
    clientId: string;
    jwtToken: string;
  };

  type LogoutSuccessResponseBody = {
    // status code 200
  };
}

enum AuthErrors {
  BadBodyFormat = 1,
  DuplicateEmail,
  InvalidPassword,
  InvalidEmailFormat,
  UnknownEmail,
  PasswordTooShort,
  PasswordTooLong,
  PasswordNotAccGuideline,
  LackingAuthorizationHeader,
  Unauthorized,
  BackendError
}

const authErrorsToMsgMap: Record<AuthErrors, string> = {
  [AuthErrors.BadBodyFormat]:
    "The request body is malformed. Please check your input.",
  [AuthErrors.DuplicateEmail]:
    "That email is already taken. Try logging in or use a different one.",
  [AuthErrors.InvalidPassword]:
    "Hmm... that password doesn’t look right. Try again?",
  [AuthErrors.InvalidEmailFormat]:
    "The email format is not valid. Please enter a valid email address.",
  [AuthErrors.UnknownEmail]:
    "We couldn’t find an account with that email.",
  [AuthErrors.PasswordTooShort]:
    "Your password is too short. Please add a few more characters.",
  [AuthErrors.PasswordTooLong]:
    "Your password is too long. Please shorten it a bit.",
  [AuthErrors.PasswordNotAccGuideline]:
    "Your password must meet our security guidelines.",
  [AuthErrors.LackingAuthorizationHeader]:
    "The authorization header is missing. Please log in.",
  [AuthErrors.Unauthorized]:
    "You are not authorized to perform this action.",
  [AuthErrors.BackendError]:
    "Oops! Something went wrong on our end. Please try again later.",
};
// POST /api/auth/register   - For new user registration
// POST /api/auth/login      - For user authentication
// POST /api/auth/logout     - For ending sessions (only if logged in)
// POST /api/auth/refresh    - For extending (only if logged in)

function isErrorResponseBody(
  obj: any
): obj is AuthServiceTypes.ErrorResponseBody {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "reason" in obj &&
    typeof (obj as any).reason === "number" &&
    Object.values(AuthErrors).includes((obj as any).reason)
  );
}

const testUserConfig: AuthServiceTypes.RegSubmissionBody[] = new Array(5).fill(0).map(
  (elem, i) => {
    const user = `test_user_${i}`;
    return {
      email: `${user}@test.de`,
      displayName: `${user}`,
      password: `12345aA?`,
    };
  }
);

const authServiceTypeGuards = {
  isErrorResponseBody,
} as const;

export type { AuthServiceTypes };

export { authServiceTypeGuards, authErrorsToMsgMap, testUserConfig };
