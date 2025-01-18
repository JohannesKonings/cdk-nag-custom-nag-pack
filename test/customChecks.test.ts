import { Annotations, Match } from "aws-cdk-lib/assertions";
import { ManagedPolicy, Role, ServicePrincipal } from "aws-cdk-lib/aws-iam";
import { Bucket } from "aws-cdk-lib/aws-s3";
import { BucketDeployment } from "aws-cdk-lib/aws-s3-deployment";
import { Aspects, Stack } from "aws-cdk-lib/core";
import {
  AwsCustomResource,
  AwsCustomResourcePolicy,
  PhysicalResourceId,
} from "aws-cdk-lib/custom-resources";
import { NagSuppressions } from "cdk-nag";
import { test, describe } from "vitest";
import { CustomChecks } from "../src/customChecks";

describe("Custom resource suppressions", () => {
  test("Compliance: Active and supression per custom resource", () => {
    const stack = new Stack();
    Aspects.of(stack).add(
      new CustomChecks({
        enableAwsSolutionChecks: true,
        suppressSingletonLambdaFindings: true,
      }),
    );

    const customResource = new AwsCustomResource(stack, "rAwsCustomResource", {
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
    NagSuppressions.addResourceSuppressions(
      customResource,
      [
        {
          id: "AwsSolutions-IAM5",
          reason: "Test suppression",
        },
      ],
      true,
    );

    Annotations.fromStack(stack).hasNoError("*", Match.anyValue());
  });
  test("Noncompliance: Active but custom resource not directly suppressed", () => {
    const stack = new Stack();
    Aspects.of(stack).add(
      new CustomChecks({
        enableAwsSolutionChecks: true,
        suppressSingletonLambdaFindings: true,
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

    Annotations.fromStack(stack).hasError("*", Match.anyValue());
  });

  test("Noncompliance: Deactivated", () => {
    const stack = new Stack();
    Aspects.of(stack).add(
      new CustomChecks({
        enableAwsSolutionChecks: true,
        suppressSingletonLambdaFindings: false,
      }),
    );

    const customResource = new AwsCustomResource(stack, "rAwsCustomResource", {
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
    NagSuppressions.addResourceSuppressions(
      customResource,
      [
        {
          id: "AwsSolutions-IAM5",
          reason: "Test suppression",
        },
      ],
      true,
    );

    Annotations.fromStack(stack).hasError("*", Match.anyValue());
  });

  test("Compliance: No Error if path not exist", () => {
    const stack = new Stack();
    Aspects.of(stack).add(
      new CustomChecks({
        enableAwsSolutionChecks: true,
        suppressSingletonLambdaFindings: true,
      }),
    );

    Annotations.fromStack(stack).hasNoError("*", Match.anyValue());
  });

  test("Noncompliance: IAM4 is caused outside of the custom resource", () => {
    const stack = new Stack();
    Aspects.of(stack).add(
      new CustomChecks({
        enableAwsSolutionChecks: true,
        suppressSingletonLambdaFindings: true,
      }),
    );

    const customResource = new AwsCustomResource(stack, "rAwsCustomResource", {
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
    NagSuppressions.addResourceSuppressions(
      customResource,
      [
        {
          id: "AwsSolutions-IAM5",
          reason: "Test suppression",
        },
      ],
      true,
    );

    new Role(stack, "TestRole", {
      assumedBy: new ServicePrincipal("lambda.amazonaws.com"),
      managedPolicies: [
        ManagedPolicy.fromAwsManagedPolicyName("AdministratorAccess"),
      ],
    });

    Annotations.fromStack(stack).hasError("*", Match.anyValue());
  });
  test("Compliance: Active and log retention singleton lambda will also be suppressed", () => {
    const stack = new Stack();
    Aspects.of(stack).add(
      new CustomChecks({
        enableAwsSolutionChecks: true,
        suppressSingletonLambdaFindings: true,
      }),
    );

    const customResource = new AwsCustomResource(stack, "rAwsCustomResource", {
      onUpdate: {
        service: "SSM",
        action: "GetParameter",
        parameters: {
          Name: "my-parameter",
          WithDecryption: true,
        },
        physicalResourceId: PhysicalResourceId.of(Date.now().toString()),
      },
      installLatestAwsSdk: false,
      // Log retention is set
      logRetention: 1,
      policy: AwsCustomResourcePolicy.fromSdkCalls({
        resources: AwsCustomResourcePolicy.ANY_RESOURCE,
      }),
    });
    NagSuppressions.addResourceSuppressions(
      customResource,
      [
        {
          id: "AwsSolutions-IAM5",
          reason: "Test suppression",
        },
      ],
      true,
    );

    Annotations.fromStack(stack).hasNoError("*", Match.anyValue());
  });

  test("Compliance: Active and s3 deployment singleton lambda will also be suppressed", () => {
    const stack = new Stack();
    Aspects.of(stack).add(
      new CustomChecks({
        enableAwsSolutionChecks: true,
        suppressSingletonLambdaFindings: true,
      }),
    );

    const bucket = new Bucket(stack, "rBucket");
    NagSuppressions.addResourceSuppressions(
      bucket,
      [
        {
          id: "AwsSolutions-S1",
          reason: "not test related",
        },
        {
          id: "AwsSolutions-S10",
          reason: "not test related",
        },
      ],
      true,
    );
    new BucketDeployment(stack, "rBucketDeployment", {
      sources: [],
      destinationBucket: bucket,
    });

    Annotations.fromStack(stack).hasNoError("*", Match.anyValue());
  });
});
