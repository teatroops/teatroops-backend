import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import productModel from "../models/productModel.js";
import crypto from 'crypto';
import razorpay from 'razorpay'

// global variables
const currency = 'inr'
const deliveryCharge = 0;



const razorpayInstance = new razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
})

// Placing orders using COD Method
const placeOrder = async (req, res) => {
  try {
    const { userId, items, address } = req.body;
    let orderItems = [];
    let totalItems = 0;
    let amount = 0;
    const deliveryChargeValue = 0;

    for (const cartItem of items) {
      const { productId, size, quantity } = cartItem;
      const product = await productModel.findById(productId);
      if (!product) continue;
      const itemPrice = product.price;
      const priceToUse = itemPrice.offer ?? itemPrice.mrp;
      orderItems.push({
        productId,
        name: product.name,
        image: Array.isArray(cartItem.image) ? cartItem.image[0] : (cartItem.image || (Array.isArray(product.image) ? product.image[0] : product.image)),
        size,
        quantity,
        price: {
          mrp: itemPrice.mrp,
          offer: itemPrice.offer,
          discountNote: itemPrice.discountNote || ''
        }
      });
      totalItems += quantity;
      amount += priceToUse * quantity;
    }
    amount += deliveryChargeValue;

    const orderData = {
      items: orderItems,
      totalItems,
      amount: req.body.amount ?? amount,
      deliveryCharge: deliveryChargeValue,
      address,
      status: 'Order Placed',
      paymentMethod: 'COD',
      payment: false,
      createdAt: Date.now()
    };
    if (userId) {
      orderData.userId = userId;
    } else if (guestInfo) {
      orderData.guestInfo = guestInfo; // { name, email, phone }
    }

    const newOrder = new orderModel(orderData);
    await newOrder.save();
    if (userId) {
      await userModel.findByIdAndUpdate(userId, { cartData: {} });
    }
    res.json({ success: true, message: "Order Placed" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
}



// Placing orders using Razorpay Method
const placeOrderRazorpay = async (req, res) => {
  try {
    const { userId, items, address } = req.body;
    let orderItems = [];
    let totalItems = 0;
    let amount = 0;
    const deliveryChargeValue = 0;

    for (const cartItem of items) {
      const { productId, size, quantity } = cartItem;
      const product = await productModel.findById(productId);
      if (!product) continue;
      const itemPrice = product.price;
      const priceToUse = itemPrice.offer ?? itemPrice.mrp;
      orderItems.push({
        productId,
        name: product.name,
        image: Array.isArray(cartItem.image) ? cartItem.image[0] : (cartItem.image || (Array.isArray(product.image) ? product.image[0] : product.image)),
        size,
        quantity,
        price: {
          mrp: itemPrice.mrp,
          offer: itemPrice.offer,
          discountNote: itemPrice.discountNote || ''
        }
      });
      totalItems += quantity;
      amount += priceToUse * quantity;
    }
    amount += deliveryChargeValue;

    const orderData = {
      userId,
      items: orderItems,
      totalItems,
      amount,
      deliveryCharge: deliveryChargeValue,
      address,
      status: 'Order Placed',
      paymentMethod: 'Razorpay',
      payment: false,
      createdAt: Date.now()
    };

    const newOrder = new orderModel(orderData);
    await newOrder.save();

    const options = {
      amount: amount * 100,
      currency: currency.toUpperCase(),
      receipt: newOrder._id.toString()
    };

    razorpayInstance.orders.create(options, async (error, order) => {
      if (error) {
        return res.json({ success: false, message: error });
      }
      // Save Razorpay order ID in your order
      await orderModel.findByIdAndUpdate(newOrder._id, { razorpayOrderId: order.id });
      res.json({ success: true, order });
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
}


// Verify Razorpay payment and update order
const verifyRazorpay = async (req, res) => {
  try {
    const { userId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    // 1. Verify signature
    const generated_signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest('hex');
    if (generated_signature !== razorpay_signature) {
      return res.json({ success: false, message: 'Payment signature verification failed' });
    }

    // 2. Mark order as paid
    const order = await orderModel.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      { payment: true, status: 'Paid', razorpayPaymentId: razorpay_payment_id },
      { new: true }
    );

    if (!order) {
      return res.json({ success: false, message: 'Order not found' });
    }

    // 3. Clear cart
    await userModel.findByIdAndUpdate(userId, { cartData: {} });

    res.json({ success: true, message: "Payment Successful", order });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};



// All Orders data for Admin Panel
const allOrders = async (req, res) => {

  try {

    const orders = await orderModel.find({})
    res.json({ success: true, orders })

  } catch (error) {
    res.json({ success: false, message: error.message })
  }

}

// User Order Data For Forntend
const userOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const orders = await orderModel.find({ userId });
    res.json({ success: true, orders });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
}

// update order status from Admin Panel
const updateStatus = async (req, res) => {
  try {

    const { orderId, status } = req.body

    await orderModel.findByIdAndUpdate(orderId, { status })
    res.json({ success: true, message: 'Status Updated' })

  } catch (error) {
    res.json({ success: false, message: error.message })
  }
}

// Create Razorpay order for frontend
const createRazorpayOrder = async (req, res) => {
  try {
    const { amount } = req.body;
    const options = {
      amount: amount * 100, // paise
      currency: 'INR',
      receipt: `order_rcptid_${Date.now()}`
    };
    const order = await razorpayInstance.orders.create(options);
    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export { verifyRazorpay, placeOrder, placeOrderRazorpay, allOrders, userOrders, updateStatus, createRazorpayOrder }
