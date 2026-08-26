import { Router } from "express";
import { AgentService } from "../agent/agent.service.js";
import type { ToolCategory } from "../tools/base/tool.interface.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

// Require auth for tool registry inspection and configuration
router.use(requireAuth);

const agent = new AgentService();

router.get("/", (_, res) => {
  const tools = agent.getTools();

  res.json({
    success: true,
    total: tools.length,
    tools,
  });
});

router.get("/:name", (req, res) => {
  const tool = agent.getTool(req.params.name);

  if (!tool) {
    return res.status(404).json({
      success: false,
      message: "Tool not found",
    });
  }

  res.json({
    success: true,
    tool,
  });
});

router.patch("/:name/enable", (req, res) => {
  const success = agent.enableTool(
    req.params.name,
  );

  if (!success) {
    return res.status(404).json({
      success: false,
      message: "Tool not found.",
    });
  }

  res.json({
    success: true,
    message: "Tool enabled",
  });
});

router.patch("/:name/disable", (req, res) => {
  const success = agent.disableTool(
    req.params.name,
  );

  if (!success) {
    return res.status(404).json({
      success: false,
      message: "Tool not found.",
    });
  }

  res.json({
    success: true,
    message: "Tool disabled.",
  });
});

router.get(
  "/category/:category",
  (req, res) => {
    const tools = agent.getToolsByCategory(
      req.params.category as ToolCategory,
    );

    res.json({
      success: true,
      total: tools.length,
      tools,
    });
  },
);

export default router;