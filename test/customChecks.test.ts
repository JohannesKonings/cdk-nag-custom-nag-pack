import { Annotations, Match } from "aws-cdk-lib/assertions";
import { Aspects, Stack } from "aws-cdk-lib/core";
import {
  AwsCustomResource,
  AwsCustomResourcePolicy,
  PhysicalResourceId,
} from "aws-cdk-lib/custom-resources";
import { CustomChecks } from "../src/customChecks";

describe("custom resource suppressions", () => {
  test("Compliance", () => {
    const stack = new Stack();
    Aspects.of(stack).add(
      new CustomChecks({
        enableAwsSolutionChecks: true,
        suppressionsForCustomResource: [
          {
            id: "AwsSolutions-IAM4",
            reason: "Test suppression",
          },
          {
            id: "AwsSolutions-IAM5",
            reason: "Test suppression",
          },
        ],
      }),
    );

    new AwsCustomResource(stack, "rAwsCustomResource", {
      onUpdate: {
        // will also be called for a CREATE event
        service: "SSM",
        action: "GetParameter",
        parameters: {
          Name: "my-parameter",
          WithDecryption: true,
        },
        physicalResourceId: PhysicalResourceId.of(Date.now().toString()), // Update physical id to always fetch the latest version
      },
      installLatestAwsSdk: false,
      policy: AwsCustomResourcePolicy.fromSdkCalls({
        resources: AwsCustomResourcePolicy.ANY_RESOURCE,
      }),
    });

    Annotations.fromStack(stack).hasNoError("*", Match.anyValue());
  });

  test("Noncompliance", () => {
    const stack = new Stack();
    Aspects.of(stack).add(
      new CustomChecks({
        enableAwsSolutionChecks: true,
      }),
    );

    new AwsCustomResource(stack, "rAwsCustomResource", {
      onUpdate: {
        // will also be called for a CREATE event
        service: "SSM",
        action: "GetParameter",
        parameters: {
          Name: "my-parameter",
          WithDecryption: true,
        },
        physicalResourceId: PhysicalResourceId.of(Date.now().toString()), // Update physical id to always fetch the latest version
      },
      installLatestAwsSdk: false,
      policy: AwsCustomResourcePolicy.fromSdkCalls({
        resources: AwsCustomResourcePolicy.ANY_RESOURCE,
      }),
    });

    Annotations.fromStack(stack).hasError(
      "/Default/rAwsCustomResource/CustomResourcePolicy/Resource",
      Match.anyValue(),
    );
    Annotations.fromStack(stack).hasError(
      "/Default/AWS679f53fac002430cb0da5b7982bd2287/ServiceRole/Resource",
      Match.anyValue(),
    );
  });

  test("Compliance: No Error if path not exist", () => {
    const stack = new Stack();
    Aspects.of(stack).add(
      new CustomChecks({
        enableAwsSolutionChecks: true,
        suppressionsForCustomResource: [
          {
            id: "AwsSolutions-IAM4",
            reason: "Test suppression",
          },
          {
            id: "AwsSolutions-IAM5",
            reason: "Test suppression",
          },
        ],
      }),
    );

    Annotations.fromStack(stack).hasNoError("*", Match.anyValue());
  });
});
