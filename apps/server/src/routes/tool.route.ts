import { Router } from "express";
import { AgentService } from "../agent/agent.service.js";
import { z } from "zod";
import type { ToolCategory } from "../tools/base/tool.interface.js";


const router = Router();
const agent = new AgentService();

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

router.get("/",(_,res)=>{
  const tools = agent.getTools();

  res.json({
    success:true,
    total:tools.length,
    tools
  })
})

router.get("/tools/:name",(req,res)=>{
  const tool = agent.getTool(req.params.name);

  if(!tool){
    return res.status(404).json({
      success:false,
      message:"Tool not found",
    })
  }
  res.json({
    success:true,
    tool
  })
});

router.patch("/tools/:name/enable",(req,res)=>{
  const success=agent.enableTool(req.params.name);

  if(!success){
    return res.status(404).json({
      success:false,
      message:"Tool not found."
    })
  }

  res.json({
    success:true,
    message:"Tool enabled"
  })
})
router.patch("/tools/:name/disable", (req, res) => {
  const success = agent.disableTool(req.params.name);

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

router.get("/tools/category/:category",(req,res)=>{
  const tools=agent.getToolsByCategory(
    req.params.category as ToolCategory
  );

  res.json({
    success:true,
    total:tools.length,
    tools,
  })
})



export default router;