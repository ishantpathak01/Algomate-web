import { model, models, Schema, type InferSchemaType } from "mongoose";

const collegeSchema = new Schema(
  {
    name: { type: String, required: true, unique: true, index: true, trim: true },
    location: { type: String, required: true, trim: true },
    isActive: { type: Boolean, default: true, required: true, index: true },
  },
  { timestamps: true, versionKey: false },
);

export type CollegeDocument = InferSchemaType<typeof collegeSchema>;
export const College = models.College ?? model("College", collegeSchema);
