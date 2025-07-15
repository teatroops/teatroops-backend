import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  highlightSection: {
    title: { type: String, default: '' },
    text: { type: String, default: '' },
    image: { type: String, default: '' }
  },
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: {
    mrp: { type: Number, required: true },
    offer: { type: Number, required: true },
    discountNote: { type: String },
  },
  image: { type: [String], required: true },
  category: { type: String, required: true },
  subCategory: { type: String, required: true },
  size: { type: String, required: true },
  bestseller: { type: Boolean, default: true },
  date: { type: Number, required: true },

  benefits: { type: [String], default: [] },
  storageInstructions: { type: String },
  caution: { type: String },

  infusionGuide: {
    quantity: { type: String },
    temperature: { type: String },
    time: { type: String },
    infusions: { type: String },
  },

  tags: { type: [String], default: [] },
  isAvailable: { type: Boolean, default: true },
  // isOrganic: { type: Boolean, default: true },
  // isCaffeineFree: { type: Boolean, default: true },
  // isSugarFree: { type: Boolean, default: true },
  // isNatural: { type: Boolean, default: true }
});

const productModel = mongoose.models.product || mongoose.model("product", productSchema);

export default productModel;
