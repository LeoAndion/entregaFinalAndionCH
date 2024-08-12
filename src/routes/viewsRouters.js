import { Router } from 'express';
import ProductManager from './productsM.js';
import CartManager from './cartM.js';
import mongoose from 'mongoose';
import Product from '../model/product.model.js';
import Cart from '../model/cart.model.js';

const router = Router();
const productManager = new ProductManager();
const cartManager = new CartManager();


router.get('/', (req, res) => {
    res.render('home'); 
});

router.get('/products', async (req, res) => {
  try {
    const { limit = 10, page = 1, sort = '', query = '', minPrice = '', maxPrice = '' } = req.query;

    const queryOptions = {
      limit: parseInt(limit),
      page: parseInt(page),
      sort: sort ? { price: sort === 'desc' ? -1 : 1 } : {},
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
      isAscSelected: sort === 'asc',
      isDescSelected: sort === 'desc'
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
      cartId: process.env.CART_ID 
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
        res.render('productDetail', { product });
    } catch (error) {
        console.error(`Error al obtener producto: ${error.message}`);
        res.status(500).send('Error al obtener producto');
    }
});


router.get('/carts/:cid', async (req, res) => {
  try {
    const cart = await cartManager.getCartById(req.params.cid);
    if (!cart) return res.status(404).send('Carrito no encontrado');
    res.render('cartDetail', { cart });
  } catch (error) {
    console.error(`Error al obtener carrito: ${error.message}`);
    res.status(500).send('Error al obtener carrito');
  }
});


router.post('/api/carts/add/:pid', async (req, res) => {
    try {
        const cartId = 'id_del_carrito'; 
        const productId = req.params.pid;

        const cart = await cartManager.addProductToCart(cartId, productId);
        res.json({ status: 'success', cart });
    } catch (error) {
        console.error(`Error al agregar producto al carrito: ${error.message}`);
        res.status(500).json({ status: 'error', message: error.message });
    }
});
router.delete('/api/carts/:cid/products/:pid', async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const cart = await Cart.findById(cid);
    if (!cart) return res.status(404).send('Carrito no encontrado');
    cart.products = cart.products.filter(p => p.product.toString() !== pid);

    await cart.save();
    res.json({ status: 'Hecho', cart });
  } catch (error) {
    console.error(`Error al eliminar producto del carrito: ${error.message}`);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

router.put('/api/carts/:cid', async (req, res) => {
  try {
    const { cid } = req.params;
    const { products } = req.body; // Asume que el cuerpo de la solicitud tiene un arreglo de productos

    const cart = await Cart.findById(cid);
    if (!cart) return res.status(404).send('Carrito no encontrado');

    cart.products = products;
    await cart.save();
    res.json({ status: 'success', cart });
  } catch (error) {
    console.error(`Error al actualizar el carrito: ${error.message}`);
    res.status(500).json({ status: 'error', message: error.message });
  }
});
router.put('/api/carts/:cid/products/:pid', async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const { quantity } = req.body; 

    const cart = await Cart.findById(cid);
    if (!cart) return res.status(404).send('Carrito no encontrado');

    const product = cart.products.find(p => p.product.toString() === pid);
    if (!product) return res.status(404).send('Producto no encontrado en el carrito');

    product.quantity = quantity;

    await cart.save();
    res.json({ status: 'success', cart });
  } catch (error) {
    console.error(`Error al actualizar la cantidad del producto: ${error.message}`);
    res.status(500).json({ status: 'error', message: error.message });
  }
});
router.delete('/api/carts/:cid', async (req, res) => {
  try {
    const { cid } = req.params;
    const cart = await Cart.findById(cid);
    if (!cart) return res.status(404).send('Carrito no encontrado');

    cart.products = [];
    await cart.save();
    res.json({ status: 'success', cart });
  } catch (error) {
    console.error(`Error al vaciar el carrito: ${error.message}`);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

export default router;
