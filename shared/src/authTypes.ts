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
