import { CfnResource, Stack } from "aws-cdk-lib";
import { AwsCustomResource } from "aws-cdk-lib/custom-resources";
import {
  NagPack,
  NagPackProps,
  NagMessageLevel,
  NagPackSuppression,
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
   * Suppressions for custom resources
   * If the policy is devied from the sdk call (https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.custom_resources.AwsCustomResourcePolicy.html#static-fromwbrsdkwbrcallsoptions)
   * it could be supressed with the id `AwsSolutions-IAM4` and `AwsSolutions-IAM5`, because the policy is managed by cdk.
   *
   * If the policy is hand crafted (https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.custom_resources.AwsCustomResourcePolicy.html#static-fromwbrstatementsstatements), the id's `AwsSolutions-IAM4` and `AwsSolutions-IAM5` shoulc be avoided or supressed with a good reason.
   *
   * The id `AwsSolutions-L1` can be suppressed, because they are managed by cdk. `AwsSolutions-L1` only in the timeframe when a new runtime is released and it's not yet used by the custom runtime.
   *
   * @example
   * [
   *   {
   *     id: 'AwsSolutions-IAM4',
   *     reason: 'cdk managed policy',
   *   },
   *   {
   *     id: 'AwsSolutions-IAM5',
   *     reason: 'cdk managed policy',
   *   },
   *   {
   *     id: 'AwsSolutions-L1',
   *     reason: 'cdk managed lambda function runtime',
   *   },
   * ],
   */
  readonly suppressionsForCustomResource?: NagPackSuppression[];
}

export class CustomChecks extends NagPack {
  static cr1TagsToCheck: Cr1TagsToCheck;
  static cr2TagsWithValueToCheck: Cr2TagsWithValueToCheck;
  private enableAwsSolutionChecks?: boolean;
  private suppressionsForCustomResource?: NagPackSuppression[];
  constructor(props?: CustomChecksProps) {
    super(props);
    this.packName = "CustomChecks";
    CustomChecks.cr1TagsToCheck = props?.cr1TagsToCheck || [];
    CustomChecks.cr2TagsWithValueToCheck = props?.cr2TagsWithValueToCheck || {};
    this.enableAwsSolutionChecks = props?.enableAwsSolutionChecks;
    this.suppressionsForCustomResource = props?.suppressionsForCustomResource;
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
    } else if (this.suppressionsForCustomResource && node instanceof Stack) {
      this.suppressCustomResource(node, this.suppressionsForCustomResource);
    }
  }

  private checkTagsExist(node: CfnResource): void {
    this.applyRule({
      ruleSuffixOverride: "CR1",
      info: "Definend tags not exist.",
      explanation: "Certain tags are checked if it exist",
      level: NagMessageLevel.WARN,
      rule: TagsExist,
      node: node,
    });
  }
  private checkTagsWithValueExist(node: CfnResource): void {
    this.applyRule({
      ruleSuffixOverride: "CR2",
      info: "Definend tags has wrong value.",
      explanation: "Certain tags are checked with defined value",
      level: NagMessageLevel.WARN,
      rule: TagsWithValueExist,
      node: node,
    });
  }
  private suppressCustomResource(
    stack: Stack,
    suppressions: NagPackSuppression[],
  ): void {
    // uuid of the custom resource https://github.com/aws/aws-cdk/blob/93172033e4a8346a86ee00017acba57b57f22aab/packages/aws-cdk-lib/custom-resources/lib/aws-custom-resource/aws-custom-resource.ts#L448
    const customResourceId = `AWS${AwsCustomResource.PROVIDER_FUNCTION_UUID.replace(/-/g, "")}`;
    const stackName = stack.stackName;

    // all possible paths, which a custom resource creates and will be nagged by cdk-nag
    const cutomResourceSuppressPaths = new Set([
      `/${stackName}/${customResourceId}/ServiceRole/Resource`,
      `/${stackName}/${customResourceId}/Resource`,
    ]);
    // Only add a suppresion if the path exists
    // That way it's possible to supress globally at app level for all stacks, wheter the custom resource exists or not
    for (const node of stack.node.findAll()) {
      if (!cutomResourceSuppressPaths.has(node.node.path)) {
        NagSuppressions.addResourceSuppressionsByPath(
          stack,
          node.node.path,
          suppressions,
          true,
        );
      }
    }
  }
}
