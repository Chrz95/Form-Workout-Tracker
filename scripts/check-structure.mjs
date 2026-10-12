import { readdir, readFile } from "node:fs/promises";
import ts from "typescript";
const MAXIMUM_COMPONENT_LINES = 100;
const MAXIMUM_SOURCE_LINE_LENGTH = 120;
const ROOT_DIRECTORIES = ["frontend/src", "backend/src", "shared", "scripts"];
const SOURCE_PATTERN = /\.(?:tsx?|m?js|css)$/;
const COMPONENT_PATTERN = /\.tsx$/;
const TEST_PATTERN = /\.test\.tsx?$/;
const NAMING_PATTERN = /^(?:[a-z][A-Za-z0-9]*|[A-Z][A-Za-z0-9]*|[A-Z][A-Z0-9_]*|_[a-z][A-Za-z0-9]*)$/;
const problems = [];
let componentCount = 0;
let documentedFunctionCount = 0;
/** Collects authored implementation files, excluding generated output and data.
 * @param {string} directory - Source directory.
 * @returns {Promise<string[]>} Implementation paths.
 */
async function collectSourceFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const groups = await Promise.all(
    entries.map(async (entry) => {
      const path = `${directory}/${entry.name}`;
      return entry.isDirectory() ? collectSourceFiles(path) : SOURCE_PATTERN.test(path) ? [path] : [];
    }),
  );
  return groups.flat();
}
/** Checks named functions and applicable naming conventions with TypeScript's parser.
 * @param {string} path - Source filename.
 * @param {string} content - Authored source.
 */
function inspectDocumentation(path, content) {
  const source = ts.createSourceFile(path, content, ts.ScriptTarget.Latest, true);
  /** Inspects each syntax node without treating trivial anonymous callbacks as named functions.
   * @param {ts.Node} node - Syntax node.
   */
  function visit(node) {
    const isNamedArrow =
      ts.isVariableDeclaration(node) &&
      node.initializer &&
      (ts.isArrowFunction(node.initializer) || ts.isFunctionExpression(node.initializer));
    const isNamedFunction =
      ts.isFunctionDeclaration(node) ||
      ts.isMethodDeclaration(node) ||
      ts.isConstructorDeclaration(node) ||
      isNamedArrow;
    if (isNamedFunction) {
      const documentation = ts.getJSDocCommentsAndTags(node);
      if (!documentation.length) {
        problems.push(`${path}: missing JSDoc for a named function`);
      } else {
        documentedFunctionCount += 1;
        const functionNode = isNamedArrow ? node.initializer : node;
        const parameterTags = ts.getJSDocTags(node).filter(ts.isJSDocParameterTag);
        const parameters = functionNode.parameters ?? [];
        for (const parameter of parameters) {
          if (ts.isIdentifier(parameter.name)) {
            const tag = parameterTags.find((entry) => entry.name.getText(source) === parameter.name.text);
            if (!tag?.typeExpression) {
              problems.push(`${path}: missing typed parameter documentation`);
            }
          }
        }
      }
    }
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && !NAMING_PATTERN.test(node.name.text)) {
      problems.push(`${path}: nonconforming identifier ${node.name.text}`);
    }
    ts.forEachChild(node, visit);
  }
  visit(source);
}
for (const directory of ROOT_DIRECTORIES) {
  for (const path of await collectSourceFiles(directory)) {
    const content = await readFile(path, "utf8");
    const lines = content.trimEnd().split("\n");
    if (COMPONENT_PATTERN.test(path) && !TEST_PATTERN.test(path)) {
      componentCount += 1;
      if (lines.length > MAXIMUM_COMPONENT_LINES) {
        problems.push(`${path}: ${lines.length} component lines`);
      }
    }
    lines.forEach((line, index) => {
      if (line.length > MAXIMUM_SOURCE_LINE_LENGTH) {
        problems.push(`${path}:${index + 1}: line exceeds 120 characters`);
      }
    });
    if (!path.endsWith(".css")) {
      inspectDocumentation(path, content);
    }
  }
}
if (problems.length) {
  process.stderr.write(`${problems.join("\n")}\n`);
  process.exitCode = 1;
} else {
  process.stdout.write(`Checked ${componentCount} component files and ${documentedFunctionCount} named functions.\n`);
}
