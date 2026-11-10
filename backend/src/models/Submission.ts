import { model, models, Schema, type InferSchemaType } from "mongoose";

const submissionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    contestId: { type: Schema.Types.ObjectId, ref: "Contest", required: true, index: true },
    questionId: { type: Schema.Types.ObjectId, ref: "Question", required: true, index: true },
    sourceCode: { type: String, required: true, maxlength: 100_000 },
    language: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["queued", "running", "accepted", "wrong_answer", "runtime_error", "compilation_error"],
      default: "queued",
      required: true,
      index: true,
    },
    executionTime: { type: Number, min: 0 },
    memoryUsed: { type: Number, min: 0 },
    submittedAt: { type: Date, default: Date.now, required: true, index: true },
  },
  { timestamps: false, versionKey: false },
);

submissionSchema.index({ userId: 1, contestId: 1, submittedAt: -1 });

export type SubmissionDocument = InferSchemaType<typeof submissionSchema>;
export const Submission = models.Submission ?? model("Submission", submissionSchema);
