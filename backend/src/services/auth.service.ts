import { APP_ORIGIN } from "../constants/env";
import {
  CONFLICT,
  INTERNAL_SERVER_ERROR,
  NOT_FOUND,
  UNAUTHORIZED,
} from "../constants/http";
import VerificationCodeTypes from "../constants/verificationCodeTypes";
import sessionModel from "../models/session.model";
import UserModel from "../models/user.model";
import verificationCodeModel from "../models/verificationCode.model";
import appAssert from "../utils/appAssert";
import { ONE_DAY_MS, oneYearFromNow, thirtyDaysFromNow } from "../utils/date";
import { getVerifyEmailTemplate } from "../utils/emailTemplates";
import {
  RefreshTokenPayload,
  refreshTokenSignOptions,
  signToken,
  verifyToken,
} from "../utils/jwt";
import { sendEmail } from "../utils/sendMail";

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

  const url = `${APP_ORIGIN}/email/verify/${verificationCode._id}`;

  const { error } = await sendEmail({
    to: user.email,
    ...getVerifyEmailTemplate(url),
  });

  if (error) {
    console.log("error in sending email", error);
  }

  // create session
  const session = await sessionModel.create({
    userId: user._id,
    userAgent: data.userAgent,
  });
  // sign access and refresh tokens

  const refreshToken = signToken(
    {
      sessionId: session._id,
    },
    refreshTokenSignOptions
  );
  const accessToken = signToken({
    userId: user._id,
    sessionId: session._id,
  });

  // return user and tokens
  return {
    user: user.omitPassword(),
    accessToken,
    refreshToken,
  };
};

export type LoginParams = {
  email: string;
  password: string;
  userAgent?: string;
};

export const loginUser = async ({
  email,
  password,
  userAgent,
}: LoginParams) => {
  // get the user by email
  const user = await UserModel.findOne({ email });

  appAssert(user, UNAUTHORIZED, "Invalid email or password");

  // validate password from the request
  const isValid = await user.comparePassword(password);
  appAssert(isValid, UNAUTHORIZED, "Invalid email or password");

  // create a session
  const session = await sessionModel.create({
    userId: user._id,
    userAgent: userAgent,
  });

  const sessionInfo = {
    sessionId: session._id,
  };

  // sign access token and refresh token
  const refreshToken = signToken(sessionInfo, refreshTokenSignOptions);
  const accessToken = signToken({
    ...sessionInfo,
    userId: user._id,
  });

  // return user and tokens
  return {
    user: user.omitPassword(),
    accessToken,
    refreshToken,
  };
};

export const refreshUserAccessToken = async (refreshToken: string) => {
  const { payload } = verifyToken<RefreshTokenPayload>(refreshToken, {
    secret: refreshTokenSignOptions.secret,
  });
  appAssert(payload, UNAUTHORIZED, "Invalid refresh token");

  const session = await sessionModel.findById(payload.sessionId);
  const now = Date.now();
  appAssert(
    session && session.expiresAt.getTime() > now,
    UNAUTHORIZED,
    "Session expired"
  );
  // refresh session if it expires in the next 24 hours

  const sessionNeedsRefresh = session.expiresAt.getTime() - now <= ONE_DAY_MS;
  if (sessionNeedsRefresh) {
    session.expiresAt = thirtyDaysFromNow();
    await session.save();
  }

  const newRefreshToken = sessionNeedsRefresh
    ? signToken(
        {
          sessionId: session._id,
        },
        refreshTokenSignOptions
      )
    : undefined;

  const accessToken = signToken({
    userId: session.userId,
    sessionId: session._id,
  });

  return { accessToken, newRefreshToken };
};

export const verifyEmail = async (code: string) => {
  // get the verification code
  const validCode = await verificationCodeModel.findOne({
    _id: code,
    type: VerificationCodeTypes.EmailVerification,
    expiresAt: { $gt: new Date() },
  });
  appAssert(validCode, NOT_FOUND, "Invalid or expired verification code");
  // get user by id
  const userId = validCode.userId;
  const updatedUser = await UserModel.findByIdAndUpdate(
    userId,
    {
      verified: true,
    },
    { new: true }
  );
  appAssert(updatedUser, INTERNAL_SERVER_ERROR, "Failed to verify email");
  // delete verification code
  await validCode.deleteOne();
  // return user
  return updatedUser.omitPassword();
};
