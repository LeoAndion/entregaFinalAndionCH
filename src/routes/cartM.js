import Cart from '../model/cart.model.js';
import Product from '../model/product.model.js';

const CART_ID = '66b91b709005a2ded5f5535a';

class CartManager {
    async addProductToCart(productId, quantity) {
        try {
            quantity = parseInt(quantity, 10); 
            if (isNaN(quantity) || quantity <= 0) {
                throw new Error('Cantidad no válida');
            }
    
            const cart = await Cart.findById(CART_ID).populate('products.product');
            if (!cart) throw new Error('Carrito no encontrado');
    
            const product = await Product.findById(productId);
            if (!product) throw new Error('Producto no encontrado');
    
            if (quantity > parseInt(product.stock)) {
                throw new Error('Cantidad excede el stock disponible');
            }
    
            const productIndex = cart.products.findIndex(p => p.product._id.toString() === productId);
    
            if (productIndex === -1) {
                
                cart.products.push({ product: productId, quantity });
            } else {
                const existingQuantity = cart.products[productIndex].quantity;
                const newQuantity = existingQuantity + quantity;
                if (newQuantity > product.stock) {
                    throw new Error('Cantidad en el carrito excede el stock disponible');
                }
                cart.products[productIndex].quantity = newQuantity;
            }
            await cart.save();
            return { success: true, message: 'Producto agregado al carrito' };
        } catch (error) {
            console.error(`Error al agregar producto al carrito: ${error.message}`);
            throw new Error(error.message);
        }
    }
    
  
    

    async getCartById(cartId = CART_ID) {
        try {
            const cart = await Cart.findById(cartId).populate('products.product');
            if (!cart) throw new Error('Carrito no encontrado');
            return cart;
        } catch (error) {
            console.error(`Error ID: ${error.message}`);
            throw error;
        }
    }
    async removeProductFromCart(cartId, productId) {
        try {
            const cart = await Cart.findById(cartId);
            if (!cart) throw new Error('Carrito no encontrado');
            
            const productIndex = cart.products.findIndex(p => p.product.toString() === productId);
            if (productIndex === -1) throw new Error('Producto no encontrado en el carrito');
            
            cart.products.splice(productIndex, 1);  
            await cart.save();
            return cart;
        } catch (error) {
            console.error(`Error en removeProductFromCart: ${error.message}`);
            throw error;
        }
    }
    

    async emptyCart(cartId) {
        const cart = await Cart.findById(cartId);
        cart.products = [];
        await cart.save();
    }
    
    
}

export default CartManager;
