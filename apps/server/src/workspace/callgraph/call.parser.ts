import ts from "typescript";

import type { ASTFile } from "../ast/ast.types.js";
import type { CallEdge } from "./call.types.js";

export class CallParser {
  parse(ast: ASTFile): CallEdge[] {
    const edges: CallEdge[] = [];

    let currentFunction = "<global>";

    const visit = (node: ts.Node) => {
      if (
        ts.isFunctionDeclaration(node) &&
        node.name
      ) {
        const previous = currentFunction;

        currentFunction = node.name.text;

        ts.forEachChild(node, visit);

        currentFunction = previous;

        return;
      }

      if (
        ts.isMethodDeclaration(node) &&
        ts.isIdentifier(node.name)
      ) {
        const previous = currentFunction;

        currentFunction = node.name.text;

        ts.forEachChild(node, visit);

        currentFunction = previous;

        return;
      }

      if (ts.isCallExpression(node)) {
        const expression = node.expression.getText();

        const position =
          ast.sourceFile.getLineAndCharacterOfPosition(
            node.getStart(),
          );

        edges.push({
          caller: currentFunction,
          callee: expression,
          file: ast.path,
          line: position.line + 1,
        });
      }

      ts.forEachChild(node, visit);
    };

    visit(ast.sourceFile);

    return edges;
  }
}