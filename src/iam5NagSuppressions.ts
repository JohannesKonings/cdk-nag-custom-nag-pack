import { Stack } from "aws-cdk-lib";
import { CfnPolicy, type PolicyStatementProps } from "aws-cdk-lib/aws-iam";
import { NagSuppressions } from "cdk-nag";
import type { IConstruct } from "constructs";

type IamPolicyDocument = {
  Statement?: IamPolicyStatement[];
};

type IamPolicyStatement = {
  Effect: "Allow" | "Deny";
  Action: string | string[];
  Resource: string | string[];
};

function normalizeField(value: string | string[]): string[] {
  if (typeof value === "string") {
    return [value];
  }
  // Remove duplicates and sort using localeCompare for reliable alphabetical order
  return [...new Set(value)].sort((a, b) => a.localeCompare(b));
}

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
    const policyStatementForSuppression: PolicyStatementProps = {
      actions: ['xray:PutTelemetryRecords', 'xray:PutTraceSegments'],
      resources: ['*'],
      effect: Effect.ALLOW,
    };

    Iam5Suppressions.addIam5StatementResourceSuppressions(
      lambda,
      {
        id: 'AwsSolutions-IAM5',
        // https://docs.aws.amazon.com/xray/latest/devguide/security_iam_service-with-iam.html
        reason: 'Wildcard in combination with xray is OK',
        appliesTo: [policyStatementForSuppression],
      },
      true,
    );
   * Add suppressions to a resource, supporting appliesTo as array of objects.
   * @param resource The resource to suppress findings for
   * @param suppressions The suppressions to add
   * @param applyToChildren Whether to apply to children
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
            const appliesToStatement: IamPolicyStatement = {
              Effect: appliesTo.effect as "Allow" | "Deny",
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
