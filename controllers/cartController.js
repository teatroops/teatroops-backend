import userModel from "../models/userModel.js"


// add products to user cart
const addToCart = async (req, res) => {
    try {
        const { itemId, size, quantity } = req.body; // Added quantity
        const userId = req.user.id; // Use userId from authUser middleware
        const addQuantity = quantity && Number(quantity) > 0 ? Number(quantity) : 1; // Default to 1 if invalid or not provided

        const userData = await userModel.findById(userId);
        if (!userData) {
            return res.json({ success: false, message: "User not found" });
        }

        // Ensure cartData and nested item object are initialized before modification
        if (!userData.cartData) {
            userData.cartData = {};
        }
        if (!userData.cartData[itemId]) {
            userData.cartData[itemId] = {};
        }

        // Update quantity
        if (userData.cartData[itemId][size]) {
            userData.cartData[itemId][size] += addQuantity;
        } else {
            userData.cartData[itemId][size] = addQuantity;
        }
        
        // Mark cartData as modified and save the document
        userData.markModified('cartData');
        await userData.save();

        res.json({ success: true, message: "Added To Cart" });

    } catch (error) {
        console.log(error);
        // It's good practice to provide a more generic error message to the client in production
        res.json({ success: false, message: "Error adding item to cart" });
    }
};

// update user cart
const updateCart = async (req,res) => {
    try {
        const { itemId, size, quantity } = req.body;
        const userId = req.user.id; // use id from auth middleware

        const userData = await userModel.findById(userId);
        if (!userData) {
            return res.json({ success: false, message: "User not found" });
        }

        // Ensure cartData is initialized
        if (!userData.cartData) {
            userData.cartData = {};
        }

        // If quantity is 0, remove the size entry (and item if empty)
        if (Number(quantity) <= 0) {
            if (userData.cartData[itemId] && userData.cartData[itemId][size] !== undefined) {
                delete userData.cartData[itemId][size];
                // If there are no more sizes under the product, remove the product key
                if (Object.keys(userData.cartData[itemId]).length === 0) {
                    delete userData.cartData[itemId];
                }
            }
        } else {
            // Otherwise update / set the quantity
            if (!userData.cartData[itemId]) {
                userData.cartData[itemId] = {};
            }
            userData.cartData[itemId][size] = Number(quantity);
        }

        // Mark nested object as modified so Mongoose saves it
        userData.markModified('cartData');
        await userData.save();

        res.json({ success: true, message: "Cart Updated" });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// get user cart data
const getUserCart = async (req,res) => {

    try {
        
        const userId = req.user.id; // Use userId from authUser middleware
        
        const userData = await userModel.findById(userId)
        if (!userData) {
            return res.json({ success: false, message: "User not found" });
        }
        let cartData = await userData.cartData;

        res.json({ success: true, cartData })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }

}

export { addToCart, updateCart, getUserCart }