import mongoose from "mongoose";
import { thirtyDaysFromNow } from "../utils/date";

export interface SessionDocument extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  userAgent?: string;
  expiresAt: Date;
  createdAt: Date;
}

const SessionSchema = new mongoose.Schema<SessionDocument>({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  userAgent: {
    type: String,
  },
  expiresAt: {
    type: Date,
    required: true,
    default: thirtyDaysFromNow,
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
});

const sessionModel = mongoose.model<SessionDocument>("Session", SessionSchema);
export default sessionModel;
