import { model, models, Schema, type InferSchemaType } from "mongoose";

const prizeSchema = new Schema(
  {
    place: { type: Number, required: true, min: 1 },
    description: { type: String, required: true, trim: true },
    coins: { type: Number, required: true, min: 0 },
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
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    status: {
      type: String,
      enum: ["draft", "upcoming", "ongoing", "completed", "cancelled"],
      default: "draft",
      required: true,
      index: true,
    },
    prizes: { type: [prizeSchema], default: [] },
  },
  { timestamps: true, versionKey: false },
);

contestSchema.index({ status: 1, startTime: 1 });

export type ContestDocument = InferSchemaType<typeof contestSchema>;
export const Contest = models.Contest ?? model("Contest", contestSchema);
