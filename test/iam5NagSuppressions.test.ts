import { Aspects, Stack } from "aws-cdk-lib";
import { Annotations, Match } from "aws-cdk-lib/assertions";
import {
  Effect,
  PolicyStatement,
  type PolicyStatementProps,
} from "aws-cdk-lib/aws-iam";
import { Code, Function, Runtime, Tracing } from "aws-cdk-lib/aws-lambda";
import { NagSuppressions } from "cdk-nag";
import { describe, test } from "vitest";

import { CustomChecks } from "../src/customChecks";
import { Iam5NagSuppressions } from "../src/iam5NagSuppressions";

describe("Iam5NagSuppressions for IAM pattern suppression", () => {
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
        {
          id: "AwsSolutions-IAM4",
          reason: "not test related",
        },
        {
          id: "AwsSolutions-L1",
          reason: "not test related",
        },
      ],
      true,
    );
    const policyStatementForSuppression: PolicyStatementProps = {
      actions: ["xray:PutTelemetryRecords", "xray:PutTraceSegments"],
      resources: ["*"],
      effect: Effect.ALLOW,
    };
    Iam5NagSuppressions.addIam5StatementResourceSuppressions(
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
        {
          id: "AwsSolutions-IAM4",
          reason: "not test related",
        },
        {
          id: "AwsSolutions-L1",
          reason: "not test related",
        },
      ],
      true,
    );
    const policyStatementForSuppression: PolicyStatementProps = {
      actions: ["xray:PutTelemetryRecords", "xray:PutTraceSegments"],
      resources: ["*"],
      effect: Effect.ALLOW,
    };
    Iam5NagSuppressions.addIam5StatementResourceSuppressions(
      lambda,
      {
        id: "AwsSolutions-IAM5",
        // https://docs.aws.amazon.com/xray/latest/devguide/security_iam_service-with-iam.html
        reason: "Wildcard in combination with xray is OK",
        appliesTo: [policyStatementForSuppression],
      },
      true,
    );

    console.log("DEBUG OUTPUT:");
    console.log(JSON.stringify(Annotations.fromStack(stack), undefined, 2));
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
        {
          id: "AwsSolutions-IAM4",
          reason: "not test related",
        },
        {
          id: "AwsSolutions-L1",
          reason: "not test related",
        },
      ],
      true,
    );
    const policyStatementForSuppression: PolicyStatementProps = {
      actions: ["sqs:ChangeMessageVisibility"],
      resources: ["*"],
      effect: Effect.ALLOW,
    };
    Iam5NagSuppressions.addIam5StatementResourceSuppressions(
      lambda,
      {
        id: "AwsSolutions-IAM5",
        // https://docs.aws.amazon.com/xray/latest/devguide/security_iam_service-with-iam.html
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
        {
          id: "AwsSolutions-IAM4",
          reason: "not test related",
        },
        {
          id: "AwsSolutions-L1",
          reason: "not test related",
        },
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

    Iam5NagSuppressions.addIam5StatementResourceSuppressions(
      lambda,
      {
        id: "AwsSolutions-IAM5",
        // https://docs.aws.amazon.com/xray/latest/devguide/security_iam_service-with-iam.html
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
        {
          id: "AwsSolutions-IAM4",
          reason: "not test related",
        },
        {
          id: "AwsSolutions-L1",
          reason: "not test related",
        },
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
    Iam5NagSuppressions.addIam5StatementResourceSuppressions(
      lambda,
      {
        id: "AwsSolutions-IAM5",
        // https://docs.aws.amazon.com/xray/latest/devguide/security_iam_service-with-iam.html
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
        {
          id: "AwsSolutions-IAM4",
          reason: "not test related",
        },
        {
          id: "AwsSolutions-L1",
          reason: "not test related",
        },
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
    Iam5NagSuppressions.addIam5StatementResourceSuppressions(
      lambda,
      {
        id: "AwsSolutions-IAM5",
        // https://docs.aws.amazon.com/xray/latest/devguide/security_iam_service-with-iam.html
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
