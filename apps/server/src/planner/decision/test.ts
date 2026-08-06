import { DecisionEngine } from "./decision.engine.js";

const engine = new DecisionEngine();

console.log(
  engine.analyze("Show node version"),
);

console.log(
  engine.analyze("Create hello.txt"),
);

console.log(
  engine.analyze("Add JWT Authentication"),
);