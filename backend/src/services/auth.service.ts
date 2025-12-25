import { JWT_REFRESH_SECRET, JWT_SECRET } from "../constants/env";
import { CONFLICT } from "../constants/http";
import VerificationCodeTypes from "../constants/verificationCodeTypes";
import sessionModel from "../models/session.model";
import UserModel from "../models/user.model";
import verificationCodeModel from "../models/verificationCode.model";
import appAssert from "../utils/appAssert";
import { oneYearFromNow } from "../utils/date";
import jwt from "jsonwebtoken";

export type CreateAccountParams = {
  email: string;
  password: string;
  userAgent?: string;
};

export const createAccount = async (data: CreateAccountParams) => {
  // verify if user already exists
  const existingUser = await UserModel.exists({ email: data.email });
  // if (existingUser) {
  //   throw new Error("User with this email already exists");
  // }

  appAssert(!existingUser, CONFLICT, "User with this email already exists");

  // create user
  const user = await UserModel.create({
    email: data.email,
    password: data.password,
  });
  // create verification code
  const verificationCode = await verificationCodeModel.create({
    userId: user._id,
    type: VerificationCodeTypes.EmailVerification,
    expiresAt: oneYearFromNow(),
  });
  // send verification email
  // create session
  const session = await sessionModel.create({
    userId: user._id,
    userAgent: data.userAgent,
  });
  // sign access and refresh tokens

  const refreshToken = jwt.sign(
    {
      sessionId: session._id,
    },
    JWT_REFRESH_SECRET,
    {
      audience: ["user"],
      expiresIn: "30d",
    }
  );
  const accessToken = jwt.sign(
    {
      userId: user._id,
      sessionId: session._id,
    },
    JWT_SECRET,
    {
      audience: ["user"],
      expiresIn: "30d",
    }
  );
  // return user and tokens
  return {
    user,
    accessToken,
    refreshToken,
  };
};
