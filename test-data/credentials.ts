export interface Credentials {
  readonly username: string;
  readonly password: string;
}

export const validUser: Credentials = {
  username: process.env.LOGIN_USERNAME ?? 'tomsmith',
  password: process.env.LOGIN_PASSWORD ?? 'SuperSecretPassword!',
};

export const invalidUsername = 'invalid_user';
export const invalidPassword = 'InvalidPassword!';
