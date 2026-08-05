import { ASTParser } from "../ast/ast.parser.js";
import { CallParser } from "./call.parser.js";
import { CallGraphBuilder } from "./call.graph.js";

export class CallGraphService {
  private ast = new ASTParser();

  private parser = new CallParser();

  private builder = new CallGraphBuilder();

  async build(file: string) {
    const ast = await this.ast.parse(file);

    const edges =
      this.parser.parse(ast);

    return this.builder.build(edges);
  }
}