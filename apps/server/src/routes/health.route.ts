import { Router } from "express";
import { HealthService } from "../health/health.service.js";

const router=Router();

const healthService= new HealthService();

router.get("/",(_,res)=>{
    res.json(healthService.getHealth());
})

router.get("/status",(_,res)=>{
    res.json(healthService.getStatus())
})

router.get("/metrics", (_, res) => {
  res.json(healthService.getMetrics());
});

router.get("/agent", (_, res) => {
  res.json(healthService.getAgentInfo());
});

export default router;