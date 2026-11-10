import { model, models, Schema, type InferSchemaType, type Model } from "mongoose";

const mentorApplicationSchema = new Schema(
  {
    status: {
      type: String,
      enum: ["none", "pending", "approved", "rejected"],
      default: "none",
      required: true,
    },
    description: { type: String, trim: true, maxlength: 2000 },
    skills: { type: [String], default: [] },
    contactEmail: { type: String, lowercase: true, trim: true },
    reviewedBy: { type: Schema.Types.ObjectId, ref: "User" },
    reviewedAt: { type: Date },
  },
  { _id: false },
);

const userSchema = new Schema(
  {
    clerkUserId: { type: String, required: true, unique: true, index: true, trim: true },
    username: { type: String, unique: true, sparse: true, index: true, lowercase: true, trim: true },
    email: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    profileImage: { type: String, trim: true },
    role: { type: String, enum: ["student", "mentor", "admin"], default: "student", required: true },
    college: { type: Schema.Types.ObjectId, ref: "College" },
    mobile: { type: String, trim: true },
    skills: { type: [String], default: [] },
    leetcodeUrl: { type: String, trim: true },
    githubUrl: { type: String, trim: true },
    portfolioUrl: { type: String, trim: true },
    about: { type: String, trim: true, maxlength: 1000 },
    coins: { type: Number, min: 0, default: 0, required: true },
    onboardingCompleted: { type: Boolean, default: false, required: true },
    accountStatus: {
      type: String,
      enum: ["active", "suspended"],
      default: "active",
      required: true,
      index: true,
    },
    mentorApplication: {
      type: mentorApplicationSchema,
      default: () => ({}),
    },
  },
  { timestamps: true, versionKey: false },
);

userSchema.index({ role: 1, accountStatus: 1 });

export type UserDocument = InferSchemaType<typeof userSchema>;
export const User: Model<UserDocument> =
  (models.User as Model<UserDocument> | undefined) ?? model<UserDocument>("User", userSchema);
