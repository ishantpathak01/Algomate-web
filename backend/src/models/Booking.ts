import { model, models, Schema, type InferSchemaType } from "mongoose";

const bookingSchema = new Schema(
  {
    studentId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    mentorId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    date: { type: Date, required: true, index: true },
    startTime: { type: String, required: true, trim: true },
    endTime: { type: String, required: true, trim: true },
    coinsSpent: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["requested", "confirmed", "completed", "cancelled"],
      default: "requested",
      required: true,
      index: true,
    },
  },
  { timestamps: true, versionKey: false },
);

bookingSchema.index({ mentorId: 1, date: 1, startTime: 1 });
bookingSchema.index({ studentId: 1, createdAt: -1 });

export type BookingDocument = InferSchemaType<typeof bookingSchema>;
export const Booking = models.Booking ?? model("Booking", bookingSchema);
