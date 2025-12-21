import { CookieOptions, Response } from "express";
import { NODE_ENV } from "./../constants/env";
import { fifteenMinutesFromNow, thirtyDaysFromNow } from "./date";

const secure = NODE_ENV !== "development";

const defaults: CookieOptions = {
  sameSite: true,
  httpOnly: true,
  secure,
};

const getAccessTokenCookieOptions = (): CookieOptions => ({
  ...defaults,
  expires: fifteenMinutesFromNow(),
});
const getRefreshTokenCookieOptions = (): CookieOptions => ({
  ...defaults,
  expires: thirtyDaysFromNow(),
  path: "/auth/refresh",
});

type Params = {
  res: Response;
  accessToken: string;
  refreshToken: string;
};

export const setAuthCookies = ({ res, accessToken, refreshToken }: Params) => {
  return res
    .cookie("accessToken", accessToken, getAccessTokenCookieOptions())
    .cookie("refreshToken", refreshToken, getRefreshTokenCookieOptions());
};
