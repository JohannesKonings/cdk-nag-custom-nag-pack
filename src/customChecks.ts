import { CfnResource, Stack } from "aws-cdk-lib";
import { AwsCustomResource } from "aws-cdk-lib/custom-resources";
import {
  NagPack,
  NagPackProps,
  NagMessageLevel,
  NagSuppressions,
  AwsSolutionsChecks,
} from "cdk-nag";
import { IConstruct } from "constructs";
import { TagsExist, TagsWithValueExist } from "./rules";

export type Cr1TagsToCheck = string[];

// not possible, because of jsii
// export type Cr2TagsWithValueToCheck = {
//   tagName: string;
//   tagValue: string[];
// }[];
export type Cr2TagsWithValueToCheck = Record<string, string[]>;
export interface CustomChecksProps extends NagPackProps {
  readonly enableAwsSolutionChecks?: boolean;
  readonly cr1TagsToCheck?: Cr1TagsToCheck;
  readonly cr2TagsWithValueToCheck?: Cr2TagsWithValueToCheck;
  /**
   * Deactivate suppressions for custom resources singleton lambda
   * The id's like `AwsSolutions-L1` or `AwsSolutions-IAM4` will be suppressed if the parameter is set to true. All this is managed by CDK.
   * Suppressions:
   * * Suppress for `Custom::AWS`, if the custom resource is used in the stack.
   * * Suppress for `Custom::AWSLogRetention`, if the log retention is set.
   * * Suppress for `Custom::CDKBucketDeployment`, if the bucket deployment is in place.
   * * Suppress for `Custom::S3BucketNotifications`, if the bucket notification is set.
   * * Suppress for `Custom::SopsSync`, if the cdk-sops-secrets singleton lambda is used.
   * All other findings have to be suppressed directly via `NagSuppressions.addResourceSuppressions`
   * @default false - custom resource singleton lambda findings will not be suppressed
   */
  readonly suppressSingletonLambdaFindings?: boolean;
}

export class CustomChecks extends NagPack {
  static cr1TagsToCheck: Cr1TagsToCheck;
  static cr2TagsWithValueToCheck: Cr2TagsWithValueToCheck;
  private enableAwsSolutionChecks?: boolean;
  private suppressSingletonLambdaFindings: boolean;
  constructor(props?: CustomChecksProps) {
    super(props);
    this.packName = "CustomChecks";
    CustomChecks.cr1TagsToCheck = props?.cr1TagsToCheck || [];
    CustomChecks.cr2TagsWithValueToCheck = props?.cr2TagsWithValueToCheck || {};
    this.enableAwsSolutionChecks = props?.enableAwsSolutionChecks;
    this.suppressSingletonLambdaFindings =
      props?.suppressSingletonLambdaFindings || false;
  }
  public visit(node: IConstruct): void {
    if (this.enableAwsSolutionChecks) {
      new AwsSolutionsChecks().visit(node);
    }
    if (node instanceof CfnResource) {
      if (CustomChecks.cr1TagsToCheck.length > 0) {
        this.checkTagsExist(node);
      }
      if (Object.keys(CustomChecks.cr2TagsWithValueToCheck).length > 0) {
        this.checkTagsWithValueExist(node);
      }
    } else if (
      this.suppressSingletonLambdaFindings === true &&
      node instanceof Stack
    ) {
      this.suppressCustomResource(node);
    }
  }

  private checkTagsExist(node: CfnResource): void {
    this.applyRule({
      ruleSuffixOverride: "CR1",
      info: "Defined tags do not exist.",
      explanation: "Certain tags are checked for existence",
      level: NagMessageLevel.WARN,
      rule: TagsExist,
      node: node,
    });
  }
  private checkTagsWithValueExist(node: CfnResource): void {
    this.applyRule({
      ruleSuffixOverride: "CR2",
      info: "Defined tags have wrong value.",
      explanation: "Certain tags are checked with defined values",
      level: NagMessageLevel.WARN,
      rule: TagsWithValueExist,
      node: node,
    });
  }
  private suppressCustomResource(stack: Stack): void {
    const singletonSuppressions = [
      {
        rules: ["AwsSolutions-IAM4", "AwsSolutions-L1"],
        reason: "Custom resource singleton lambda",
        supressPaths: ["ServiceRole/Resource", "Resource"],
        // UUID of the custom resource https://github.com/aws/aws-cdk/blob/93172033e4a8346a86ee00017acba57b57f22aab/packages/aws-cdk-lib/custom-resources/lib/aws-custom-resource/aws-custom-resource.ts#L448
        // https://github.com/aws/aws-cdk/issues/23204
        singletonId: `AWS${AwsCustomResource.PROVIDER_FUNCTION_UUID.split("-").join("")}`,
      },
      {
        rules: ["AwsSolutions-IAM4", "AwsSolutions-IAM5", "AwsSolutions-L1"],
        reason: "Log retention custom resource",
        supressPaths: [
          "ServiceRole/Resource",
          "Resource",
          "ServiceRole/DefaultPolicy/Resource",
        ],
        // https://github.com/aws/aws-cdk/blob/c7d6fb696c0d9a728ff0027c775fbf7750eec787/packages/aws-cdk-lib/aws-logs/lib/log-retention.ts#L128
        singletonId: "LogRetentionaae0aa3c5b4d4f87b02d85b201efdd8a",
      },

      {
        rules: ["AwsSolutions-IAM4", "AwsSolutions-IAM5", "AwsSolutions-L1"],
        reason: "S3 Bucket deployment singleton lambda",
        supressPaths: [
          "ServiceRole/Resource",
          "Resource",
          "ServiceRole/DefaultPolicy/Resource",
        ],
        // https://github.com/aws/aws-cdk/blob/53dc0d81e004ad1f8513af534b6d43f4315c24a3/packages/aws-cdk-lib/aws-s3-deployment/lib/bucket-deployment.ts#L599
        singletonId:
          "Custom::CDKBucketDeployment8693BB64968944B69AAFB0CC9EB8756C",
      },
      {
        rules: ["AwsSolutions-IAM4", "AwsSolutions-IAM5", "AwsSolutions-L1"],
        reason: "Bucket Notifications custom resource",
        supressPaths: [
          "ServiceRole/Resource",
          "Resource",
          "ServiceRole/DefaultPolicy/Resource",
        ],
        // https://github.com/aws/aws-cdk/blob/d95add33fc3fe355752ff56cd37381cb808890b6/packages/aws-cdk-lib/aws-s3/lib/notifications-resource/notifications-resource-handler.ts#L39
        singletonId:
          "BucketNotificationsHandler050a0587b7544547bf325f094a3db834",
      },
      // https://github.com/dbsystel/cdk-sops-secrets
      {
        rules: ["AwsSolutions-IAM4", "AwsSolutions-IAM5"],
        reason: "cdk-sops-secrets singleton lambda",
        supressPaths: [
          "ServiceRole/Resource",
          "Resource",
          "ServiceRole/DefaultPolicy/Resource",
        ],
        // https://github.com/dbsystel/cdk-sops-secrets/blob/5db64f9d9fd6dafabbb2d653a73a3028d5df1a4a/src/SopsSync.ts#L192
        singletonId: "SingletonLambdaSopsSyncProvider",
      },
    ];

    const stackName = stack.stackName;

    const allExistingPaths = new Set(
      stack.node.findAll().map((node) => `/${node.node.path}`),
    );

    for (const suppression of singletonSuppressions) {
      for (const supressPath of suppression.supressPaths) {
        const path = `/${stackName}/${suppression.singletonId}/${supressPath}`;
        // Only add a suppression if the path exists
        if (allExistingPaths.has(path)) {
          NagSuppressions.addResourceSuppressionsByPath(
            stack,
            path,
            suppression.rules.map((rule) => ({
              id: rule,
              reason: suppression.reason,
            })),
            true,
          );
        }
      }
    }
  }
}
