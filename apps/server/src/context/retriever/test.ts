import { SymbolMatcher } from "./symbol.matcher.js";

const matcher = new SymbolMatcher();

const result = await matcher.match(
  process.cwd(),
  "PlannerService",
);

console.log(result);