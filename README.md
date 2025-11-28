# cdk-nag-custom-nag-pack

[![All Contributors](https://img.shields.io/github/all-contributors/JohannesKonings/cdk-nag-custom-nag-pack?color=ee8449&style=flat-square)](#contributors)

## rules

| Rule ID | Cause                         | Explanation                                 |
| ------- | ----------------------------- | ------------------------------------------- |
| CR1     | Definend tags not exist       | Certain tags are checked if it exist        |
| CR2     | Definend tags has wrong value | Certain tags are checked with defined value |

## global suppressions

### custom resource

The `AwsCustomResource` (https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.custom_resources.AwsCustomResource.html) creates a singleton lambda function and can't suppress at the resource level via `addResourceSuppressions` because it creates a lambda function resource on the stack.

In most cases the all the resources which ared created are managed by the CDK, so it's OK to suppress that "behind the scenes".

![custom resource template](./docs/custom-resources.png)

The same applies to `BucketDeployment` (https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_s3_deployment-readme.html). 

Handled custom resource types:
* `Custom::AWS`
* `Custom::LogRetention`
* `Custom::CDKBucketDeployment`
* `Custom::S3BucketNotifications`
* `Custom::SopsSync`

## granular AwsSolutions-IAM5 suppressions

The `AwsSolutions-IAM5` rule flags IAM policies that use wildcard permissions (`*`) in actions or resources. While wildcards should generally be avoided, some AWS services require them for proper functionality (e.g., X-Ray tracing).

This package provides `Iam5NagSuppressions.addIam5StatementResourceSuppressions()` for **granular suppression** of specific IAM policy statements. Instead of suppressing all IAM5 findings for a resource, you can suppress only the exact policy statements that genuinely require wildcards.

### How it works

The method compares the actual IAM policy statements attached to a resource against the policy statements you specify in `appliesTo`. It will **only** suppress the `AwsSolutions-IAM5` finding if:

1. All wildcard-containing statements in the resource's policy have a matching entry in `appliesTo`
2. The statements match exactly (same Effect, Actions, and Resources)

If any wildcard statement doesn't match an `appliesTo` entry, the suppression is **not applied** and cdk-nag will still flag the finding.

### Example usage

```typescript
import { Iam5NagSuppressions } from '@jaykingson/cdk-nag-custom-nag-pack'

const policyStatementForSuppression: PolicyStatementProps = {
  actions: ['xray:PutTelemetryRecords', 'xray:PutTraceSegments'],
  resources: ['*'],
  effect: Effect.ALLOW,
};

Iam5NagSuppressions.addIam5StatementResourceSuppressions(
  lambda,
  {
    id: 'AwsSolutions-IAM5',
    reason: 'Wildcard required for X-Ray - see https://docs.aws.amazon.com/xray/latest/devguide/security_iam_service-with-iam.html',
    appliesTo: [policyStatementForSuppression],
  },
  true, // applyToChildren
);
```

This approach ensures you only suppress the specific wildcard permissions you've intentionally reviewed and approved, while catching any unintended wildcards that might be added later.

## config

```typescript
import { CustomChecks } from '@jaykingson/cdk-nag-custom-nag-pack'
...
Aspects.of(app).add(new CustomChecks({
  // use the whole set of this rules https://github.com/cdklabs/cdk-nag/blob/main/RULES.md#awssolutions
  enableAwsSolutionChecks: true,
  // use whatever tags you want to check
  cr1TagsToCheck: ['Environment', 'Owner'],
  cr2TagsWithValueToCheck: { Stage: ["dev", "prod"] },
  // activate the suppression of the custom resource singleton lambda
  suppressSingletonLambdaFindings: true,
}));
```

## Contributors

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="http://deltikron.schafferhome.de"><img src="https://avatars.githubusercontent.com/u/12151238?v=4?s=100" width="100px;" alt="Carl Schaffer"/><br /><sub><b>Carl Schaffer</b></sub></a><br /><a href="#ideas-DeltiKron" title="Ideas, Planning, & Feedback">🤔</a></td>
    </tr>
  </tbody>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->
