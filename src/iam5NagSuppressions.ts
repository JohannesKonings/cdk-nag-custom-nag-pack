import { Stack } from "aws-cdk-lib";
import { CfnPolicy, Effect, type PolicyStatementProps } from "aws-cdk-lib/aws-iam";
import { NagSuppressions } from "cdk-nag";
import type { IConstruct } from "constructs";

type IamPolicyDocument = {
  Statement?: IamPolicyStatement[];
};

type IamPolicyStatement = {
  Effect: Effect;
  Action: string | string[];
  Resource: string | string[];
};

/**
 * Normalize a field value to a sorted array of unique strings.
 * Handles both string and string array inputs for consistent comparison.
 *
 * @param value - A string or array of strings to normalize
 * @returns A sorted array of unique strings
 */
function normalizeField(value: string | string[]): string[] {
  if (typeof value === "string") {
    return [value];
  }
  // Remove duplicates and sort using localeCompare for reliable alphabetical order
  return [...new Set(value)].sort((a, b) => a.localeCompare(b));
}

/**
 * Compare two IAM policy statements for equality.
 * Compares Effect, Action, and Resource fields after normalization.
 *
 * @param statement1 - First policy statement to compare
 * @param statement2 - Second policy statement to compare
 * @returns True if statements are equivalent, false otherwise
 */
function compareStatements(
  statement1: IamPolicyStatement,
  statement2: IamPolicyStatement,
): boolean {
  const keysToCompare = ["Effect", "Action", "Resource"] as const;

  for (const key of keysToCompare) {
    const val1 = normalizeField(statement1[key]);
    const val2 = normalizeField(statement2[key]);

    if (JSON.stringify(val1) !== JSON.stringify(val2)) {
      return false;
    }
  }

  return true;
}

export class Iam5NagSuppressions extends NagSuppressions {
  /**
   * Granularly suppress AwsSolutions-IAM5 findings for specific IAM policy statements.
   *
   * This method only suppresses the finding if ALL wildcard-containing statements in the
   * resource's policy have a matching entry in the appliesTo array. This ensures you only
   * suppress the specific wildcard permissions you've intentionally reviewed and approved.
   *
   * @param resource - The CDK construct to suppress findings for (typically a Lambda, Role, etc.)
   * @param suppressions - Suppression configuration object
   * @param suppressions.id - The cdk-nag rule ID (typically 'AwsSolutions-IAM5')
   * @param suppressions.reason - Explanation for why the suppression is acceptable
   * @param suppressions.appliesTo - Array of policy statements that are allowed to contain wildcards
   * @param applyToChildren - Whether to apply suppressions to child constructs (default: false)
   *
   * @example
   * ```typescript
   * const policyStatementForSuppression: PolicyStatementProps = {
   *   actions: ['xray:PutTelemetryRecords', 'xray:PutTraceSegments'],
   *   resources: ['*'],
   *   effect: Effect.ALLOW,
   * };
   *
   * Iam5NagSuppressions.addIam5StatementResourceSuppressions(
   *   lambda,
   *   {
   *     id: 'AwsSolutions-IAM5',
   *     reason: 'Wildcard required for X-Ray - see https://docs.aws.amazon.com/xray/latest/devguide/security_iam_service-with-iam.html',
   *     appliesTo: [policyStatementForSuppression],
   *   },
   *   true,
   * );
   * ```
   */
  static addIam5StatementResourceSuppressions(
    resource: IConstruct,
    suppressions: {
      id: string;
      reason: string;
      appliesTo: PolicyStatementProps[];
    },
    applyToChildren = false,
  ) {
    for (const child of resource.node.findAll()) {
      // https://github.com/cdklabs/cdk-nag/blob/bfaff5f722b119fa4f38c0706dd848ad47fd98c8/src/rules/iam/IAMNoWildcardPermissions.ts#L71C7-L71C21
      if (child instanceof CfnPolicy) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const policyDocument: IamPolicyDocument = Stack.of(child).resolve(
          child.policyDocument,
        );

        const statementsWithWildcards = (policyDocument.Statement || []).filter(
          (statement) => {
            const actions = Array.isArray(statement.Action)
              ? statement.Action
              : [statement.Action];
            const resources = Array.isArray(statement.Resource)
              ? statement.Resource
              : [statement.Resource];
            return (
              actions.some((a) => typeof a === "string" && a.includes("*")) ||
              resources.some((r) => typeof r === "string" && r.includes("*"))
            );
          },
        );

        // Check if all wildcard statements have at least one matching appliesTo entry
        for (const statement of statementsWithWildcards) {
          const hasMatch = suppressions.appliesTo.some((appliesTo) => {
            if (!appliesTo.effect) {
              throw new Error(
                "appliesTo.effect is required in suppressions for IAM5",
              );
            }
            const appliesToStatement: IamPolicyStatement = {
              Effect: appliesTo.effect,
              Action: appliesTo.actions ?? [],
              Resource: appliesTo.resources ?? [],
            };
            return compareStatements(statement, appliesToStatement);
          });

          if (!hasMatch) {
            // If any wildcard statement has no matching appliesTo entry, do not suppress
            return;
          }
        }

        NagSuppressions.addResourceSuppressions(
          resource,
          [
            {
              id: suppressions.id,
              reason: suppressions.reason,
            },
          ],
          applyToChildren,
        );
      }
    }
  }
}
