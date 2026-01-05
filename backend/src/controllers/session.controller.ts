import z from "zod";
import {
  BAD_REQUEST,
  INTERNAL_SERVER_ERROR,
  NOT_FOUND,
  OK,
  UNAUTHORIZED,
} from "../constants/http";
import sessionModel from "../models/session.model";
import appAssert from "../utils/appAssert";
import catchErrors from "../utils/catchErrors";

export const getSessionsHandler = catchErrors(async (req, res) => {
  const userId = req.userId;
  const sessionId = req.sessionId;
  appAssert(userId || sessionId, NOT_FOUND, "User not found");
  const sessions = await sessionModel.find(
    {
      userId,
      expiresAt: { $gt: new Date() },
    },
    {
      _id: 1,
      userAgent: 1,
      createdAt: 1,
    },
    {
      sort: { createdAt: -1 },
    }
  );

  return res.status(OK).json(
    sessions.map((session) => ({
      ...session.toObject(),
      ...(session.id === sessionId && {
        isCurrent: true,
      }),
    }))
  );
});

export const deleteSessionHandler = catchErrors(async (req, res) => {
  const userId = req.userId;
  appAssert(userId, UNAUTHORIZED, "Unauthorized");
  const sessionId = z.string().parse(req.params.id);
  appAssert(sessionId, BAD_REQUEST, "Invalid session id");
  const deleted = await sessionModel.findOneAndDelete({
    _id: sessionId,
    userId: userId,
  });
  appAssert(deleted, NOT_FOUND, "Session not found");
  return res.status(OK).json({
    message: "Session deleted successfully",
  });
});
