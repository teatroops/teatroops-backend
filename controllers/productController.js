import { v2 as cloudinary } from "cloudinary"
import productModel from "../models/productModel.js"

// function for add product
const addProduct = async (req, res) => {
    try {

        const { 
            name, 
            description, 
            category, 
            subCategory, 
            size, 
            bestseller,
            benefits,
            storageInstructions,
            caution,
            infusionGuide,
            mrp,
            offer,
            discountNote,
            highlightTitle,
            highlightText,    
        } = req.body

        // Get all uploaded files
        const images = [];
        let highlightImageUrl = '';
    
        
        // Properly collect image files from multer's req.files object
        // Multer with fields() creates an object with field names as keys and arrays of files as values
        if (req.files) {
          ['image1', 'image2', 'image3', 'image4', 'image5'].forEach(field => {
            if (req.files[field] && req.files[field].length > 0) {
              images.push(req.files[field][0]); // Add the file object to our images array
            }
          });
        }
        
        // Upload to Cloudinary
        const imagesUrl = await Promise.all(
          images.map(async (file) => {
            try {
              const result = await cloudinary.uploader.upload(file.path, {
                resource_type: 'image',
                folder: 'tea-troops/products'
              });
              return result.secure_url;
            } catch (error) {
              console.error('Error uploading image:', error);
              throw error;
            }
          })
        );
        
        if (!imagesUrl.length) {
          return res.json({ success: false, message: 'No images uploaded. Please select at least one product image.' });
        }

        // Highlight image upload
        if (req.files && Array.isArray(req.files.highlightImage) && req.files.highlightImage[0]) {
            try {
                const result = await cloudinary.uploader.upload(req.files.highlightImage[0].path, {
                    resource_type: 'image',
                    folder: 'tea-troops/products/highlight'
                });
                highlightImageUrl = result.secure_url;
            } catch (error) {
                console.error('Error uploading highlight image:', error);
            }
        }

        let parsedInfusionGuide = infusionGuide;
if (typeof infusionGuide === 'string') {
    try {
        parsedInfusionGuide = JSON.parse(infusionGuide);
    } catch (e) {
        parsedInfusionGuide = {};
    }
} else if (
    req.body['infusionGuide.quantity'] ||
    req.body['infusionGuide.temperature'] ||
    req.body['infusionGuide.time'] ||
    req.body['infusionGuide.infusions']
) {
    parsedInfusionGuide = {
        quantity: req.body['infusionGuide.quantity'] || '',
        temperature: req.body['infusionGuide.temperature'] || '',
        time: req.body['infusionGuide.time'] || '',
        infusions: req.body['infusionGuide.infusions'] || '',
    };
}

        // Store size as a plain string
        const productData = {
            name,
            description,
            category,
            subCategory,
            size: (typeof size === 'string' && size && size !== 'undefined') ? size : '',
            bestseller: bestseller === "true" ? true : false,
            benefits: benefits ? JSON.parse(benefits) : [],
            storageInstructions:storageInstructions || '',
            caution: caution || '',
            infusionGuide: parsedInfusionGuide,
            price: {
                mrp: Number(mrp),
                offer: Number(offer),
                discountNote
            },
            image: imagesUrl,
            size,
            date: Date.now(),
            highlightSection: {
                title: highlightTitle || '',
                text: highlightText || '',
                image: highlightImageUrl || ''
            }
        }

        const product = new productModel(productData);
        await product.save()

        res.json({ success: true, message: "Product Added" })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// function for list product
const listProducts = async (req, res) => {
    try {
        
        const products = await productModel.find({});
        res.json({success:true,products})

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// function for removing product
const removeProduct = async (req, res) => {
    try {
        
        await productModel.findByIdAndDelete(req.body.id)
        res.json({success:true,message:"Product Removed"})

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// function for single product info
const singleProduct = async (req, res) => {
    try {
        
        const { productId } = req.body
        const product = await productModel.findById(productId)
        res.json({success:true,product})

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

export { listProducts, addProduct, removeProduct, singleProduct }