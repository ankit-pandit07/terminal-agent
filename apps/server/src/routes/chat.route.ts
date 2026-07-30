import { Router } from "express";
import { AgentService } from "../agent/agent.service.js";

const router = Router();

const agent = new AgentService();

router.post("/", async (req, res) => {
  const result = await agent.process({
    message: req.body.message,
  });

  res.json(result);
});
router.get("/conversations", async (_, res) => {
  const history = await agent.getHistory();

  res.json(history);
});

router.delete("/conversations/:id", async (req, res, next) => {
  try {
    const result = await agent.deleteConversation(req.params.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
});
router.get("/conversations/:id", async (req, res, next) => {
  try {
    const conversation = await agent.getConversation(req.params.id);

    res.json(conversation);
  } catch (error) {
    next(error);
  }
});

router.get("/executions/:conversationId",async(req,res,next)=>{
    try{
        const executions=await agent.getConversation(
            req.params.conversationId,
        );
        res.json(executions);
    }catch(error){
        next(error);
    }
})
export default router;
