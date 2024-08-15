import { Router } from 'express';
import ProductManager from './productsM.js';
import CartManager from './cartM.js';
import mongoose from 'mongoose';
import Product from '../model/product.model.js';

const router = Router();
const productManager = new ProductManager();
const cartManager = new CartManager();

const fixedCartId = process.env.CART_ID || '66b91b709005a2ded5f5535a';

router.get('/', (req, res) => {
    res.render('home'); 
});

router.get('/products', async (req, res) => {
    try {
        const { limit = 10, page = 1, sort = '', query = '', minPrice = '', maxPrice = '' } = req.query;

        const queryOptions = {
            limit: parseInt(limit),
            page: parseInt(page),
            sort: sort ? { price: sort === 'mayor' ? -1 : 1 } : {},
            customLabels: { docs: 'products' }
        };

        const filter = {};
        if (query) {
            filter.category = query; 
        }
        if (minPrice) {
            filter.price = { ...filter.price, $gte: parseFloat(minPrice) }; 
        }
        if (maxPrice) {
            filter.price = { ...filter.price, $lte: parseFloat(maxPrice) }; 
        }
        const result = await Product.paginate(filter, queryOptions);
        const sortOptions = {
            isMenor: sort === 'menor',
            isMayor: sort === 'mayor'
        };
        res.render('products', {
            products: result.products,
            totalPages: result.totalPages,
            prevPage: result.prevPage,
            nextPage: result.nextPage,
            hasPrevPage: result.hasPrevPage,
            hasNextPage: result.hasNextPage,
            page: result.page,
            limit: result.limit,
            query,
            minPrice,
            maxPrice,
            sort, 
            ...sortOptions,
            cartId: fixedCartId 
        });
    } catch (error) {
        console.error(`Error al cargar productos: ${error.message}`);
        res.status(500).send('Error al cargar productos');
    }
});

router.get('/products/:pid', async (req, res) => {
    try {
        const { pid } = req.params;
        if (!mongoose.Types.ObjectId.isValid(pid)) {
            return res.status(400).send('Identificador de producto no válido');
        }
        const product = await productManager.getProductById(pid);
        if (!product) return res.status(404).send('Producto no encontrado');
        res.render('productDetail', { product, cartId: fixedCartId });
    } catch (error) {
        console.error(`Error al obtener producto: ${error.message}`);
        res.status(500).send('Error al obtener producto');
    }
});

router.get('/cart', async (req, res) => { 
    try {
        const cart = await cartManager.getCartById(fixedCartId); 

        if (cart) {
            res.render('cart', { cart });
        } else {
            res.status(404).send('Carrito no encontrado');
        }
    } catch (error) {
        console.error(`Error al cargar el carrito: ${error.message}`);
        res.status(500).send('Error al cargar el carrito');
    }
});

router.post('/api/carts/add/:productId', async (req, res) => {
    try {
        const { quantity } = req.body;
        
        const cart = await cartManager.addProductToCart(req.params.productId, quantity);
        res.status(200).json(cart);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.delete('/api/carts/remove/:productId', async (req, res) => {
    try {
        const { productId } = req.params;
        await cartManager.removeProductFromCart(fixedCartId, productId);
        res.status(200).json({ success: true });
    } catch (error) {
        console.error(`Error al eliminar el producto del carrito: ${error.message}`);
        res.status(500).json({ success: false, message: `Error al eliminar el producto: ${error.message}` });
    }
});


router.delete('/api/carts/empty', async (req, res) => {
    try {
        await cartManager.emptyCart(fixedCartId);
        res.status(200).json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});


export default router;