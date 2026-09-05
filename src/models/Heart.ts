import mongoose, { Document, Model, Schema } from "mongoose";

export interface IHeartDocument extends Document {
  key: string;
  count: number;
}

const HeartSchema = new Schema<IHeartDocument>(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      default: "wedding",
    },
    count: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

const HeartModel =
  (mongoose.models.Heart as Model<IHeartDocument>) ||
  mongoose.model<IHeartDocument>("Heart", HeartSchema);

export default HeartModel;