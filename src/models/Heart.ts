import mongoose, {
  Document,
  Model,
  Schema,
} from "mongoose";

export interface IHeart extends Document {
  visitorId: string;
  productId: string;
  createdAt: Date;
}

const HeartSchema = new Schema<IHeart>(
  {
    visitorId: {
      type: String,
      required: true,
      index: true,
    },

    productId: {
      type: String,
      required: true,
      index: true,
    },
  },
  {
    timestamps: {
      createdAt: true,
      updatedAt: false,
    },
  }
);

// Satu visitor hanya boleh heart satu produk sekali.
HeartSchema.index(
  {
    visitorId: 1,
    productId: 1,
  },
  {
    unique: true,
  }
);

const HeartModel =
  (mongoose.models.Heart as Model<IHeart>) ||
  mongoose.model<IHeart>("Heart", HeartSchema);

export default HeartModel;