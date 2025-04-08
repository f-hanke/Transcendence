declare namespace AuthServiceTypes {
  type RegisterStateSubmit = {
    email: string;
    displayName: string;
    password: string;
    confirmPassword: string;
  };

  type BadRequestAnswer = {
    errorMessage: string;
  };

  type SuccessRequestAnswer = {
    clientId: string;
    jwtToken: string;
  };
}


const authServiceTypeGuards = {} as const;

export { AuthServiceTypes };


function isRegisterStateSubmit(
  message: any
): message is AuthServiceTypes.RegisterStateSubmit {
  return (
    message?.email &&
    message?.email &&
    message?.displayName &&
    message?.password &&
    message?.confirmPassword &&
    typeof message.data.matchId == "string"
  );
}


