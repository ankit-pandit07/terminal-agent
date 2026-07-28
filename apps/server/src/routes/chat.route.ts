import { Router } from "express";
import { AgentService } from "../agent/agent.service.js";

const router=Router();

const agent=new AgentService();

router.post("/",async(req,res)=>{
    const result=await agent.process({
        message:req.body.message,
    });

    res.json(result);
})
router.get("/conversations", async (_, res) => {
    const history = await agent.getHistory();

    res.json(history);
});

export default router;