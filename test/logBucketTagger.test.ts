import { Stack, Aspects, App, CfnOutput, Fn } from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";
import { Bucket, CfnBucket } from "aws-cdk-lib/aws-s3";
import { describe, test, expect, beforeEach } from "vitest";
import { LogBucketTagger, tagLogBuckets } from "../src/logBucketTagger";

describe("LogBucketTagger", () => {
  let app: App;
  let stack: Stack;

  beforeEach(() => {
    app = new App();
    stack = new Stack(app, "TestStack");
  });

  describe("as Aspect", () => {
    test("should tag bucket referenced via Ref as log bucket", () => {
      // Create a log bucket
      const logBucket = new CfnBucket(stack, "LogBucket");

      // Create a source bucket that logs to the log bucket using Ref
      new CfnBucket(stack, "SourceBucket", {
        loggingConfiguration: {
          destinationBucketName: { Ref: stack.getLogicalId(logBucket) } as any,
        },
      });

      // Apply the aspect
      Aspects.of(stack).add(new LogBucketTagger());

      // Synthesize and check
      const template = Template.fromStack(stack);

      // Log bucket should have the tags
      template.hasResourceProperties("AWS::S3::Bucket", {
        Tags: [
          { Key: "isLogBucket", Value: "true" },
          { Key: "LogBucketTaggedBy", Value: "cdkNagCustomChecks" },
        ],
      });
    });

    test("should tag bucket referenced via Fn::GetAtt as log bucket", () => {
      // Create a log bucket
      const logBucket = new CfnBucket(stack, "LogBucket");

      // Create a source bucket that logs to the log bucket using Fn::GetAtt
      new CfnBucket(stack, "SourceBucket", {
        loggingConfiguration: {
          destinationBucketName: {
            "Fn::GetAtt": [stack.getLogicalId(logBucket), "BucketName"],
          } as any,
        },
      });

      // Apply the aspect
      Aspects.of(stack).add(new LogBucketTagger());

      // Synthesize and check
      const template = Template.fromStack(stack);

      // Log bucket should have the tags
      template.hasResourceProperties("AWS::S3::Bucket", {
        Tags: [
          { Key: "isLogBucket", Value: "true" },
          { Key: "LogBucketTaggedBy", Value: "cdkNagCustomChecks" },
        ],
      });
    });

    test("should NOT tag bucket that is not used for logging", () => {
      // Create a regular bucket without logging configuration
      new CfnBucket(stack, "RegularBucket");

      // Apply the aspect
      Aspects.of(stack).add(new LogBucketTagger());

      // Synthesize and check
      const template = Template.fromStack(stack);

      // Verify the bucket exists but without the log bucket tags
      const resources = template.findResources("AWS::S3::Bucket");
      const bucket = Object.values(resources)[0];
      expect(bucket.Properties?.Tags).toBeUndefined();
    });

    test("should tag log bucket when multiple buckets log to it", () => {
      const logBucket = new CfnBucket(stack, "LogBucket");

      // Create multiple source buckets that log to the same log bucket
      new CfnBucket(stack, "SourceBucket1", {
        loggingConfiguration: {
          destinationBucketName: { Ref: stack.getLogicalId(logBucket) } as any,
        },
      });

      new CfnBucket(stack, "SourceBucket2", {
        loggingConfiguration: {
          destinationBucketName: { Ref: stack.getLogicalId(logBucket) } as any,
        },
      });

      // Apply the aspect
      Aspects.of(stack).add(new LogBucketTagger());

      // Synthesize and check
      const template = Template.fromStack(stack);

      // Log bucket should have the tags (only once)
      const resources = template.findResources("AWS::S3::Bucket", {
        Properties: {
          Tags: [
            { Key: "isLogBucket", Value: "true" },
            { Key: "LogBucketTaggedBy", Value: "cdkNagCustomChecks" },
          ],
        },
      });
      expect(Object.keys(resources).length).toBe(1);
    });

    test("should use custom tag names and values when provided", () => {
      // Create a log bucket
      const logBucket = new CfnBucket(stack, "LogBucket");

      // Create a source bucket
      new CfnBucket(stack, "SourceBucket", {
        loggingConfiguration: {
          destinationBucketName: { Ref: stack.getLogicalId(logBucket) } as any,
        },
      });

      // Apply the aspect with custom props
      Aspects.of(stack).add(
        new LogBucketTagger({
          logBucketTagName: "CustomLogBucket",
          logBucketTagValue: "yes",
          taggedByTagName: "TaggedBy",
          taggedByTagValue: "MyTool",
        }),
      );

      // Synthesize and check
      const template = Template.fromStack(stack);

      // Log bucket should have custom tags
      template.hasResourceProperties("AWS::S3::Bucket", {
        Tags: [
          { Key: "CustomLogBucket", Value: "yes" },
          { Key: "TaggedBy", Value: "MyTool" },
        ],
      });
    });

    test("should NOT tag bucket when destination is a string literal (external bucket)", () => {
      // Create a bucket that logs to an external bucket (string name)
      new CfnBucket(stack, "SourceBucket", {
        loggingConfiguration: {
          destinationBucketName: "external-log-bucket-name",
        },
      });

      // Create another bucket in the stack
      new CfnBucket(stack, "LocalBucket");

      // Apply the aspect
      Aspects.of(stack).add(new LogBucketTagger());

      // Synthesize and check
      const template = Template.fromStack(stack);

      // No buckets should have log bucket tags
      const resources = template.findResources("AWS::S3::Bucket");
      for (const resource of Object.values(resources)) {
        expect(resource.Properties?.Tags).toBeUndefined();
      }
    });
  });

  describe("tagLogBuckets function", () => {
    test("should tag log bucket when called directly on stack", () => {
      // Create a log bucket
      const logBucket = new CfnBucket(stack, "LogBucket");

      // Create a source bucket
      new CfnBucket(stack, "SourceBucket", {
        loggingConfiguration: {
          destinationBucketName: { Ref: stack.getLogicalId(logBucket) } as any,
        },
      });

      // Call tagLogBuckets directly (simulating NagPack usage)
      tagLogBuckets(stack);

      // Synthesize and check
      const template = Template.fromStack(stack);

      template.hasResourceProperties("AWS::S3::Bucket", {
        Tags: [
          { Key: "isLogBucket", Value: "true" },
          { Key: "LogBucketTaggedBy", Value: "cdkNagCustomChecks" },
        ],
      });
    });
  });

  describe("cross-stack support", () => {
    test("should tag log bucket in different stack when using Fn::ImportValue", () => {
      // Stack A: defines and exports log bucket
      const stackA = new Stack(app, "StackA");
      const logBucket = new CfnBucket(stackA, "LogBucket");
      new CfnOutput(stackA, "LogBucketExport", {
        value: { Ref: stackA.getLogicalId(logBucket) } as any,
        exportName: "SharedLogBucket",
      });

      // Stack B: uses the exported log bucket
      const stackB = new Stack(app, "StackB");
      new CfnBucket(stackB, "SourceBucket", {
        loggingConfiguration: {
          destinationBucketName: {
            "Fn::ImportValue": "SharedLogBucket",
          } as any,
        },
      });

      // Apply aspect at App level for cross-stack support
      Aspects.of(app).add(new LogBucketTagger());

      // Synthesize and check Stack A
      const templateA = Template.fromStack(stackA);

      // Log bucket in Stack A should have the tags
      templateA.hasResourceProperties("AWS::S3::Bucket", {
        Tags: [
          { Key: "isLogBucket", Value: "true" },
          { Key: "LogBucketTaggedBy", Value: "cdkNagCustomChecks" },
        ],
      });
    });

    test("should tag log bucket when aspect applied at App level", () => {
      // Create log bucket and source bucket in same stack
      const logBucket = new CfnBucket(stack, "LogBucket");
      new CfnBucket(stack, "SourceBucket", {
        loggingConfiguration: {
          destinationBucketName: { Ref: stack.getLogicalId(logBucket) } as any,
        },
      });

      // Apply aspect at App level
      Aspects.of(app).add(new LogBucketTagger());

      // Synthesize and check
      const template = Template.fromStack(stack);

      template.hasResourceProperties("AWS::S3::Bucket", {
        Tags: [
          { Key: "isLogBucket", Value: "true" },
          { Key: "LogBucketTaggedBy", Value: "cdkNagCustomChecks" },
        ],
      });
    });

    test("should NOT tag source bucket in importing stack", () => {
      // Stack A: defines and exports log bucket
      const stackA = new Stack(app, "StackA");
      const logBucket = new CfnBucket(stackA, "LogBucket");
      new CfnOutput(stackA, "LogBucketExport", {
        value: { Ref: stackA.getLogicalId(logBucket) } as any,
        exportName: "SharedLogBucket",
      });

      // Stack B: uses the exported log bucket
      const stackB = new Stack(app, "StackB");
      new CfnBucket(stackB, "SourceBucket", {
        loggingConfiguration: {
          destinationBucketName: {
            "Fn::ImportValue": "SharedLogBucket",
          } as any,
        },
      });

      // Apply aspect at App level
      Aspects.of(app).add(new LogBucketTagger());

      // Synthesize and check Stack B
      const templateB = Template.fromStack(stackB);

      // Source bucket in Stack B should NOT have log bucket tags
      const resources = templateB.findResources("AWS::S3::Bucket");
      const sourceBucket = Object.values(resources)[0];
      expect(sourceBucket.Properties?.Tags).toBeUndefined();
    });

    test("should handle multiple stacks with shared log bucket", () => {
      // Stack A: defines and exports log bucket
      const stackA = new Stack(app, "StackA");
      const logBucket = new CfnBucket(stackA, "SharedLogBucket");
      new CfnOutput(stackA, "LogBucketExport", {
        value: { Ref: stackA.getLogicalId(logBucket) } as any,
        exportName: "SharedLogBucket",
      });

      // Stack B: uses the exported log bucket
      const stackB = new Stack(app, "StackB");
      new CfnBucket(stackB, "SourceBucketB", {
        loggingConfiguration: {
          destinationBucketName: {
            "Fn::ImportValue": "SharedLogBucket",
          } as any,
        },
      });

      // Stack C: also uses the exported log bucket
      const stackC = new Stack(app, "StackC");
      new CfnBucket(stackC, "SourceBucketC", {
        loggingConfiguration: {
          destinationBucketName: {
            "Fn::ImportValue": "SharedLogBucket",
          } as any,
        },
      });

      // Apply aspect at App level
      Aspects.of(app).add(new LogBucketTagger());

      // Synthesize and check
      const templateA = Template.fromStack(stackA);

      // Log bucket in Stack A should have the tags
      templateA.hasResourceProperties("AWS::S3::Bucket", {
        Tags: [
          { Key: "isLogBucket", Value: "true" },
          { Key: "LogBucketTaggedBy", Value: "cdkNagCustomChecks" },
        ],
      });
    });
  });

  describe("L2 Bucket construct support", () => {
    test("should tag log bucket when using L2 Bucket with serverAccessLogsBucket", () => {
      // Create L2 buckets - this tests that stack.resolve() works for tokens
      const logBucket = new Bucket(stack, "LogBucket");
      new Bucket(stack, "SourceBucket", {
        serverAccessLogsBucket: logBucket,
      });

      // Apply the aspect
      Aspects.of(stack).add(new LogBucketTagger());

      // Synthesize and check
      const template = Template.fromStack(stack);

      // Find the log bucket by its logical ID pattern
      const resources = template.findResources("AWS::S3::Bucket", {
        Properties: {
          Tags: [
            { Key: "isLogBucket", Value: "true" },
            { Key: "LogBucketTaggedBy", Value: "cdkNagCustomChecks" },
          ],
        },
      });

      // Exactly one bucket should have the log bucket tags
      expect(Object.keys(resources).length).toBe(1);
    });

    test("should tag log bucket when using L2 Bucket at App level", () => {
      // Create L2 buckets
      const logBucket = new Bucket(stack, "LogBucket");
      new Bucket(stack, "SourceBucket", {
        serverAccessLogsBucket: logBucket,
      });

      // Apply the aspect at App level
      Aspects.of(app).add(new LogBucketTagger());

      // Synthesize and check
      const template = Template.fromStack(stack);

      // Find the log bucket
      const resources = template.findResources("AWS::S3::Bucket", {
        Properties: {
          Tags: [
            { Key: "isLogBucket", Value: "true" },
            { Key: "LogBucketTaggedBy", Value: "cdkNagCustomChecks" },
          ],
        },
      });

      // Exactly one bucket should have the log bucket tags
      expect(Object.keys(resources).length).toBe(1);
    });

    test("should tag log bucket with mixed L1 and L2 constructs", () => {
      // Create L2 log bucket
      const logBucket = new Bucket(stack, "LogBucket");

      // Create L1 source bucket that references the L2 log bucket
      const cfnLogBucket = logBucket.node.defaultChild as CfnBucket;
      new CfnBucket(stack, "SourceBucket", {
        loggingConfiguration: {
          destinationBucketName: {
            Ref: stack.getLogicalId(cfnLogBucket),
          } as any,
        },
      });

      // Apply the aspect
      Aspects.of(stack).add(new LogBucketTagger());

      // Synthesize and check
      const template = Template.fromStack(stack);

      // Find the log bucket
      const resources = template.findResources("AWS::S3::Bucket", {
        Properties: {
          Tags: [
            { Key: "isLogBucket", Value: "true" },
            { Key: "LogBucketTaggedBy", Value: "cdkNagCustomChecks" },
          ],
        },
      });

      // Exactly one bucket should have the log bucket tags
      expect(Object.keys(resources).length).toBe(1);
    });

    test("should NOT tag source bucket when using L2 Bucket", () => {
      // Create L2 buckets
      const logBucket = new Bucket(stack, "LogBucket");
      new Bucket(stack, "SourceBucket", {
        serverAccessLogsBucket: logBucket,
      });

      // Apply the aspect
      Aspects.of(stack).add(new LogBucketTagger());

      // Synthesize and check
      const template = Template.fromStack(stack);

      // Count buckets with log bucket tags - should be exactly 1
      const taggedResources = template.findResources("AWS::S3::Bucket", {
        Properties: {
          Tags: [
            { Key: "isLogBucket", Value: "true" },
            { Key: "LogBucketTaggedBy", Value: "cdkNagCustomChecks" },
          ],
        },
      });

      // Only the log bucket should be tagged, not the source bucket
      expect(Object.keys(taggedResources).length).toBe(1);
    });
  });
});
