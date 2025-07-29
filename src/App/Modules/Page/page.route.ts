import express from 'express'
import { PageController } from './page.controller';
const router = express.Router();



router.get('/products', PageController.getProducts);
// router.get('/product/:id', PageController.getProductById);
router.post('/product', PageController.createProduct);
router.put('/product/:id', PageController.updateProduct);
router.delete('/product/:id', PageController.deleteProduct);


router.get('/shop', PageController.getShops);
router.get('/shop/:id', PageController.getShopById);
router.post('/shop', PageController.createShop);
router.put('/shop/:id', PageController.updateShop);
router.delete('/shop/:id', PageController.deleteShop);

export const PageRouter = router;