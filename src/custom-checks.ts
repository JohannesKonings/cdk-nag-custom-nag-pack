import { CfnResource } from "aws-cdk-lib";
import { NagPack, NagPackProps, NagMessageLevel } from "cdk-nag";
import { IConstruct } from "constructs";
import { TagsExist } from "./rules";

export type Cr1TagsToCheck = string[];

export interface CustomChecksProps extends NagPackProps {
  readonly cr1TagsToCheck?: Cr1TagsToCheck;
}

export class CustomChecks extends NagPack {
  static cr1TagsToCheck: Cr1TagsToCheck;
  constructor(props?: CustomChecksProps) {
    super(props);
    this.packName = "CustomChecks";
    CustomChecks.cr1TagsToCheck = props?.cr1TagsToCheck || [];
  }
  public visit(node: IConstruct): void {
    if (node instanceof CfnResource) {
      if (CustomChecks.cr1TagsToCheck.length > 0) {
        this.checkTagsExist(node);
      }
    }
  }

  private checkTagsExist(node: CfnResource): void {
    this.applyRule({
      ruleSuffixOverride: "CR1",
      info: "Definend tags not exist.",
      explanation: "Certain tags are checked if it exist ",
      level: NagMessageLevel.WARN,
      rule: TagsExist,
      node: node,
    });
  }
}
