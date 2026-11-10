import { model, models, Schema, type InferSchemaType } from "mongoose";

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
    difficulty: { type: String, enum: ["easy", "medium", "hard"], required: true, index: true },
    constraints: { type: [String], default: [] },
    testCases: { type: [testCaseSchema], default: [] },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  },
  { timestamps: true, versionKey: false },
);

export type QuestionDocument = InferSchemaType<typeof questionSchema>;
export const Question = models.Question ?? model("Question", questionSchema);
