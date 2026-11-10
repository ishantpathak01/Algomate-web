import { model, models, Schema, type InferSchemaType, type Model } from "mongoose";

const coinTransactionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    amount: { type: Number, required: true, min: 1 },
    type: { type: String, enum: ["credit", "debit"], required: true },
    reason: { type: String, required: true, trim: true, maxlength: 240 },
    referenceId: { type: String, trim: true, index: true },
    createdAt: { type: Date, default: Date.now, required: true, index: true },
  },
  { timestamps: false, versionKey: false },
);

coinTransactionSchema.index({ userId: 1, createdAt: -1 });
coinTransactionSchema.index(
  { userId: 1, referenceId: 1 },
  { unique: true, partialFilterExpression: { referenceId: { $type: "string" } } },
);

export type CoinTransactionDocument = InferSchemaType<typeof coinTransactionSchema>;
export const CoinTransaction: Model<CoinTransactionDocument> =
  (models.CoinTransaction as Model<CoinTransactionDocument> | undefined) ??
  model<CoinTransactionDocument>("CoinTransaction", coinTransactionSchema);
