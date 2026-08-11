import { Router } from "express";
import { AgentService } from "../agent/agent.service.js";
import { AgentEventEmitter } from "../events/agent-event-emitter.js";
import { success, z } from "zod";
import type { Plan } from "../planner/planner.js";
import type { ToolCategory, ToolInput } from "../tools/base/tool.interface.js";
import { history } from "../conversation/conversation.controller.js";

const router = Router();

const agent = new AgentService();

const chatSchema = z.object({
  message: z
    .string()
    .trim()
    .min(1, "Message is required.")
    .max(5000, "Message is to long."),
  conversationId: z.string().optional(),
});

const executeSchema = z.object({
  plan: z.object({
    steps: z.array(
      z.object({
        tool: z.string(),
        input: z.record(z.string(), z.unknown()),
        reason: z.string().optional(),
        priority: z.number().optional(),
      }),
    ),
  }),
});

router.post("/", async (req, res, next) => {
  try {
    const body = chatSchema.parse(req.body);

    const result = await agent.process({
      message: body.message,
      ...(body.conversationId ? { conversationId: body.conversationId } : {}),
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.post("/confirm/:confirmationId",async(req,res,next)=>{
  try {
    const result=await agent.confirmExecution(req.params.confirmationId);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.post("/cancel/:confirmationId", async(req,res,next)=>{
  try {
    const result=agent.cancelConfirmation(req.params.confirmationId);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.get("/conversations", async (_, res, next) => {
  try {
    const history = await agent.getHistory();
    res.json(history);
  } catch (error) {
    next(error);
  }
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

router.get("/executions/detail/:id", async (req, res, next) => {
  try {
    const execution = await agent.getExecution(req.params.id);
    res.json(execution);
  } catch (error) {
    next(error);
  }
});

router.get("/executions/:conversationId", async (req, res, next) => {
  try {
    const executions = await agent.getExecutions(req.params.conversationId);

    res.json(executions);
  } catch (error) {
    next(error);
  }
});

router.get("/session", async (_, res, next) => {
  try {
    const session = await agent.getSession();
    console.log(session);
    res.json({
      success: true,
      session,
    });
  } catch (error) {
    next(error);
  }
});

router.get("/workspace", async (_, res, next) => {
  try {
    const workspace = await agent.getWorkspace();

    res.json({
      success: true,
      workspace,
    });
  } catch (error) {
    next(error);
  }
});

router.get("/memory", async (_, res, next) => {
  try {
    const memory = await agent.getMemoryHistory();

    res.json({
      success: true,
      memory,
    });
  } catch (error) {
    next(error);
  }
});

router.get("/memory/conversation/:conversationId", async (req, res, next) => {
  try {
    const memory = await agent.getConversationMemory(req.params.conversationId);
    res.json({
      success: true,
      memory,
    });
  } catch (error) {
    next(error);
  }
});

router.post("/plan", async (req, res, next) => {
  try {
    const body = chatSchema.parse(req.body);
    const plan = await agent.createPlan(body.message);
    res.json({
      success: true,
      plan,
    });
  } catch (error) {
    next(error);
  }
});

router.post("/execute", async (req, res, next) => {
  try {
    const body = executeSchema.parse(req.body);
    const plan: Plan = {
      source: "rule",
      steps: body.plan.steps.map((step) => ({
        tool: step.tool,
        input: step.input as ToolInput,

        ...(step.reason !== undefined ? { reason: step.reason } : {}),
        ...(step.priority !== undefined ? { priority: step.priority } : {}),
      })),
    };

    const result = await agent.executePlan(plan);

    res.json({
      success: true,
      result,
    });
  } catch (error) {
    next(error);
  }
});
router.post("/stream", async (req, res, next) => {
  try {
    const body = chatSchema.parse(req.body);

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    const emitter = new AgentEventEmitter();
    emitter.on("event", (event) => {
      res.write(`event: ${event.type}\n`);
      res.write(`data: ${JSON.stringify(event)}\n\n`);
    });

    const result = await agent.process(
      {
        message: body.message,
        ...(body.conversationId ? { conversationId: body.conversationId } : {}),
      },
      emitter,
    );
    res.write(`event: done\n`);
    res.write(`data: ${JSON.stringify(result)}\n\n`);

    res.end();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    res.write(`event: error\n`);
    res.write(`data: ${JSON.stringify({ message })}\n\n`);

    res.end();
  }
});

router.get("/history", async (_req, res, next) => {
  try {
    const result = await history();

    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
