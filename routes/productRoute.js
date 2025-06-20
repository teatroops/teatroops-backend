import express from 'express'
import { addProduct, listProducts, removeProduct, singleProduct } from '../controllers/productController.js'
import upload from '../middleware/multer.js';
import adminAuth from '../middleware/adminAuth.js';
import productModel from '../models/productModel.js'; 

const productRouter = express.Router();

// Add product with detailed information
productRouter.post("/add", adminAuth, upload.fields([
  {name:'image1',maxCount:1},
  {name:'image2',maxCount:1},
  {name:'image3',maxCount:1},
  {name:'image4',maxCount:1},
  {name:'image5',maxCount:1},
  {name:'highlightImage',maxCount:1}
]), addProduct);

productRouter.get('/list',listProducts)
productRouter.post('/remove',adminAuth,removeProduct);
productRouter.post('/single',singleProduct);

// Get products by category
productRouter.get("/products-by-category/:category", async (req, res) => {
    try {
        const { category } = req.params;
        const products = await productModel.find({ category });
        res.json({ success: true, products });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
});

// Get products by subCategory
productRouter.get("/products-by-subcategory/:subCategory", async (req, res) => {
    try {
        const { subCategory } = req.params;
        const products = await productModel.find({ subCategory });
        res.json({ success: true, products });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
});

// Get bestseller products
productRouter.get("/bestsellers", async (req, res) => {
    try {
        const products = await productModel.find({ bestseller: true });
        res.json({ success: true, products });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
});

export default productRouter;