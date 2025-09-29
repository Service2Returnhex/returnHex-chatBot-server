import express from "express";
import USER_ROLE from "../../constants/userRole";
import auth from "../../Middlewares/auth";
import { PageController } from "./page.controller";
const router = express.Router();

router.get("/products", PageController.getProducts);
router.get("/trained-products", PageController.getTrainedProducts);
router.get("/product/:id", PageController.getProductById);
router.post("/product", PageController.createProduct);
router.put("/product/:id", PageController.updateProduct);
router.delete("/product/:id", PageController.deleteProduct)

router.get("/shop", auth(USER_ROLE.admin, USER_ROLE.user), PageController.getShops);
router.get("/shop/:id", PageController.getShopById);
router.get("/shop/owner/:ownerId", PageController.getPagesByOwner);
router.patch("/:id/toggle-status", auth(USER_ROLE.admin, USER_ROLE.user), PageController.togglePageStatus);
router.post("/shop", PageController.createShop);
router.patch("/shop/:id", PageController.updateShop);
router.delete("/shop/:id", PageController.deleteShop);

router.patch("/shop/set-dm-promt/:id", PageController.setDmPromt);
router.patch("/shop/set-cmnt-promt/:id", PageController.setCmntPromt);
router.post("/product/:postId/train", PageController.trainProductHandler);

router.get("/shop/:shopId/msg-count", PageController.getDmMessageCount);
router.get("/shop/:shopId/cmt-count", PageController.getCmtMessageCount);
router.get("/shop/:shopId/token-count", PageController.getUsageByShop);
router.get("/shop/:shopId/msg-counts", PageController.getMsgCounts);

router.get("/shop/order/:shopId", PageController.getOrders);
router.patch("/shop/order/:id", auth("user"), PageController.updateOrderStatus);
export const PageRouter = router;
