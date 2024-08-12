import Cart from '../model/cart.model.js';

class CartManager {
    async addProductToCart(cartId, productId) {
        try {
            const cart = await Cart.findById(cartId);
            if (!cart) throw new Error('Carrito no encontrado');

            const productIndex = cart.products.findIndex(p => p.product.toString() === productId);
            if (productIndex === -1) {
                cart.products.push({ product: productId, quantity: 1 });
            } else {
                cart.products[productIndex].quantity += 1;
            }

            await cart.save();
            return cart;
        } catch (error) {
            console.error(`Error al agregar producto al carrito: ${error.message}`);
            throw error;
        }
    }

    async getCartById(cartId) {
        try {
            const cart = await Cart.findById(cartId).populate('products.product');
            if (!cart) throw new Error('Carrito no encontrado');
            return cart;
        } catch (error) {
            console.error(`Error al obtener carrito por ID: ${error.message}`);
            throw error;
        }
    }

    async createCart() {
        try {
            const newCart = new Cart({ products: [] });
            await newCart.save();
            return newCart;
        } catch (error) {
            console.error(`Error al crear carrito: ${error.message}`);
            throw error;
        }
    }
}

export default CartManager;
