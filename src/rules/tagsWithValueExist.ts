import { parse } from "path";
import { CfnResource, TagManager } from "aws-cdk-lib";
import { NagRuleCompliance, NagRuleResult } from "cdk-nag";
import { Cr2TagsWithValueToCheck, CustomChecks } from "../custom-checks";
import { invokeTags } from "./utils/tagUtils";

/**
 * Check for existing Tags
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleResult => {
    if ("tags" in node) {
      const cr2TagsWithValueToCheck = CustomChecks.cr2TagsWithValueToCheck;
      invokeTags(node.stack);
      const tagsResource = node.tags as TagManager;
      const tagsStack = node.stack.tags;
      if (
        areTagsExistWithRightValue(tagsResource, cr2TagsWithValueToCheck) ||
        areTagsExistWithRightValue(tagsStack, cr2TagsWithValueToCheck)
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

function areTagsExistWithRightValue(
  tags: TagManager,
  cr2TagsWithValueToCheck: Cr2TagsWithValueToCheck,
): boolean {
  const tagsExistWithRightValue = Object.keys(cr2TagsWithValueToCheck).every(
    (tagNameValue) => {
      const doesTagExist = tags.tagValues().hasOwnProperty(tagNameValue);
      if (!doesTagExist) {
        return false;
      }

      const isTheRightValue = cr2TagsWithValueToCheck[tagNameValue].includes(
        tags.tagValues()[tagNameValue],
      );

      if (!isTheRightValue) {
        return false;
      }
      return true;
    },
  );
  if (!tagsExistWithRightValue) {
    return false;
  }

  return true;
}
