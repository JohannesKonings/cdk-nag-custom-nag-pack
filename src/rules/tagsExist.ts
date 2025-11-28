import { parse } from "path";
import { CfnResource, TagManager } from "aws-cdk-lib";
import { NagRuleCompliance, NagRuleResult } from "cdk-nag";
import { Cr1TagsToCheck, CustomChecks } from "../customChecks";
import { invokeTags } from "./utils/tagUtils";

/**
 * Check for existing tags on a CloudFormation resource.
 * Validates that all required tags defined in cr1TagsToCheck are present
 * on either the resource level or stack level.
 *
 * @param node - The CfnResource to check for required tags
 * @returns NagRuleResult indicating compliance status
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
