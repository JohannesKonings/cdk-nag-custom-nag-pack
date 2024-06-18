import { Tags as cdkLibTags } from "aws-cdk-lib";
import { CfnGlobalTable } from "aws-cdk-lib/aws-dynamodb";
import { Bucket, CfnBucket } from "aws-cdk-lib/aws-s3";
import { Aspects, Stack } from "aws-cdk-lib/core";
import { validateStack, TestType, TestPack } from "./utils";
import { TagsExist } from "../../src/rules/index";

const testPack = new TestPack([TagsExist], {
  cr1TagsToCheck: ["name", "owner"],
});
let stack: Stack;

beforeEach(() => {
  stack = new Stack();
  Aspects.of(stack).add(testPack);
});

describe("tagsExist", () => {
  const ruleId = "tagsExist";
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
  test("Compliance", () => {
    new CfnBucket(stack, "rCfnBucket", {
      tags: [
        {
          key: "name",
          value: "some value",
        },
        {
          key: "owner",
          value: "some value",
        },
      ],
    });
    validateStack(stack, ruleId, TestType.COMPLIANCE);
  });
  test("Compliance with tags after instantiation", () => {
    const bucket = new CfnBucket(stack, "bucket");
    cdkLibTags.of(bucket).add("name", "some value");
    cdkLibTags.of(bucket).add("owner", "some value");

    validateStack(stack, ruleId, TestType.COMPLIANCE);
  });

  test("Compliance with CDK Bucket Construct", () => {
    const bucket = new Bucket(stack, "bucket");
    cdkLibTags.of(bucket).add("name", "some value");
    cdkLibTags.of(bucket).add("owner", "some value");

    validateStack(stack, ruleId, TestType.COMPLIANCE);
  });

  test("Compliance if tags applied to stack as aspects", () => {
    new Bucket(stack, "bucket");
    cdkLibTags.of(stack).add("name", "some value");
    cdkLibTags.of(stack).add("owner", "some value");

    validateStack(stack, ruleId, TestType.COMPLIANCE);
  });
  test("Compliance if tags applied to stack as parameter", () => {
    const stackWithTagsParameter = new Stack(
      undefined,
      "stackWithTagsParameter",
      {
        tags: {
          name: "some value",
          owner: "some value",
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
