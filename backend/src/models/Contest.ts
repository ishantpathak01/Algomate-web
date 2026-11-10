import { model, models, Schema, type InferSchemaType, type Model } from "mongoose";

const prizeSchema = new Schema(
  {
    place: { type: Number, required: true, min: 1 },
    description: { type: String, required: true, trim: true },
    coins: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const contestQuestionSchema = new Schema(
  {
    questionId: { type: Schema.Types.ObjectId, ref: "Question", required: true },
    points: { type: Number, required: true, min: 1, max: 100_000 },
    order: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const contestSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 160, index: true },
    description: { type: String, required: true, trim: true },
    startTime: { type: Date, required: true, index: true },
    endTime: { type: Date, required: true },
    duration: { type: Number, required: true, min: 1 },
    registrationDeadline: { type: Date, required: true },
    maxParticipants: { type: Number, required: true, min: 1, max: 100_000 },
    registeredCount: { type: Number, min: 0, default: 0, required: true },
    rules: { type: String, trim: true, maxlength: 10_000, default: "" },
    visibility: { type: String, enum: ["public", "private"], default: "public", required: true },
    bannerImageUrl: { type: String, trim: true, maxlength: 2048 },
    questions: { type: [contestQuestionSchema], default: [] },
    wrongAttemptPenalty: { type: Number, min: 0, max: 100_000, default: 0, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    status: {
      type: String,
      enum: ["draft", "pending_review", "rejected", "upcoming", "ongoing", "completed", "cancelled"],
      default: "draft",
      required: true,
      index: true,
    },
    review: {
      status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
      reason: { type: String, trim: true, maxlength: 2000 },
      reviewedBy: { type: Schema.Types.ObjectId, ref: "User" },
      reviewedAt: { type: Date },
    },
    prizes: { type: [prizeSchema], default: [] },
  },
  { timestamps: true, versionKey: false },
);

contestSchema.index({ status: 1, startTime: 1 });
contestSchema.index({ "questions.questionId": 1 });

export type ContestDocument = InferSchemaType<typeof contestSchema>;
export const Contest: Model<ContestDocument> =
  (models.Contest as Model<ContestDocument> | undefined) ?? model<ContestDocument>("Contest", contestSchema);
