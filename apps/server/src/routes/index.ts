import {Router} from "express"
import healthRoute from "./health.route.js";
import chatRoute from "./chat.route.js"
import toolRoutes from "./tool.route.js";
import authRoute from "./auth.route.js";

const router=Router();

router.use("/auth", authRoute);
router.use("/health",healthRoute);
router.use("/tools", toolRoutes);
router.use("/chat",chatRoute);
export default router;