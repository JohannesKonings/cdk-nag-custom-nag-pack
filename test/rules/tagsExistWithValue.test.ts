import { Tags as cdkLibTags } from "aws-cdk-lib";
import { CfnGlobalTable } from "aws-cdk-lib/aws-dynamodb";
import { Bucket, CfnBucket } from "aws-cdk-lib/aws-s3";
import { Aspects, Stack } from "aws-cdk-lib/core";
import { test, describe, beforeEach } from "vitest";
import { validateStack, TestType, TestPack } from "./utils";
import { TagsWithValueExist } from "../../src/rules/index";
const testPack = new TestPack([TagsWithValueExist], {
  // cr2TagsWithValueToCheck: [{ tagName: "Stage", tagValue: ["dev", "prod"] }],
  cr2TagsWithValueToCheck: { Stage: ["dev", "prod"] },
});
let stack: Stack;

beforeEach(() => {
  stack = new Stack();
  Aspects.of(stack).add(testPack);
});

describe("tagsWithValueExist", () => {
  const ruleId = "tagsWithValueExist";
  test("Noncompliance S3 no defined tags", () => {
    new CfnBucket(stack, "rCfnBucket");
    validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
  });
  test("Noncompliance S3 wrong tag", () => {
    new CfnBucket(stack, "rCfnBucket", {
      tags: [
        {
          key: "some tag",
          value: "some value",
        },
      ],
    });
    validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
  });
  test("Noncompliance S3 right tag, wrong value", () => {
    new CfnBucket(stack, "rCfnBucket", {
      tags: [
        {
          key: "Stage",
          value: "test",
        },
      ],
    });
    validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
  });
  test("Compliance", () => {
    new CfnBucket(stack, "rCfnBucket", {
      tags: [
        {
          key: "Stage",
          value: "prod",
        },
      ],
    });
    validateStack(stack, ruleId, TestType.COMPLIANCE);
  });
  test("Compliance with tags after instantiation", () => {
    const bucket = new CfnBucket(stack, "bucket");
    cdkLibTags.of(bucket).add("Stage", "dev");

    validateStack(stack, ruleId, TestType.COMPLIANCE);
  });

  test("Compliance if tags applied to stack as aspects", () => {
    new Bucket(stack, "bucket");
    cdkLibTags.of(stack).add("Stage", "dev");

    validateStack(stack, ruleId, TestType.COMPLIANCE);
  });
  test("Noncompliance if tags applied to stack as aspects, but with wrong value", () => {
    new Bucket(stack, "bucket");
    cdkLibTags.of(stack).add("Stage", "test");

    validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
  });
  test("Compliance if tags applied to stack as parameter", () => {
    const stackWithTagsParameter = new Stack(
      undefined,
      "stackWithTagsParameter",
      {
        tags: {
          Stage: "dev",
        },
      },
    );
    new Bucket(stackWithTagsParameter, "bucket");
    Aspects.of(stackWithTagsParameter).add(testPack);

    validateStack(stackWithTagsParameter, ruleId, TestType.COMPLIANCE);
  });
  test("Noncompliance if wrong tags applied to stack as parameter", () => {
    const stackWithTagsParameter = new Stack(
      undefined,
      "stackWithTagsParameter",
      {
        tags: {
          "some-tag": "some value",
        },
      },
    );
    new Bucket(stackWithTagsParameter, "bucket");
    Aspects.of(stackWithTagsParameter).add(testPack);

    validateStack(stackWithTagsParameter, ruleId, TestType.NON_COMPLIANCE);
  });
  test("Compliance for non taggable resource", () => {
    // no tags possible for GlobalTable, so should be compliant
    // https://github.com/aws/aws-cdk/issues/26891
    new CfnGlobalTable(stack, "rCfnGlobalTable", {
      attributeDefinitions: [
        {
          attributeName: "id",
          attributeType: "S",
        },
      ],
      keySchema: [
        {
          attributeName: "id",
          keyType: "HASH",
        },
      ],
      replicas: [
        {
          region: "us-east-1",
        },
        {
          region: "us-west-1",
        },
      ],
    });
    validateStack(stack, ruleId, TestType.COMPLIANCE);
  });
});
