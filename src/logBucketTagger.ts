import { App, CfnOutput, IAspect, Stage, Stack, Tags } from "aws-cdk-lib";
import { CfnBucket } from "aws-cdk-lib/aws-s3";
import { IConstruct } from "constructs";

import { CustomChecksSuppressions } from "./customChecksSuppressions";

/**
 * Configuration for log bucket tagging
 */
export interface LogBucketTaggerProps {
  /**
   * Tag name indicating the bucket is a log bucket
   * @default "isLogBucket"
   */
  readonly logBucketTagName?: string;
  /**
   * Tag value for log bucket indicator
   * @default "true"
   */
  readonly logBucketTagValue?: string;
  /**
   * Tag name indicating who tagged the bucket
   * @default "LogBucketTaggedBy"
   */
  readonly taggedByTagName?: string;
  /**
   * Tag value for the tagged by indicator
   * @default "cdkNagCustomChecks"
   */
  readonly taggedByTagValue?: string;
}

// Type-safe key for LoggingConfigurationProperty
const DESTINATION_BUCKET_KEY: keyof CfnBucket.LoggingConfigurationProperty =
  "destinationBucketName";

/**
 * Type guard to check if a value is a LoggingConfigurationProperty
 */
function isLoggingConfigurationProperty(
  value: unknown,
): value is CfnBucket.LoggingConfigurationProperty {
  return (
    value !== null &&
    typeof value === "object" &&
    DESTINATION_BUCKET_KEY in value
  );
}

/**
 * Interface for CloudFormation Ref intrinsic function
 */
interface CfnRef {
  Ref: string;
}

/**
 * Interface for CloudFormation Fn::GetAtt intrinsic function
 */
interface CfnFnGetAtt {
  "Fn::GetAtt": [string, string];
}

/**
 * Interface for CloudFormation Fn::ImportValue intrinsic function
 */
interface CfnFnImportValue {
  "Fn::ImportValue": string;
}

/**
 * Type guard to check if a value is a CloudFormation Ref
 */
function isCfnRef(value: unknown): value is CfnRef {
  return (
    value !== null &&
    typeof value === "object" &&
    "Ref" in value &&
    typeof (value as CfnRef).Ref === "string"
  );
}

/**
 * Type guard to check if a value is a CloudFormation Fn::GetAtt
 */
function isCfnFnGetAtt(value: unknown): value is CfnFnGetAtt {
  return (
    value !== null &&
    typeof value === "object" &&
    "Fn::GetAtt" in value &&
    Array.isArray((value as CfnFnGetAtt)["Fn::GetAtt"]) &&
    (value as CfnFnGetAtt)["Fn::GetAtt"].length >= 1
  );
}

/**
 * Type guard to check if a value is a CloudFormation Fn::ImportValue
 */
function isCfnFnImportValue(value: unknown): value is CfnFnImportValue {
  return (
    value !== null &&
    typeof value === "object" &&
    "Fn::ImportValue" in value &&
    typeof (value as CfnFnImportValue)["Fn::ImportValue"] === "string"
  );
}

/**
 * Information about a bucket for cross-stack resolution
 */
interface BucketInfo {
  bucket: CfnBucket;
  stack: Stack;
  logicalId: string;
}

/**
 * Tags S3 buckets used as log destinations.
 *
 * This class identifies S3 buckets that serve as logging destinations for other buckets
 * and applies appropriate tags for third-party security scanner identification.
 * Log buckets cannot have their own access logging enabled (that would cause infinite recursion),
 * so these tags help security scanners exclude them from "missing logging" violation reports.
 *
 * Supports cross-stack references when processed at App or Stage level.
 *
 * Tags applied:
 * - isLogBucket: "true" - on any bucket that is a logging destination
 * - LogBucketTaggedBy: "cdkNagCustomChecks" - identifies who applied the tag
 *
 * @remarks
 * This class is used internally by CustomChecks when `enableLogBucketTagger` is set to true.
 * It is not intended to be used directly as an Aspect.
 *
 * @example
 * ```typescript
 * import { Aspects } from 'aws-cdk-lib';
 * import { CustomChecks } from 'cdk-nag-custom-nag-pack';
 *
 * // Enable log bucket tagging via CustomChecks
 * Aspects.of(app).add(new CustomChecks({ enableLogBucketTagger: true }));
 * ```
 */
export class LogBucketTagger implements IAspect {
  public static readonly DEFAULT_LOG_BUCKET_TAG_NAME = "isLogBucket";
  public static readonly DEFAULT_LOG_BUCKET_TAG_VALUE = "true";
  public static readonly DEFAULT_TAGGED_BY_TAG_NAME = "LogBucketTaggedBy";
  public static readonly DEFAULT_TAGGED_BY_TAG_VALUE = "cdkNagCustomChecks";

  /**
   * Apply log-bucket identification tags to a bucket-like construct.
   */
  public static tagAsLogBucket(
    bucket: IConstruct,
    props?: LogBucketTaggerProps,
  ): void {
    const logBucketTagName =
      props?.logBucketTagName ?? LogBucketTagger.DEFAULT_LOG_BUCKET_TAG_NAME;
    const logBucketTagValue =
      props?.logBucketTagValue ?? LogBucketTagger.DEFAULT_LOG_BUCKET_TAG_VALUE;
    const taggedByTagName =
      props?.taggedByTagName ?? LogBucketTagger.DEFAULT_TAGGED_BY_TAG_NAME;
    const taggedByTagValue =
      props?.taggedByTagValue ?? LogBucketTagger.DEFAULT_TAGGED_BY_TAG_VALUE;

    Tags.of(bucket).add(logBucketTagName, logBucketTagValue);
    Tags.of(bucket).add(taggedByTagName, taggedByTagValue);
  }

  private readonly logBucketTagName: string;
  private readonly logBucketTagValue: string;
  private readonly taggedByTagName: string;
  private readonly taggedByTagValue: string;
  private processedApps = new WeakSet<App | Stage>();

  constructor(props?: LogBucketTaggerProps) {
    this.logBucketTagName =
      props?.logBucketTagName ?? LogBucketTagger.DEFAULT_LOG_BUCKET_TAG_NAME;
    this.logBucketTagValue =
      props?.logBucketTagValue ?? LogBucketTagger.DEFAULT_LOG_BUCKET_TAG_VALUE;
    this.taggedByTagName =
      props?.taggedByTagName ?? LogBucketTagger.DEFAULT_TAGGED_BY_TAG_NAME;
    this.taggedByTagValue =
      props?.taggedByTagValue ?? LogBucketTagger.DEFAULT_TAGGED_BY_TAG_VALUE;
  }

  /**
   * Visit method called by CDK Aspects for each construct in the tree
   */
  public visit(node: IConstruct): void {
    // Process at App/Stage level for cross-stack support
    if (node instanceof App || node instanceof Stage) {
      if (!this.processedApps.has(node)) {
        this.processedApps.add(node);
        this.tagLogBucketsAcrossStacks(node);
      }
      return;
    }

    // Fallback: process individual stacks (for single-stack usage)
    // Only process if not already handled at App level
    if (node instanceof Stack) {
      const app = node.node.root;
      if (app instanceof App || app instanceof Stage) {
        if (this.processedApps.has(app)) {
          return; // Already processed at App level
        }
      }
      this.tagLogBucketsInStack(node);
    }
  }

  /**
   * Process all stacks in an App/Stage to handle cross-stack references
   */
  private tagLogBucketsAcrossStacks(root: App | Stage): void {
    // Collect all buckets across all stacks
    const allBuckets = new Map<string, BucketInfo>();
    // Map export names to bucket keys (for cross-stack Fn::ImportValue)
    const exportToBucket = new Map<string, string>();
    // Destinations that need to be tagged (bucket keys or, in legacy cases, bare logical IDs)
    const logBucketDestinations = new Set<string>();
    // Import value destinations (to resolve later)
    const importValueDestinations = new Set<string>();

    const resolveBucketInfo = (destination: string): BucketInfo | undefined => {
      // Preferred: composite key lookup
      const byKey = allBuckets.get(destination);
      if (byKey) {
        return byKey;
      }

      // Fallback: destination may be a bare logical ID; scan for an unambiguous match.
      // If multiple stacks contain the same logical ID, do not pick one (avoids collisions).
      let match: BucketInfo | undefined;
      for (const bucketInfo of allBuckets.values()) {
        if (bucketInfo.logicalId === destination) {
          if (match) {
            return undefined;
          }
          match = bucketInfo;
        }
      }
      return match;
    };

    // Find all stacks
    const stacks: Stack[] = [];
    for (const child of root.node.findAll()) {
      if (child instanceof Stack) {
        stacks.push(child);
      }
    }

    // First pass: collect all buckets and exports across all stacks
    for (const stack of stacks) {
      for (const child of stack.node.findAll()) {
        if (child instanceof CfnBucket) {
          const logicalId = stack.getLogicalId(child);
          const key = `${stack.stackName}:${logicalId}`;
          allBuckets.set(key, { bucket: child, stack, logicalId });
        }

        // Track CfnOutputs that export bucket references
        if (child instanceof CfnOutput) {
          const exportName = child.exportName;
          const value = child.value;
          if (exportName && value) {
            // Check if the output value references a bucket
            const logicalId = this.extractLogicalIdFromValue(value);
            if (logicalId) {
              exportToBucket.set(exportName, `${stack.stackName}:${logicalId}`);
            }
          }
        }
      }
    }

    // Second pass: identify log bucket destinations
    for (const stack of stacks) {
      for (const child of stack.node.findAll()) {
        if (child instanceof CfnBucket) {
          // Resolve tokens to get the actual CloudFormation representation
          // This is needed for L2 constructs that set loggingConfiguration lazily
          const loggingConfig = stack.resolve(child.loggingConfiguration);
          if (isLoggingConfigurationProperty(loggingConfig)) {
            const destinationBucketName = loggingConfig.destinationBucketName;
            if (destinationBucketName !== undefined) {
              // Check for Fn::ImportValue (cross-stack reference)
              if (isCfnFnImportValue(destinationBucketName)) {
                const exportName = destinationBucketName["Fn::ImportValue"];
                importValueDestinations.add(exportName);
              } else {
                // Same-stack Ref or Fn::GetAtt
                const destination = this.extractLogicalId(
                  destinationBucketName,
                  stack,
                );
                if (destination) {
                  logBucketDestinations.add(destination);
                }
              }
            }
          }
        }
      }
    }

    // Resolve Fn::ImportValue destinations to bucket logical IDs
    for (const exportName of importValueDestinations) {
      const bucketKey = exportToBucket.get(exportName);
      if (bucketKey) {
        logBucketDestinations.add(bucketKey);
      }
    }

    // Third pass: apply tags to log buckets
    for (const destination of logBucketDestinations) {
      const bucketInfo = resolveBucketInfo(destination);
      if (bucketInfo) {
        CustomChecksSuppressions.addS1SuppressionAndTagAsLogBucket(
          bucketInfo.bucket,
          {
            logBucketTagName: this.logBucketTagName,
            logBucketTagValue: this.logBucketTagValue,
            taggedByTagName: this.taggedByTagName,
            taggedByTagValue: this.taggedByTagValue,
          },
        );
      }
    }
  }

  /**
   * Process a single stack (fallback for single-stack usage)
   */
  private tagLogBucketsInStack(stack: Stack): void {
    const allBuckets = new Map<string, CfnBucket>();
    const logBucketDestinations = new Set<string>();

    for (const child of stack.node.findAll()) {
      if (child instanceof CfnBucket) {
        const logicalId = stack.getLogicalId(child);
        allBuckets.set(logicalId, child);

        // Resolve tokens to get the actual CloudFormation representation
        // This is needed for L2 constructs that set loggingConfiguration lazily
        const loggingConfig = stack.resolve(child.loggingConfiguration);
        if (isLoggingConfigurationProperty(loggingConfig)) {
          const destinationBucketName = loggingConfig.destinationBucketName;
          if (destinationBucketName !== undefined) {
            const destinationLogicalId = this.extractLogicalId(
              destinationBucketName,
            );
            if (destinationLogicalId) {
              logBucketDestinations.add(destinationLogicalId);
            }
          }
        }
      }
    }

    for (const logicalId of logBucketDestinations) {
      const bucket = allBuckets.get(logicalId);
      if (bucket) {
        CustomChecksSuppressions.addS1SuppressionAndTagAsLogBucket(bucket, {
          logBucketTagName: this.logBucketTagName,
          logBucketTagValue: this.logBucketTagValue,
          taggedByTagName: this.taggedByTagName,
          taggedByTagValue: this.taggedByTagValue,
        });
      }
    }
  }

  /**
   * Extract logical ID from a CloudFormation reference.
   *
   * When a stack is provided, returns a composite key scoped to that stack.
   */
  private extractLogicalId(
    destinationBucketName: unknown,
    stack?: Stack,
  ): string | undefined {
    let logicalId: string | undefined;
    if (isCfnRef(destinationBucketName)) {
      logicalId = destinationBucketName.Ref;
    }
    if (isCfnFnGetAtt(destinationBucketName)) {
      logicalId = destinationBucketName["Fn::GetAtt"][0];
    }

    if (!logicalId) {
      return undefined;
    }

    return stack ? `${stack.stackName}:${logicalId}` : logicalId;
  }

  /**
   * Extract logical ID from a CfnOutput value (may be a token or reference)
   */
  private extractLogicalIdFromValue(value: unknown): string | undefined {
    // Direct reference
    if (isCfnRef(value)) {
      return value.Ref;
    }
    if (isCfnFnGetAtt(value)) {
      return value["Fn::GetAtt"][0];
    }
    return undefined;
  }
}

/**
 * Tag log buckets in a stack. This is a convenience function that can be called
 * from NagPack visit method when visiting Stack nodes.
 *
 * Note: For cross-stack support, use LogBucketTagger as an Aspect at App level instead.
 *
 * @param stack The stack to process
 * @param props Optional configuration for tag names/values
 */
export function tagLogBuckets(
  stack: Stack,
  props?: LogBucketTaggerProps,
): void {
  const tagger = new LogBucketTagger(props);
  tagger.visit(stack);
}
