import Product from '../model/product.model.js';

class ProductManager {
    async getProductById(id) {
        try {
            const product = await Product.findById(id);
            if (!product) throw new Error('Producto no encontrado');
            return product;
        } catch (error) {
            console.error(`Error en getProductById: ${error.message}`);
            throw error;
        }
    }

    async getProductList({ limit = 10, page = 1, sort = '', query = '' }) {
        try {
            const filter = query ? { category: query } : {};
            const sortOptions = sort === 'asc' ? { price: 1 } : sort === 'desc' ? { price: -1 } : {};
            const products = await Product.find(filter)
                .sort(sortOptions)
                .limit(parseInt(limit))
                .skip((page - 1) * limit);
            return products;
        } catch (error) {
            console.error(`Error en getProductList: ${error.message}`);
            throw error;
        }
    }

    async addProduct(productData) {
        try {
            const newProduct = new Product(productData);
            await newProduct.save();
            return newProduct;
        } catch (error) {
            console.error(`Error en addProduct: ${error.message}`);
            throw error;
        }
    }

    async updateProductById(id, productUpdate) {
        try {
            const updatedProduct = await Product.findByIdAndUpdate(id, productUpdate, { new: true });
            if (!updatedProduct) throw new Error('Producto no encontrado');
            return updatedProduct;
        } catch (error) {
            console.error(`Error en updateProductById: ${error.message}`);
            throw error;
        }
    }

    async deleteProductById(id) {
        try {
            const deletedProduct = await Product.findByIdAndDelete(id);
            if (!deletedProduct) throw new Error('Producto no encontrado');
            return deletedProduct;
        } catch (error) {
            console.error(`Error en deleteProductById: ${error.message}`);
            throw error;
        }
    }
}

export default ProductManager;

