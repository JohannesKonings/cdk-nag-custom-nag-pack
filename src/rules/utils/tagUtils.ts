import { Annotations, Aspects, IAspect, Stage, Tag } from "aws-cdk-lib";
import { IConstruct } from "constructs";
// Recursively Invoke Tag aspects
// This code is completely copied from the CDK source code except for filtering for Tag aspects
// Source:
// https://github.com/aws/aws-cdk/blob/main/packages/aws-cdk-lib/core/lib/private/synthesis.ts#L217
function invokeTags(root: IConstruct) {
  const invokedByPath: { [nodePath: string]: IAspect[] } = {};

  let nestedAspectWarning = false;
  recurse(root, []);

  function recurse(construct: IConstruct, inheritedAspects: IAspect[]) {
    const node = construct.node;
    const aspects = Aspects.of(construct);
    const tags = aspects.all.filter((a) => a instanceof Tag);
    const allAspectsHere = [...(inheritedAspects ?? []), ...tags];
    const nodeAspectsCount = aspects.all.length;
    for (const aspect of allAspectsHere) {
      let invoked = invokedByPath[node.path];
      if (!invoked) {
        invoked = invokedByPath[node.path] = [];
      }

      if (invoked.includes(aspect)) {
        continue;
      }

      aspect.visit(construct);

      // if an aspect was added to the node while invoking another aspect it will not be invoked, emit a warning
      // the `nestedAspectWarning` flag is used to prevent the warning from being emitted for every child
      if (!nestedAspectWarning && nodeAspectsCount !== aspects.all.length) {
        Annotations.of(construct).addWarningV2(
          "@aws-cdk/core:ignoredAspect",
          "We detected an Aspect was added via another Aspect, and will not be applied",
        );
        nestedAspectWarning = true;
      }

      // mark as invoked for this node
      invoked.push(aspect);
    }

    for (const child of construct.node.children) {
      if (!Stage.isStage(child)) {
        recurse(child, allAspectsHere);
      }
    }
  }
}

export { invokeTags };
