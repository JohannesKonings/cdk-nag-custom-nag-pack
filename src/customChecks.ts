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
   * Deactivaste suppressions for custom resources singleton lambda
   * The id's `AwsSolutions-L1` and `AwsSolutions-IAM4` will be suppressed suppressed if the parameter is set to true. All this is managed by cdk.
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
      console.log("Suppressing custom resource singleton lambda findings");
      this.suppressCustomResource(node);
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
  private suppressCustomResource(stack: Stack): void {
    const suppressions: NagPackSuppression[] = [
      {
        id: "AwsSolutions-IAM4",
        reason: "Custom resource singleton lambda",
      },
      {
        id: "AwsSolutions-L1",
        reason: "Custom resource singleton lambda",
      },
    ];
    // uuid of the custom resource https://github.com/aws/aws-cdk/blob/93172033e4a8346a86ee00017acba57b57f22aab/packages/aws-cdk-lib/custom-resources/lib/aws-custom-resource/aws-custom-resource.ts#L448
    const customResourceId = `AWS${AwsCustomResource.PROVIDER_FUNCTION_UUID.split("-").join("")}`;
    const stackName = stack.stackName;
    // all possible paths, which a custom resource creates and will be nagged by cdk-nag
    const cutomResourceSuppressPaths = new Set([
      `/${stackName}/${customResourceId}/ServiceRole/Resource`,
      `/${stackName}/${customResourceId}/Resource`,
    ]);

    const allExistingPaths = new Set(
      stack.node.findAll().map((node) => `/${node.node.path}`),
    );

    for (const path of cutomResourceSuppressPaths) {
      // Only add a suppression if the path exists
      if (allExistingPaths.has(path)) {
        NagSuppressions.addResourceSuppressionsByPath(
          stack,
          path,
          suppressions,
          true,
        );
      }
    }
  }
}
