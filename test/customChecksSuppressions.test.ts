import { Aspects, Stack } from "aws-cdk-lib";
import { Annotations, Match, Template } from "aws-cdk-lib/assertions";
import {
  Effect,
  PolicyStatement,
  type PolicyStatementProps,
} from "aws-cdk-lib/aws-iam";
import { Code, Function, Runtime, Tracing } from "aws-cdk-lib/aws-lambda";
import { CfnBucket } from "aws-cdk-lib/aws-s3";
import { NagSuppressions } from "cdk-nag";
import { describe, expect, test } from "vitest";

import { CustomChecks } from "../src/customChecks";
import { CustomChecksSuppressions } from "../src/customChecksSuppressions";
import { LogBucketTagger } from "../src/logBucketTagger";

function findLogBucketResource(template: Template): any {
  const buckets = template.findResources("AWS::S3::Bucket");
  for (const bucket of Object.values(buckets)) {
    const tags = bucket.Properties?.Tags;
    if (Array.isArray(tags)) {
      const isLogBucket = tags.some(
        (t) => t?.Key === "isLogBucket" && t?.Value === "true",
      );
      if (isLogBucket) {
        return bucket;
      }
    }
  }

  throw new Error("Expected to find a tagged log bucket, but none was found");
}

describe("CustomChecksSuppressions / log bucket S1 suppression", () => {
  test("manual marking tags bucket and applies AwsSolutions-S1 suppression", () => {
    const stack = new Stack();

    const logBucket = new CfnBucket(stack, "ManualLogBucket");
    CustomChecksSuppressions.addS1SuppressionAndTagAsLogBucket(logBucket);

    const template = Template.fromStack(stack);

    template.hasResourceProperties("AWS::S3::Bucket", {
      Tags: [
        { Key: "isLogBucket", Value: "true" },
        { Key: "LogBucketTaggedBy", Value: "cdkNagCustomChecks" },
      ],
    });

    const buckets = template.findResources("AWS::S3::Bucket");
    const bucketResource = buckets.ManualLogBucket as any;
    expect(bucketResource.Metadata?.cdk_nag?.rules_to_suppress).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "AwsSolutions-S1",
        }),
      ]),
    );
  });

  test("applies AwsSolutions-S1 suppression to tagged log bucket (Ref)", () => {
    const stack = new Stack();

    const logBucket = new CfnBucket(stack, "LogBucket");
    new CfnBucket(stack, "SourceBucket", {
      loggingConfiguration: {
        destinationBucketName: { Ref: stack.getLogicalId(logBucket) } as any,
      },
    });

    Aspects.of(stack).add(new LogBucketTagger());

    const template = Template.fromStack(stack);
    const logBucketResource = findLogBucketResource(template);

    expect(logBucketResource.Metadata?.cdk_nag?.rules_to_suppress).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "AwsSolutions-S1",
        }),
      ]),
    );
  });

  test("applies AwsSolutions-S1 suppression to tagged log bucket (Fn::GetAtt)", () => {
    const stack = new Stack();

    const logBucket = new CfnBucket(stack, "LogBucket");
    new CfnBucket(stack, "SourceBucket", {
      loggingConfiguration: {
        destinationBucketName: {
          "Fn::GetAtt": [stack.getLogicalId(logBucket), "BucketName"],
        } as any,
      },
    });

    Aspects.of(stack).add(new LogBucketTagger());

    const template = Template.fromStack(stack);
    const logBucketResource = findLogBucketResource(template);

    expect(logBucketResource.Metadata?.cdk_nag?.rules_to_suppress).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "AwsSolutions-S1",
        }),
      ]),
    );
  });

  test("does not add suppression to buckets that are not log buckets", () => {
    const stack = new Stack();

    new CfnBucket(stack, "RegularBucket");
    Aspects.of(stack).add(new LogBucketTagger());

    const template = Template.fromStack(stack);

    const buckets = template.findResources("AWS::S3::Bucket");
    const regularBucketResource = Object.values(buckets)[0] as any;

    expect(
      regularBucketResource.Metadata?.cdk_nag?.rules_to_suppress,
    ).toBeFalsy();
  });
});

describe("CustomChecksSuppressions / IAM5 pattern suppression", () => {
  test("Compliant if wildcard policy statement it equal to appliesTo", () => {
    const stack = new Stack();
    Aspects.of(stack).add(new CustomChecks({ enableAwsSolutionChecks: true }));
    const lambda = new Function(stack, "rLambdaFunction", {
      runtime: Runtime.NODEJS_LATEST,
      handler: "index.handler",
      code: Code.fromInline("exports.handler = () => {};"),
      tracing: Tracing.ACTIVE,
    });
    // add a policy without wildcard to test the suppression
    lambda.addToRolePolicy(
      new PolicyStatement({
        actions: [
          "sqs:ChangeMessageVisibility",
          "sqs:DeleteMessage",
          "sqs:GetQueueAttributes",
          "sqs:GetQueueUrl",
          "sqs:ReceiveMessage",
          "sqs:SendMessage",
        ],
        resources: [
          "arn:aws:sqs:eu-central-1:471112809534:CMS-feat-kcm-999-cleanup-Persiste-HiveExpertenTopicSubscriptionQueu-qKMXnZME10n7",
        ],
        effect: Effect.ALLOW,
      }),
    );
    NagSuppressions.addResourceSuppressions(
      lambda,
      [
        { id: "AwsSolutions-IAM4", reason: "not test related" },
        { id: "AwsSolutions-L1", reason: "not test related" },
      ],
      true,
    );
    const policyStatementForSuppression: PolicyStatementProps = {
      actions: ["xray:PutTelemetryRecords", "xray:PutTraceSegments"],
      resources: ["*"],
      effect: Effect.ALLOW,
    };
    CustomChecksSuppressions.addIam5StatementResourceSuppressions(
      lambda,
      {
        id: "AwsSolutions-IAM5",
        // https://docs.aws.amazon.com/xray/latest/devguide/security_iam_service-with-iam.html
        reason: "Wildcard in combination with xray is OK",
        appliesTo: [policyStatementForSuppression],
      },
      true,
    );

    Annotations.fromStack(stack).hasNoError("*", Match.anyValue());
  });

  test("Non-Compliant if wildcard policy statement is equal to appliesTo, but another statement is not", () => {
    const stack = new Stack();
    Aspects.of(stack).add(new CustomChecks({ enableAwsSolutionChecks: true }));
    const lambda = new Function(stack, "rLambdaFunction", {
      runtime: Runtime.NODEJS_LATEST,
      handler: "index.handler",
      code: Code.fromInline("exports.handler = () => {};"),
      tracing: Tracing.ACTIVE,
    });
    // add a policy without wildcard to test the suppression
    lambda.addToRolePolicy(
      new PolicyStatement({
        actions: ["sqs:ChangeMessageVisibility"],
        resources: ["*"],
        effect: Effect.ALLOW,
      }),
    );
    NagSuppressions.addResourceSuppressions(
      lambda,
      [
        { id: "AwsSolutions-IAM4", reason: "not test related" },
        { id: "AwsSolutions-L1", reason: "not test related" },
      ],
      true,
    );
    const policyStatementForSuppression: PolicyStatementProps = {
      actions: ["xray:PutTelemetryRecords", "xray:PutTraceSegments"],
      resources: ["*"],
      effect: Effect.ALLOW,
    };
    CustomChecksSuppressions.addIam5StatementResourceSuppressions(
      lambda,
      {
        id: "AwsSolutions-IAM5",
        reason: "Wildcard in combination with xray is OK",
        appliesTo: [policyStatementForSuppression],
      },
      true,
    );

    Annotations.fromStack(stack).hasError("*", Match.anyValue());
  });

  test("Non-Compliant if wildcard policy statement is NOT equal to appliesTo", () => {
    const stack = new Stack();
    Aspects.of(stack).add(new CustomChecks({ enableAwsSolutionChecks: true }));
    const lambda = new Function(stack, "rLambdaFunction", {
      runtime: Runtime.NODEJS_LATEST,
      handler: "index.handler",
      code: Code.fromInline("exports.handler = () => {};"),
      tracing: Tracing.ACTIVE,
    });
    NagSuppressions.addResourceSuppressions(
      lambda,
      [
        { id: "AwsSolutions-IAM4", reason: "not test related" },
        { id: "AwsSolutions-L1", reason: "not test related" },
      ],
      true,
    );
    const policyStatementForSuppression: PolicyStatementProps = {
      actions: ["sqs:ChangeMessageVisibility"],
      resources: ["*"],
      effect: Effect.ALLOW,
    };
    CustomChecksSuppressions.addIam5StatementResourceSuppressions(
      lambda,
      {
        id: "AwsSolutions-IAM5",
        reason: "Wildcard in combination with xray is OK",
        appliesTo: [policyStatementForSuppression],
      },
      true,
    );

    Annotations.fromStack(stack).hasError("*", Match.anyValue());
  });

  test("Non-Compliant if Wildcard policy statement is NOT equal to appliesTo, but another statement is", () => {
    const stack = new Stack();
    Aspects.of(stack).add(new CustomChecks({ enableAwsSolutionChecks: true }));
    const lambda = new Function(stack, "rLambdaFunction", {
      runtime: Runtime.NODEJS_LATEST,
      handler: "index.handler",
      code: Code.fromInline("exports.handler = () => {};"),
      tracing: Tracing.ACTIVE,
    });
    NagSuppressions.addResourceSuppressions(
      lambda,
      [
        { id: "AwsSolutions-IAM4", reason: "not test related" },
        { id: "AwsSolutions-L1", reason: "not test related" },
      ],
      true,
    );
    lambda.addToRolePolicy(
      new PolicyStatement({
        actions: ["kms:GenerateDataKey*", "kms:ReEncrypt*"],
        resources: [
          "arn:aws:kms:eu-central-1:471112809534:key/a096e96c-780e-48eb-993b-5b8cc46d8fd7",
        ],
        effect: Effect.ALLOW,
      }),
    );
    const policyStatementForSuppression: PolicyStatementProps = {
      actions: ["xray:PutTelemetryRecords", "xray:PutTraceSegments"],
      resources: ["*"],
      effect: Effect.ALLOW,
    };

    CustomChecksSuppressions.addIam5StatementResourceSuppressions(
      lambda,
      {
        id: "AwsSolutions-IAM5",
        reason: "Wildcard in combination with xray is OK",
        appliesTo: [policyStatementForSuppression],
      },
      true,
    );

    Annotations.fromStack(stack).hasError("*", Match.anyValue());
  });

  test("Compliant if Wildcard policy statement is equal to appliesTo", () => {
    const stack = new Stack();
    Aspects.of(stack).add(new CustomChecks({ enableAwsSolutionChecks: true }));
    const lambda = new Function(stack, "rLambdaFunction", {
      runtime: Runtime.NODEJS_LATEST,
      handler: "index.handler",
      code: Code.fromInline("exports.handler = () => {};"),
      tracing: Tracing.ACTIVE,
    });
    NagSuppressions.addResourceSuppressions(
      lambda,
      [
        { id: "AwsSolutions-IAM4", reason: "not test related" },
        { id: "AwsSolutions-L1", reason: "not test related" },
      ],
      true,
    );
    lambda.addToRolePolicy(
      new PolicyStatement({
        actions: ["kms:GenerateDataKey*", "kms:ReEncrypt*"],
        resources: [
          "arn:aws:kms:eu-central-1:471112809534:key/a096e96c-780e-48eb-993b-5b8cc46d8fd7",
        ],
        effect: Effect.ALLOW,
      }),
    );
    const policyStatementForSuppression: PolicyStatementProps = {
      actions: ["xray:PutTelemetryRecords", "xray:PutTraceSegments"],
      resources: ["*"],
      effect: Effect.ALLOW,
    };
    const policyStatementForSuppressionKMS: PolicyStatementProps = {
      actions: ["kms:GenerateDataKey*", "kms:ReEncrypt*"],
      resources: [
        "arn:aws:kms:eu-central-1:471112809534:key/a096e96c-780e-48eb-993b-5b8cc46d8fd7",
      ],
      effect: Effect.ALLOW,
    };
    CustomChecksSuppressions.addIam5StatementResourceSuppressions(
      lambda,
      {
        id: "AwsSolutions-IAM5",
        reason: "Wildcard in combination with xray is OK",
        appliesTo: [
          policyStatementForSuppression,
          policyStatementForSuppressionKMS,
        ],
      },
      true,
    );

    Annotations.fromStack(stack).hasNoError("*", Match.anyValue());
  });

  test("Compliant if one of many Wildcard policy statement is equal to appliesTo", () => {
    const stack = new Stack();
    Aspects.of(stack).add(new CustomChecks({ enableAwsSolutionChecks: true }));
    const lambda = new Function(stack, "rLambdaFunction", {
      runtime: Runtime.NODEJS_LATEST,
      handler: "index.handler",
      code: Code.fromInline("exports.handler = () => {};"),
      tracing: Tracing.ACTIVE,
    });
    NagSuppressions.addResourceSuppressions(
      lambda,
      [
        { id: "AwsSolutions-IAM4", reason: "not test related" },
        { id: "AwsSolutions-L1", reason: "not test related" },
      ],
      true,
    );
    lambda.addToRolePolicy(
      new PolicyStatement({
        actions: ["kms:GenerateDataKey*", "kms:ReEncrypt*"],
        resources: [
          "arn:aws:kms:eu-central-1:471112809534:key/a096e96c-780e-48eb-993b-5b8cc46d8fd7",
        ],
        effect: Effect.ALLOW,
      }),
    );

    const policyStatementForSuppression: PolicyStatementProps = {
      actions: ["xray:PutTelemetryRecords", "xray:PutTraceSegments"],
      resources: ["*"],
      effect: Effect.ALLOW,
    };
    const policyStatementForSuppressionKMS: PolicyStatementProps = {
      actions: ["kms:GenerateDataKey*", "kms:ReEncrypt*"],
      resources: [
        "arn:aws:kms:eu-central-1:471112809534:key/a096e96c-780e-48eb-993b-5b8cc46d8fd7",
      ],
      effect: Effect.ALLOW,
    };
    const policyStatementForSuppressionKMSWithDescribeKey: PolicyStatementProps =
      {
        actions: ["kms:DescribeKey", "kms:GenerateDataKey*", "kms:ReEncrypt*"],
        resources: [
          "arn:aws:kms:eu-central-1:471112809534:key/a096e96c-780e-48eb-993b-5b8cc46d8fd7",
        ],
        effect: Effect.ALLOW,
      };
    CustomChecksSuppressions.addIam5StatementResourceSuppressions(
      lambda,
      {
        id: "AwsSolutions-IAM5",
        reason: "Wildcard in combination with xray is OK",
        appliesTo: [
          policyStatementForSuppression,
          policyStatementForSuppressionKMS,
          policyStatementForSuppressionKMSWithDescribeKey,
        ],
      },
      true,
    );

    Annotations.fromStack(stack).hasNoError("*", Match.anyValue());
  });
});
