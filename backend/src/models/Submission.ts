import { model, models, Schema, type InferSchemaType, type Model } from "mongoose";

const submissionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    contestId: { type: Schema.Types.ObjectId, ref: "Contest", required: true, index: true },
    questionId: { type: Schema.Types.ObjectId, ref: "Question", required: true, index: true },
    sourceCode: { type: String, required: true, maxlength: 100_000 },
    language: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["queued", "running", "accepted", "wrong_answer", "runtime_error", "compilation_error", "time_limit_exceeded", "judge_error"],
      default: "queued",
      required: true,
      index: true,
    },
    executionTime: { type: Number, min: 0 },
    memoryUsed: { type: Number, min: 0 },
    score: { type: Number, min: 0, default: 0, required: true },
    attemptNumber: { type: Number, min: 1, required: true },
    passedTestCases: { type: Number, min: 0, default: 0, required: true },
    totalTestCases: { type: Number, min: 0, default: 0, required: true },
    completedAt: { type: Date },
    submittedAt: { type: Date, default: Date.now, required: true, index: true },
  },
  { timestamps: false, versionKey: false },
);

submissionSchema.index({ userId: 1, contestId: 1, submittedAt: -1 });
submissionSchema.index({ userId: 1, contestId: 1, questionId: 1, attemptNumber: 1 }, { unique: true });

export type SubmissionDocument = InferSchemaType<typeof submissionSchema>;
export const Submission: Model<SubmissionDocument> =
  (models.Submission as Model<SubmissionDocument> | undefined) ?? model<SubmissionDocument>("Submission", submissionSchema);
