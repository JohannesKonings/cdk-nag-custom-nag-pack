import { CfnResource } from "aws-cdk-lib";
import { NagPack, NagPackProps, NagMessageLevel } from "cdk-nag";
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
  readonly cr1TagsToCheck?: Cr1TagsToCheck;
  readonly cr2TagsWithValueToCheck?: Cr2TagsWithValueToCheck;
}

export class CustomChecks extends NagPack {
  static cr1TagsToCheck: Cr1TagsToCheck;
  static cr2TagsWithValueToCheck: Cr2TagsWithValueToCheck;
  constructor(props?: CustomChecksProps) {
    super(props);
    this.packName = "CustomChecks";
    CustomChecks.cr1TagsToCheck = props?.cr1TagsToCheck || [];
    CustomChecks.cr2TagsWithValueToCheck = props?.cr2TagsWithValueToCheck || {};
  }
  public visit(node: IConstruct): void {
    if (node instanceof CfnResource) {
      if (CustomChecks.cr1TagsToCheck.length > 0) {
        this.checkTagsExist(node);
        this.checkTagsWithValueExist(node);
      }
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
}
