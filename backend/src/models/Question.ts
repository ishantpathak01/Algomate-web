import { model, models, Schema, type InferSchemaType, type Model } from "mongoose";

const testCaseSchema = new Schema(
  {
    input: { type: String, required: true },
    expectedOutput: { type: String, required: true },
    isHidden: { type: Boolean, default: true, required: true },
  },
  { _id: false },
);

const questionSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 180, index: true },
    description: { type: String, required: true, trim: true },
    inputFormat: { type: String, trim: true, maxlength: 5000, default: "" },
    outputFormat: { type: String, trim: true, maxlength: 5000, default: "" },
    difficulty: { type: String, enum: ["easy", "medium", "hard"], required: true, index: true },
    topics: { type: [String], default: [] },
    points: { type: Number, min: 1, max: 100_000, default: 100, required: true },
    constraints: { type: [String], default: [] },
    sampleCases: {
      type: [{ input: { type: String, required: true }, output: { type: String, required: true }, explanation: String }],
      default: [],
    },
    testCases: { type: [testCaseSchema], default: [] },
    supportedLanguages: {
      type: [String],
      enum: ["javascript", "typescript", "python", "java", "cpp"],
      default: ["javascript", "python"],
    },
    timeLimitMs: { type: Number, min: 100, max: 30_000, default: 2000, required: true },
    memoryLimitMb: { type: Number, min: 16, max: 2048, default: 256, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  },
  { timestamps: true, versionKey: false },
);

export type QuestionDocument = InferSchemaType<typeof questionSchema>;
export const Question: Model<QuestionDocument> =
  (models.Question as Model<QuestionDocument> | undefined) ?? model<QuestionDocument>("Question", questionSchema);
