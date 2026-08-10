export type AgentEvent =
  | {
      type: "planning";
      message: string;
    }
  | {
      type: "plan-created";
      steps: number;
    }
  | {
      type: "tool-start";
      tool: string;
    }
  | {
      type: "tool-complete";
      tool: string;
      success: boolean;
    }
  | {
      type: "completed";
      response: string;
      converstionId:string
    }
  | {
      type: "error";
      message: string;
    };