import mongoose from 'mongoose'

const orderSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  items: [
    {
      productId: { type: String, required: true },
      name: { type: String, required: true },
      image: { type: String, required: true },
      size: { type: String, required: true },
      quantity: { type: Number, required: true },
      price: {
        mrp: { type: Number, required: true },
        offer: { type: Number },
        discountNote: { type: String }
      }
    }
  ],
  totalItems: { type: Number, required: true },
  amount: { type: Number, required: true },
  deliveryCharge: { type: Number, required: true },
  address: { type: Object, required: true },
  status: { type: String, required: true, default: 'Order Placed' },
  paymentMethod: { type: String, required: true },
  payment: { type: Boolean, required: true, default: false },
  createdAt: { type: Date, default: Date.now },
  razorpayOrderId: { type: String }
})

const orderModel = mongoose.models.order || mongoose.model('order', orderSchema)
export default orderModel;