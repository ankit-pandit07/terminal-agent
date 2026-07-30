import { Router } from "express";
import { AgentService } from "../agent/agent.service.js";
import { AgentEventEmitter } from "../events/agent-event-emitter.js";


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
        const executions=await agent.getExecutions(
            req.params.conversationId,
        );
        res.json(executions);
    }catch(error){
        next(error);
    }
})
router.post("/stream", async (req, res, next) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  res.flushHeaders();

  const emitter = new AgentEventEmitter();

  emitter.on("event", (event) => {
    res.write(`event: ${event.type}\n`);
    res.write(`data: ${JSON.stringify(event)}\n\n`);
  });

  try {
    const result = await agent.process(
      {
        message: req.body.message,
        conversationId: req.body.conversationId,
      },
      emitter,
    );

    res.write(`event: done\n`);
    res.write(`data: ${JSON.stringify(result)}\n\n`);

    res.end();
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error";

    res.write(`event: error\n`);
    res.write(`data: ${JSON.stringify({ message })}\n\n`);

    res.end();
  }
});
export default router;
