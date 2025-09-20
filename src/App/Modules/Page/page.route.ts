import express from "express";
import { PageController } from "./page.controller";
const router = express.Router();

router.get("/products", PageController.getProducts);
router.get("/trained-products", PageController.getTrainedProducts);
router.get("/product/:id", PageController.getProductById);
router.post("/product", PageController.createProduct);
router.put("/product/:id", PageController.updateProduct);
router.delete("/product/:id", PageController.deleteProduct);

router.get("/shop", PageController.getShops);
router.get("/shop/:id", PageController.getShopById);
router.post("/shop", PageController.createShop);
router.patch("/shop/:id", PageController.updateShop);
router.delete("/shop/:id", PageController.deleteShop);

router.patch("/shop/set-dm-promt/:id", PageController.setDmPromt);
router.patch("/shop/set-cmnt-promt/:id", PageController.setCmntPromt);
router.post("/product/:postId/train", PageController.trainProductHandler);

export const PageRouter = router;
