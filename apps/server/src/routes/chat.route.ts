import { Router } from "express";
import { AgentService } from "../agent/agent.service.js";
import { AgentEventEmitter } from "../events/agent-event-emitter.js";
import { z } from "zod";
import type { Plan } from "../planner/planner.js";
import type { ToolInput } from "../tools/base/tool.interface.js";
import { requireAuth, extractSessionToken } from "../middleware/auth.middleware.js";

const router = Router();

// Apply requireAuth middleware to protect all chat and agent operations
router.use(requireAuth);

const agent = new AgentService();

const chatSchema = z.object({
  message: z
    .string()
    .trim()
    .min(1, "Message is required.")
    .max(5000, "Message is too long."),
  conversationId: z.string().optional(),
  fileIds: z.array(z.string()).optional(),
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

function paramStr(val: string | string[] | undefined): string {
  return Array.isArray(val) ? val[0] ?? "" : (val ?? "");
}

router.post("/", async (req, res, next) => {
  try {
    const body = chatSchema.parse(req.body);
    const token = extractSessionToken(req);

    const result = await agent.process({
      message: body.message,
      ...(body.conversationId ? { conversationId: body.conversationId } : {}),
      userId: req.user?.id,
      fileIds: body.fileIds,
      authToken: token ?? undefined,
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.post("/confirm/:confirmationId", async (req, res, next) => {
  try {
    const result = await agent.confirmExecution(
      paramStr(req.params.confirmationId),
      undefined,
      req.user?.id
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.post("/cancel/:confirmationId", async (req, res, next) => {
  try {
    const result = agent.cancelConfirmation(
      paramStr(req.params.confirmationId),
      req.user?.id
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.get("/conversations", async (req, res, next) => {
  try {
    const history = await agent.getHistory(req.user?.id);
    res.json(history);
  } catch (error) {
    next(error);
  }
});

router.delete("/conversations/:id", async (req, res, next) => {
  try {
    const result = await agent.deleteConversation(paramStr(req.params.id), req.user?.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.get("/conversations/:id", async (req, res, next) => {
  try {
    const conversation = await agent.getConversation(paramStr(req.params.id), req.user?.id);
    res.json(conversation);
  } catch (error) {
    next(error);
  }
});

router.get("/executions/detail/:id", async (req, res, next) => {
  try {
    const execution = await agent.getExecution(paramStr(req.params.id), req.user?.id);
    res.json(execution);
  } catch (error) {
    next(error);
  }
});

router.get("/executions/:conversationId", async (req, res, next) => {
  try {
    const executions = await agent.getExecutions(paramStr(req.params.conversationId), req.user?.id);
    res.json(executions);
  } catch (error) {
    next(error);
  }
});

router.get("/session", async (_, res, next) => {
  try {
    const session = await agent.getSession();
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

router.get("/memory", async (req, res, next) => {
  try {
    const memory = await agent.getMemoryHistory(req.user?.id);

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
    const memory = await agent.getConversationMemory(paramStr(req.params.conversationId), req.user?.id);
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

    const result = await agent.executePlan(plan, undefined, req.user?.id);

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
    const token = extractSessionToken(req);

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
        userId: req.user?.id,
        fileIds: body.fileIds,
        authToken: token ?? undefined,
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

router.get("/history", async (req, res, next) => {
  try {
    const conversations = await agent.getHistory(req.user?.id);

    res.json({
      success: true,
      history: conversations,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
