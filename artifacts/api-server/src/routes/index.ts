import { Router, type IRouter } from "express";
import healthRouter from "./health";
import posLaunchRouter from "./pos-launch";

const router: IRouter = Router();

router.use(healthRouter);
router.use(posLaunchRouter);

export default router;
