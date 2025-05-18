// auth

import { ChatServiceTypes } from "./chatTypes";

// GET  /api/auth/verify-jwt - verify JWT token
// GET  /api/auth/refresh    - For extending (only if logged in)

// POST /api/auth/register   - For new user registration
// POST /api/auth/login      - For user authentication
// POST /api/users/getusernames                     - For retrieving an arbitrary length mapping of usernames => send JSON list ["13", "1"]

// GET  /api/auth/logout/:inputUserId               - For ending sessions (currently useless bc Florian)
// GET  /api/users/:userId                          - For retrieving user information
// POST /api/users/updatepassword/:inputUserId      - For updating user password
// POST /api/users/updateemail/:inputUserId         - For updating user email
// POST /api/users/updatedisplayname/:inputUserId   - For updating user display name
// POST /api/users/updateimage/:inputUserId         - For updating user image
// GET  /api/users/delete/:inputUserId              - For deleting user account

// GET /api/users/:inputUserId/matches              - For retrieving historical user matches
// GET /api/users/:inputUserId/tournaments          - For retrieving historical user tournaments


enum AuthErrors {
  BadBodyFormat = 1,
  DuplicateEmail,
  DuplicateDisplayName,
  InvalidPassword,
  InvalidEmailFormat,
  UnknownEmail,
  UnknownUserId,
  PasswordTooShort,
  PasswordTooLong,
  PasswordNotAccGuideline,
  LackingAuthorizationHeader,
  LackingIdParamInUri,
  Unauthorized,
  BackendError
}

const authErrorsToMsgMap: Record<AuthErrors, string> = {
  [AuthErrors.BadBodyFormat]:
    "The request body is malformed. Please check your input.",
  [AuthErrors.DuplicateEmail]:
    "That email is already taken. Try a different one.",
  [AuthErrors.DuplicateDisplayName]:
    "That username is already taken. Try a different one.",
  [AuthErrors.InvalidPassword]:
    "Hmm... that password doesn’t look right. Try again?",
  [AuthErrors.InvalidEmailFormat]:
    "The email format is not valid. Please enter a valid email address.",
  [AuthErrors.UnknownEmail]:
    "We couldn’t find an account with that email.",
  [AuthErrors.UnknownUserId]:
    "User with that ID does not exist.",
  [AuthErrors.PasswordTooShort]:
    "Your password is too short. Please add a few more characters.",
  [AuthErrors.PasswordTooLong]:
    "Your password is too long. Please shorten it a bit.",
  [AuthErrors.PasswordNotAccGuideline]:
    "Your password must meet our security guidelines.",
  [AuthErrors.LackingIdParamInUri]:
    "The URI is missing a required parameter for UserId.",
  [AuthErrors.LackingAuthorizationHeader]:
    "The authorization header is missing. Please log in.",
  [AuthErrors.Unauthorized]:
    "You are not authorized to perform this action.",
  [AuthErrors.BackendError]:
    "Oops! Something went wrong on our end. Please try again later.",
};

declare namespace AuthServiceTypes {

  type JwtType = {
    userId: string;
  };
  // When duration meta-info is supplied during signing, this ends up being the JWT payload
  // {
  //   "userId": 123,
  //   "iat": 1714471255,  // "issued at"
  //   "exp": 1714471285   // "expires"
  // }
  
  type RegSubmissionBody = {
    email: string;
    displayName: string;
    password: string;
  };

  type ErrorResponseBody = {
    reason: AuthErrors;
  };

  type AuthSuccessResponseBody = {
    // both for Login and for Refresh
    clientId: string;
    jwtToken: string;
  };

  type UpdateEmailBody = {
    email: string;
  }

  type UpdatePasswordBody = {
    password: string;
  }

  type UpdateDisplayNameBody = {
    displayName: string;
  };

  type UpdateImageBody = {
    image: ChatServiceTypes.BufferLike;
  }

  type UserType = {
    id: string;
    email: string;
    pw_hash: string;
    display_name: string;
    image: ChatServiceTypes.BufferLike;
    online_status: number;
    login_count: number;
    created_at: string;
  };

  type LoginSubmissionBody = Pick<RegSubmissionBody, "email" | "password">

  type UserIdsToNamesMapping = {
    [userId: string]: string | null;
  };

  type RegSuccessResponseBody = UserIdsToNamesMapping;  // + status code 201

  type VerifySuccessResponseBody = {
    userId: string
  };

  type LogoutSuccessResponseBody = {
    // status code 200
  };
}

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

function isRegSubmissionBody(arg: any): arg is AuthServiceTypes.RegSubmissionBody {
  return (
    typeof arg === "object" &&
    arg !== null &&
    typeof arg.email === "string" &&
    typeof arg.password === "string" &&
    typeof arg.displayName === "string"
  )
}

function isLoginSubmissionBody(arg: any): arg is AuthServiceTypes.LoginSubmissionBody {
  return (
    typeof arg === "object" &&
    arg !== null &&
    typeof arg.email === "string" &&
    typeof arg.password === "string"
  )
}

function isUpdateEmailBody(arg: any): arg is AuthServiceTypes.LoginSubmissionBody {
  return (
    typeof arg === "object" &&
    arg !== null &&
    typeof arg.email === "string"
  )
}

function isUpdatePasswordBody(arg: any): arg is AuthServiceTypes.UpdatePasswordBody {
  return (
    typeof arg === "object" &&
    arg !== null &&
    typeof arg.password === "string"
  )
}

function isUpdateDisplayNameBody(arg: any): arg is AuthServiceTypes.UpdateDisplayNameBody {
  return (
    typeof arg === "object" &&
    arg !== null &&
    typeof arg.displayName === "string"
  )
}

function isUpdateImageBody(arg: any): arg is AuthServiceTypes.UpdateImageBody {
  return (
    typeof arg === "object" &&
    arg !== null &&
    Buffer.isBuffer(arg.image)
  )
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
  isRegSubmissionBody,
  isLoginSubmissionBody,
  isUpdateEmailBody,
  isUpdatePasswordBody,
  isUpdateDisplayNameBody,
  isUpdateImageBody
} as const;


export {
  AuthErrors,
  AuthServiceTypes,
  authErrorsToMsgMap,
  testUserConfig,
  authServiceTypeGuards
};
