import { model, models, Schema, type InferSchemaType } from "mongoose";

const auditLogSchema = new Schema(
  {
    actorId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    action: { type: String, required: true, trim: true, maxlength: 120, index: true },
    entityType: { type: String, required: true, trim: true, maxlength: 80 },
    entityId: { type: String, required: true, trim: true, index: true },
    metadata: { type: Schema.Types.Mixed, default: {} },
    createdAt: { type: Date, default: Date.now, required: true, index: true },
  },
  { timestamps: false, versionKey: false },
);

auditLogSchema.index({ entityType: 1, entityId: 1, createdAt: -1 });

export type AuditLogDocument = InferSchemaType<typeof auditLogSchema>;
export const AuditLog = models.AuditLog ?? model("AuditLog", auditLogSchema);
