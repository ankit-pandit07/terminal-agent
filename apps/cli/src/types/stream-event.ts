export interface PlanningEvent {
    type:"planning";
    message:string;
}

export interface PlanCreatedEvent {
    type: "plan-created";
    steps:number;
}

export interface ToolStartEvent {
    type:"tool-start";
    tool:string;
}

export interface ToolCompleteEvent {
    type:"tool-complete";
    tool:string;
    success:boolean;
}

export interface GoalEvent {
    type:"goal";
    goal:{
        completed:boolean;
        confidence:number;
        reason:string;
    }
}

export interface CompletedEvent{
    type:"completed";
    response:string;
}

export interface ErrorEvent{
    type:"error";
    message:string;
}

export interface DoneEvent {
  type: "done";
  success: boolean;
  response: string;
  conversationId: string;
}

export type StreamEvent = 
| PlanningEvent
| PlanCreatedEvent
| ToolStartEvent
| ToolCompleteEvent
| GoalEvent
| CompletedEvent
| ErrorEvent
| DoneEvent