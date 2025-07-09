import express from 'express'
// placeOrderStripe ,verifyStripe
import { placeOrder, placeOrderRazorpay, allOrders, userOrders, updateStatus, verifyRazorpay, createRazorpayOrder } from '../controllers/orderController.js'
import adminAuth from '../middleware/adminAuth.js'
import authUser from '../middleware/auth.js'

const orderRouter = express.Router()

// Razorpay order creation endpoint (no auth required)
orderRouter.post('/create-razorpay-order', createRazorpayOrder);

// Admin Features
orderRouter.post('/list', adminAuth, allOrders)
orderRouter.post('/status', adminAuth, updateStatus)

// Payment Features
orderRouter.post('/place', placeOrder)
// orderRouter.post('/payu',authUser,)
orderRouter.post('/razorpay', placeOrderRazorpay)

// User Feature 
orderRouter.post('/userorders', authUser, userOrders)

// verify payment
// orderRouter.post('/verifyStripe',authUser, verifyStripe)
orderRouter.post('/verifyRazorpay', authUser, verifyRazorpay)

export default orderRouter