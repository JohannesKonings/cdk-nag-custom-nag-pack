import { parse } from "path";
import { CfnResource, TagManager } from "aws-cdk-lib";
import { NagRuleCompliance, NagRuleResult } from "cdk-nag";
import { invokeTags } from "./utils/tagUtils";
import { Cr1TagsToCheck, CustomChecks } from "../custom-checks";

/**
 * Check for existing Tags
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleResult => {
    if ("tags" in node) {
      const cr1TagsToCheck = CustomChecks.cr1TagsToCheck;
      invokeTags(node.stack);
      const tagsResource = node.tags as TagManager;
      const tagsStack = node.stack.tags;
      if (
        areTagsExist(tagsResource, cr1TagsToCheck) ||
        areTagsExist(tagsStack, cr1TagsToCheck)
      ) {
        return NagRuleCompliance.COMPLIANT;
      } else {
        return NagRuleCompliance.NON_COMPLIANT;
      }
    } else {
      return NagRuleCompliance.NOT_APPLICABLE;
    }
  },
  "name",
  { value: parse(__filename).name },
);

function areTagsExist(
  tags: TagManager,
  cr1TagsToCheck: Cr1TagsToCheck,
): boolean {
  const tagsExist = cr1TagsToCheck.every((tag) =>
    tags.tagValues().hasOwnProperty(tag),
  );
  if (!tagsExist) {
    return false;
  }

  return true;
}
