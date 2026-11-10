import { model, models, Schema, type InferSchemaType, type Model } from "mongoose";

const questionResultSchema = new Schema(
  {
    questionId: { type: Schema.Types.ObjectId, ref: "Question", required: true },
    pointsEarned: { type: Number, min: 0, required: true },
    wrongAttempts: { type: Number, min: 0, required: true },
    acceptedAt: { type: Date },
  },
  { _id: false },
);

const contestResultSchema = new Schema(
  {
    contestId: { type: Schema.Types.ObjectId, ref: "Contest", required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    participationId: { type: Schema.Types.ObjectId, ref: "ContestParticipation", required: true },
    score: { type: Number, min: 0, required: true },
    rank: { type: Number, min: 1, required: true },
    acceptedCount: { type: Number, min: 0, required: true },
    wrongAttempts: { type: Number, min: 0, required: true },
    elapsedSeconds: { type: Number, min: 0, required: true },
    questionResults: { type: [questionResultSchema], default: [] },
    scoringVersion: { type: String, required: true, default: "contest-score-v1" },
    publishedAt: { type: Date, required: true },
  },
  { timestamps: true, versionKey: false },
);

contestResultSchema.index({ contestId: 1, userId: 1 }, { unique: true });
contestResultSchema.index({ contestId: 1, rank: 1 }, { unique: true });

export type ContestResultDocument = InferSchemaType<typeof contestResultSchema>;
export const ContestResult: Model<ContestResultDocument> =
  (models.ContestResult as Model<ContestResultDocument> | undefined) ?? model<ContestResultDocument>("ContestResult", contestResultSchema);
