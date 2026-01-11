import { Stack } from "aws-cdk-lib";
import {
  CfnPolicy,
  Effect,
  type PolicyStatementProps,
} from "aws-cdk-lib/aws-iam";
import { NagSuppressions } from "cdk-nag";
import type { IConstruct } from "constructs";

import { LogBucketTagger } from "./logBucketTagger";

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
 */
function normalizeField(value: string | string[]): string[] {
  if (typeof value === "string") {
    return [value];
  }

  return [...new Set(value)].sort((a, b) => a.localeCompare(b));
}

/**
 * Compare two IAM policy statements for equality.
 * Compares Effect, Action, and Resource fields after normalization.
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

/**
 * Reason used for log bucket S1 suppression
 */
export const LOG_BUCKET_S1_SUPPRESSION_REASON =
  "This is intended to be a log bucket. Log bucket does not require access logging to prevent infinite loop";

export interface LogBucketS1SuppressionAndTagProps {
  /** Optional custom reason for the suppression. */
  readonly reason?: string;

  /** Tag name indicating the bucket is a log bucket. @default "isLogBucket" */
  readonly logBucketTagName?: string;
  /** Tag value for log bucket indicator. @default "true" */
  readonly logBucketTagValue?: string;

  /** Tag name indicating who tagged the bucket. @default "LogBucketTaggedBy" */
  readonly taggedByTagName?: string;
  /** Tag value for the tagged by indicator. @default "cdkNagCustomChecks" */
  readonly taggedByTagValue?: string;
}

export interface Iam5StatementResourceSuppressionsProps {
  /** The cdk-nag rule ID (typically 'AwsSolutions-IAM5'). */
  readonly id: string;

  /** Explanation for why the suppression is acceptable. */
  readonly reason: string;

  /** Policy statements that are allowed to contain wildcards. */
  readonly appliesTo: PolicyStatementProps[];
}

/**
 * Consolidated suppression utilities for cdk-nag custom checks.
 *
 * This class provides suppression helper methods for custom checks,
 * including log bucket suppressions and IAM5 granular suppressions.
 *
 * @example
 * import { CustomChecksSuppressions } from '@jaykingson/cdk-nag-custom-nag-pack';
 *
 * // Suppress S1 for a log bucket
 * CustomChecksSuppressions.addS1SuppressionAndTagAsLogBucket(logBucket);
 */
export class CustomChecksSuppressions {
  /**
   * Suppress AwsSolutions-S1 finding for a log bucket and tag it as a log bucket.
   *
   * Log buckets cannot have their own server access logging enabled as that would
   * create an infinite recursion loop. This method suppresses the S1 finding
   * with an appropriate explanation.
   *
   * This suppression is automatically applied by `LogBucketTagger` when
   * `enableLogBucketTagger` is set to true in CustomChecks.
   *
   * @param bucket - The S3 bucket construct that is used as a log bucket
   * @param props - Optional suppression reason and tag configuration
   *
   * @example
   * import { CustomChecksSuppressions } from '@jaykingson/cdk-nag-custom-nag-pack';
   *
   * const logBucket = new Bucket(stack, 'LogBucket');
   *
   * // Mark a bucket as log bucket (tags + suppresses AwsSolutions-S1)
   * CustomChecksSuppressions.addS1SuppressionAndTagAsLogBucket(logBucket);
   */
  static addS1SuppressionAndTagAsLogBucket(
    bucket: IConstruct,
    props?: LogBucketS1SuppressionAndTagProps,
  ): void {
    const reason = props?.reason ?? LOG_BUCKET_S1_SUPPRESSION_REASON;

    LogBucketTagger.tagAsLogBucket(bucket, {
      logBucketTagName: props?.logBucketTagName,
      logBucketTagValue: props?.logBucketTagValue,
      taggedByTagName: props?.taggedByTagName,
      taggedByTagValue: props?.taggedByTagValue,
    });

    NagSuppressions.addResourceSuppressions(
      bucket,
      [
        {
          id: "AwsSolutions-S1",
          reason,
        },
      ],
      false, // bucket-only, do not apply to children
    );
  }

  /**
   * @deprecated Use `addS1SuppressionAndTagAsLogBucket()`.
   */
  static addLogBucketS1Suppression(
    bucket: IConstruct,
    reason: string = LOG_BUCKET_S1_SUPPRESSION_REASON,
  ): void {
    CustomChecksSuppressions.addS1SuppressionAndTagAsLogBucket(bucket, {
      reason,
    });
  }

  /**
   * Granularly suppress AwsSolutions-IAM5 findings for specific IAM policy statements.
   *
   * This method only suppresses the finding if ALL wildcard-containing statements in the
   * resource's policy have a matching entry in the appliesTo array. This ensures you only
   * suppress the specific wildcard permissions you've intentionally reviewed and approved.
   *
   * @param resource - The CDK construct to suppress findings for (typically a Lambda, Role, etc.)
   * @param suppressions - Suppression configuration object
   * @param applyToChildren - Whether to apply suppressions to child constructs (default: false)
   */
  static addIam5StatementResourceSuppressions(
    resource: IConstruct,
    suppressions: Iam5StatementResourceSuppressionsProps,
    applyToChildren = false,
  ): void {
    for (const child of resource.node.findAll()) {
      // https://github.com/cdklabs/cdk-nag/blob/bfaff5f722b119fa4f38c0706dd848ad47fd98c8/src/rules/iam/IAMNoWildcardPermissions.ts#L71C7-L71C21
      if (child instanceof CfnPolicy) {
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
