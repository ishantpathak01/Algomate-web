import { model, models, Schema, type InferSchemaType, type Model } from "mongoose";

const contestParticipationSchema = new Schema(
  {
    contestId: { type: Schema.Types.ObjectId, ref: "Contest", required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    status: {
      type: String,
      enum: ["registered", "in_progress", "submitted", "completed", "disqualified"],
      default: "registered",
      required: true,
      index: true,
    },
    registeredAt: { type: Date, default: Date.now, required: true },
    startedAt: { type: Date },
    expiresAt: { type: Date },
    finalSubmittedAt: { type: Date },
    violationCounts: {
      fullscreenExit: { type: Number, min: 0, default: 0 },
      visibilityHidden: { type: Number, min: 0, default: 0 },
      windowBlur: { type: Number, min: 0, default: 0 },
    },
    lastViolationAt: { type: Date },
  },
  { timestamps: true, versionKey: false },
);

contestParticipationSchema.index({ contestId: 1, userId: 1 }, { unique: true });
contestParticipationSchema.index({ contestId: 1, status: 1, registeredAt: 1 });

export type ContestParticipationDocument = InferSchemaType<typeof contestParticipationSchema>;
export const ContestParticipation: Model<ContestParticipationDocument> =
  (models.ContestParticipation as Model<ContestParticipationDocument> | undefined) ??
  model<ContestParticipationDocument>("ContestParticipation", contestParticipationSchema);
