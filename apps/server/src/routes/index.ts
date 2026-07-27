import {Router} from "express"
import healthRoute from "./health.route.js";
import chatRoute from "./chat.route.js"

const router=Router();

router.use("/health",healthRoute);
router.use("/chat",chatRoute);
export default router;