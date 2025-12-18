import UserModel from "../models/user.model";

export type CreateAccountParams = {
  email: string;
  password: string;
  userAgent?: string;
};

export const createAccount = async (data: CreateAccountParams) => {
  // verify if user already exists
  const existingUser = await UserModel.exists({ email: data.email });
  if (existingUser) {
    throw new Error("User with this email already exists");
  }
  // create user
  const user = await UserModel.create({
    email: data.email,
    password: data.password,
  });
  // create verification code
  // send verification email
  // create session
  // sign access and refresh tokens
  // return user and tokens
};
