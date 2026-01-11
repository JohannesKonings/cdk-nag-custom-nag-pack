# API Reference <a name="API Reference" id="api-reference"></a>


## Structs <a name="Structs" id="Structs"></a>

### CustomChecksProps <a name="CustomChecksProps" id="@jaykingson/cdk-nag-custom-nag-pack.CustomChecksProps"></a>

#### Initializer <a name="Initializer" id="@jaykingson/cdk-nag-custom-nag-pack.CustomChecksProps.Initializer"></a>

```typescript
import { CustomChecksProps } from '@jaykingson/cdk-nag-custom-nag-pack'

const customChecksProps: CustomChecksProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@jaykingson/cdk-nag-custom-nag-pack.CustomChecksProps.property.additionalLoggers">additionalLoggers</a></code> | <code>cdk-nag.INagLogger[]</code> | Additional NagLoggers for logging rule validation outputs. |
| <code><a href="#@jaykingson/cdk-nag-custom-nag-pack.CustomChecksProps.property.logIgnores">logIgnores</a></code> | <code>boolean</code> | Whether or not to log suppressed rule violations as informational messages (default: false). |
| <code><a href="#@jaykingson/cdk-nag-custom-nag-pack.CustomChecksProps.property.reportFormats">reportFormats</a></code> | <code>cdk-nag.NagReportFormat[]</code> | If reports are enabled, the output formats of compliance reports in the App's output directory (default: only CSV). |
| <code><a href="#@jaykingson/cdk-nag-custom-nag-pack.CustomChecksProps.property.reports">reports</a></code> | <code>boolean</code> | Whether or not to generate compliance reports for applied Stacks in the App's output directory (default: true). |
| <code><a href="#@jaykingson/cdk-nag-custom-nag-pack.CustomChecksProps.property.suppressionIgnoreCondition">suppressionIgnoreCondition</a></code> | <code>cdk-nag.INagSuppressionIgnore</code> | Conditionally prevent rules from being suppressed (default: no user provided condition). |
| <code><a href="#@jaykingson/cdk-nag-custom-nag-pack.CustomChecksProps.property.verbose">verbose</a></code> | <code>boolean</code> | Whether or not to enable extended explanatory descriptions on warning, error, and logged ignore messages (default: false). |
| <code><a href="#@jaykingson/cdk-nag-custom-nag-pack.CustomChecksProps.property.cr1TagsToCheck">cr1TagsToCheck</a></code> | <code>string[]</code> | *No description.* |
| <code><a href="#@jaykingson/cdk-nag-custom-nag-pack.CustomChecksProps.property.cr2TagsWithValueToCheck">cr2TagsWithValueToCheck</a></code> | <code>{[ key: string ]: string[]}</code> | *No description.* |
| <code><a href="#@jaykingson/cdk-nag-custom-nag-pack.CustomChecksProps.property.enableAwsSolutionChecks">enableAwsSolutionChecks</a></code> | <code>boolean</code> | *No description.* |
| <code><a href="#@jaykingson/cdk-nag-custom-nag-pack.CustomChecksProps.property.enableLogBucketTagger">enableLogBucketTagger</a></code> | <code>boolean</code> | Enable automatic tagging of S3 log buckets for third-party security scanners. |
| <code><a href="#@jaykingson/cdk-nag-custom-nag-pack.CustomChecksProps.property.suppressSingletonLambdaFindings">suppressSingletonLambdaFindings</a></code> | <code>boolean</code> | Deactivate suppressions for custom resources singleton lambda The id's like `AwsSolutions-L1` or `AwsSolutions-IAM4` will be suppressed if the parameter is set to true. |

---

##### `additionalLoggers`<sup>Optional</sup> <a name="additionalLoggers" id="@jaykingson/cdk-nag-custom-nag-pack.CustomChecksProps.property.additionalLoggers"></a>

```typescript
public readonly additionalLoggers: INagLogger[];
```

- *Type:* cdk-nag.INagLogger[]

Additional NagLoggers for logging rule validation outputs.

---

##### `logIgnores`<sup>Optional</sup> <a name="logIgnores" id="@jaykingson/cdk-nag-custom-nag-pack.CustomChecksProps.property.logIgnores"></a>

```typescript
public readonly logIgnores: boolean;
```

- *Type:* boolean

Whether or not to log suppressed rule violations as informational messages (default: false).

---

##### `reportFormats`<sup>Optional</sup> <a name="reportFormats" id="@jaykingson/cdk-nag-custom-nag-pack.CustomChecksProps.property.reportFormats"></a>

```typescript
public readonly reportFormats: NagReportFormat[];
```

- *Type:* cdk-nag.NagReportFormat[]

If reports are enabled, the output formats of compliance reports in the App's output directory (default: only CSV).

---

##### `reports`<sup>Optional</sup> <a name="reports" id="@jaykingson/cdk-nag-custom-nag-pack.CustomChecksProps.property.reports"></a>

```typescript
public readonly reports: boolean;
```

- *Type:* boolean

Whether or not to generate compliance reports for applied Stacks in the App's output directory (default: true).

---

##### `suppressionIgnoreCondition`<sup>Optional</sup> <a name="suppressionIgnoreCondition" id="@jaykingson/cdk-nag-custom-nag-pack.CustomChecksProps.property.suppressionIgnoreCondition"></a>

```typescript
public readonly suppressionIgnoreCondition: INagSuppressionIgnore;
```

- *Type:* cdk-nag.INagSuppressionIgnore

Conditionally prevent rules from being suppressed (default: no user provided condition).

---

##### `verbose`<sup>Optional</sup> <a name="verbose" id="@jaykingson/cdk-nag-custom-nag-pack.CustomChecksProps.property.verbose"></a>

```typescript
public readonly verbose: boolean;
```

- *Type:* boolean

Whether or not to enable extended explanatory descriptions on warning, error, and logged ignore messages (default: false).

---

##### `cr1TagsToCheck`<sup>Optional</sup> <a name="cr1TagsToCheck" id="@jaykingson/cdk-nag-custom-nag-pack.CustomChecksProps.property.cr1TagsToCheck"></a>

```typescript
public readonly cr1TagsToCheck: string[];
```

- *Type:* string[]

---

##### `cr2TagsWithValueToCheck`<sup>Optional</sup> <a name="cr2TagsWithValueToCheck" id="@jaykingson/cdk-nag-custom-nag-pack.CustomChecksProps.property.cr2TagsWithValueToCheck"></a>

```typescript
public readonly cr2TagsWithValueToCheck: {[ key: string ]: string[]};
```

- *Type:* {[ key: string ]: string[]}

---

##### `enableAwsSolutionChecks`<sup>Optional</sup> <a name="enableAwsSolutionChecks" id="@jaykingson/cdk-nag-custom-nag-pack.CustomChecksProps.property.enableAwsSolutionChecks"></a>

```typescript
public readonly enableAwsSolutionChecks: boolean;
```

- *Type:* boolean

---

##### `enableLogBucketTagger`<sup>Optional</sup> <a name="enableLogBucketTagger" id="@jaykingson/cdk-nag-custom-nag-pack.CustomChecksProps.property.enableLogBucketTagger"></a>

```typescript
public readonly enableLogBucketTagger: boolean;
```

- *Type:* boolean
- *Default:* false - log buckets will not be automatically tagged

Enable automatic tagging of S3 log buckets for third-party security scanners.

Security scanners often flag buckets without server access logging enabled, but log buckets
themselves cannot have their own log bucket (that would create infinite recursion).
When enabled, buckets used as logging destinations will be tagged with:
- `isLogBucket: "true"` - identifies the bucket as a log bucket
- `LogBucketTaggedBy: "cdkNagCustomChecks"` - identifies who applied the tag

This allows security scanners to identify and exclude log buckets from "missing logging" checks.
Supports cross-stack references when applied at App level.

---

##### `suppressSingletonLambdaFindings`<sup>Optional</sup> <a name="suppressSingletonLambdaFindings" id="@jaykingson/cdk-nag-custom-nag-pack.CustomChecksProps.property.suppressSingletonLambdaFindings"></a>

```typescript
public readonly suppressSingletonLambdaFindings: boolean;
```

- *Type:* boolean
- *Default:* false - custom resource singleton lambda findings will not be suppressed

Deactivate suppressions for custom resources singleton lambda The id's like `AwsSolutions-L1` or `AwsSolutions-IAM4` will be suppressed if the parameter is set to true.

All this is managed by CDK.
Suppressions:
* Suppress for `Custom::AWS`, if the custom resource is used in the stack.
* Suppress for `Custom::AWSLogRetention`, if the log retention is set.
* Suppress for `Custom::CDKBucketDeployment`, if the bucket deployment is in place.
* Suppress for `Custom::S3BucketNotifications`, if the bucket notification is set.
* Suppress for `Custom::SopsSync`, if the cdk-sops-secrets singleton lambda is used.
All other findings have to be suppressed directly via `NagSuppressions.addResourceSuppressions`

---

### Iam5StatementResourceSuppressionsProps <a name="Iam5StatementResourceSuppressionsProps" id="@jaykingson/cdk-nag-custom-nag-pack.Iam5StatementResourceSuppressionsProps"></a>

#### Initializer <a name="Initializer" id="@jaykingson/cdk-nag-custom-nag-pack.Iam5StatementResourceSuppressionsProps.Initializer"></a>

```typescript
import { Iam5StatementResourceSuppressionsProps } from '@jaykingson/cdk-nag-custom-nag-pack'

const iam5StatementResourceSuppressionsProps: Iam5StatementResourceSuppressionsProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@jaykingson/cdk-nag-custom-nag-pack.Iam5StatementResourceSuppressionsProps.property.appliesTo">appliesTo</a></code> | <code>aws-cdk-lib.aws_iam.PolicyStatementProps[]</code> | Policy statements that are allowed to contain wildcards. |
| <code><a href="#@jaykingson/cdk-nag-custom-nag-pack.Iam5StatementResourceSuppressionsProps.property.id">id</a></code> | <code>string</code> | The cdk-nag rule ID (typically 'AwsSolutions-IAM5'). |
| <code><a href="#@jaykingson/cdk-nag-custom-nag-pack.Iam5StatementResourceSuppressionsProps.property.reason">reason</a></code> | <code>string</code> | Explanation for why the suppression is acceptable. |

---

##### `appliesTo`<sup>Required</sup> <a name="appliesTo" id="@jaykingson/cdk-nag-custom-nag-pack.Iam5StatementResourceSuppressionsProps.property.appliesTo"></a>

```typescript
public readonly appliesTo: PolicyStatementProps[];
```

- *Type:* aws-cdk-lib.aws_iam.PolicyStatementProps[]

Policy statements that are allowed to contain wildcards.

---

##### `id`<sup>Required</sup> <a name="id" id="@jaykingson/cdk-nag-custom-nag-pack.Iam5StatementResourceSuppressionsProps.property.id"></a>

```typescript
public readonly id: string;
```

- *Type:* string

The cdk-nag rule ID (typically 'AwsSolutions-IAM5').

---

##### `reason`<sup>Required</sup> <a name="reason" id="@jaykingson/cdk-nag-custom-nag-pack.Iam5StatementResourceSuppressionsProps.property.reason"></a>

```typescript
public readonly reason: string;
```

- *Type:* string

Explanation for why the suppression is acceptable.

---

### LogBucketS1SuppressionAndTagProps <a name="LogBucketS1SuppressionAndTagProps" id="@jaykingson/cdk-nag-custom-nag-pack.LogBucketS1SuppressionAndTagProps"></a>

#### Initializer <a name="Initializer" id="@jaykingson/cdk-nag-custom-nag-pack.LogBucketS1SuppressionAndTagProps.Initializer"></a>

```typescript
import { LogBucketS1SuppressionAndTagProps } from '@jaykingson/cdk-nag-custom-nag-pack'

const logBucketS1SuppressionAndTagProps: LogBucketS1SuppressionAndTagProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@jaykingson/cdk-nag-custom-nag-pack.LogBucketS1SuppressionAndTagProps.property.logBucketTagName">logBucketTagName</a></code> | <code>string</code> | Tag name indicating the bucket is a log bucket. |
| <code><a href="#@jaykingson/cdk-nag-custom-nag-pack.LogBucketS1SuppressionAndTagProps.property.logBucketTagValue">logBucketTagValue</a></code> | <code>string</code> | Tag value for log bucket indicator. |
| <code><a href="#@jaykingson/cdk-nag-custom-nag-pack.LogBucketS1SuppressionAndTagProps.property.reason">reason</a></code> | <code>string</code> | Optional custom reason for the suppression. |
| <code><a href="#@jaykingson/cdk-nag-custom-nag-pack.LogBucketS1SuppressionAndTagProps.property.taggedByTagName">taggedByTagName</a></code> | <code>string</code> | Tag name indicating who tagged the bucket. |
| <code><a href="#@jaykingson/cdk-nag-custom-nag-pack.LogBucketS1SuppressionAndTagProps.property.taggedByTagValue">taggedByTagValue</a></code> | <code>string</code> | Tag value for the tagged by indicator. |

---

##### `logBucketTagName`<sup>Optional</sup> <a name="logBucketTagName" id="@jaykingson/cdk-nag-custom-nag-pack.LogBucketS1SuppressionAndTagProps.property.logBucketTagName"></a>

```typescript
public readonly logBucketTagName: string;
```

- *Type:* string
- *Default:* "isLogBucket"

Tag name indicating the bucket is a log bucket.

---

##### `logBucketTagValue`<sup>Optional</sup> <a name="logBucketTagValue" id="@jaykingson/cdk-nag-custom-nag-pack.LogBucketS1SuppressionAndTagProps.property.logBucketTagValue"></a>

```typescript
public readonly logBucketTagValue: string;
```

- *Type:* string
- *Default:* "true"

Tag value for log bucket indicator.

---

##### `reason`<sup>Optional</sup> <a name="reason" id="@jaykingson/cdk-nag-custom-nag-pack.LogBucketS1SuppressionAndTagProps.property.reason"></a>

```typescript
public readonly reason: string;
```

- *Type:* string

Optional custom reason for the suppression.

---

##### `taggedByTagName`<sup>Optional</sup> <a name="taggedByTagName" id="@jaykingson/cdk-nag-custom-nag-pack.LogBucketS1SuppressionAndTagProps.property.taggedByTagName"></a>

```typescript
public readonly taggedByTagName: string;
```

- *Type:* string
- *Default:* "LogBucketTaggedBy"

Tag name indicating who tagged the bucket.

---

##### `taggedByTagValue`<sup>Optional</sup> <a name="taggedByTagValue" id="@jaykingson/cdk-nag-custom-nag-pack.LogBucketS1SuppressionAndTagProps.property.taggedByTagValue"></a>

```typescript
public readonly taggedByTagValue: string;
```

- *Type:* string
- *Default:* "cdkNagCustomChecks"

Tag value for the tagged by indicator.

---

## Classes <a name="Classes" id="Classes"></a>

### CustomChecks <a name="CustomChecks" id="@jaykingson/cdk-nag-custom-nag-pack.CustomChecks"></a>

#### Initializers <a name="Initializers" id="@jaykingson/cdk-nag-custom-nag-pack.CustomChecks.Initializer"></a>

```typescript
import { CustomChecks } from '@jaykingson/cdk-nag-custom-nag-pack'

new CustomChecks(props?: CustomChecksProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@jaykingson/cdk-nag-custom-nag-pack.CustomChecks.Initializer.parameter.props">props</a></code> | <code><a href="#@jaykingson/cdk-nag-custom-nag-pack.CustomChecksProps">CustomChecksProps</a></code> | *No description.* |

---

##### `props`<sup>Optional</sup> <a name="props" id="@jaykingson/cdk-nag-custom-nag-pack.CustomChecks.Initializer.parameter.props"></a>

- *Type:* <a href="#@jaykingson/cdk-nag-custom-nag-pack.CustomChecksProps">CustomChecksProps</a>

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#@jaykingson/cdk-nag-custom-nag-pack.CustomChecks.visit">visit</a></code> | All aspects can visit an IConstruct. |

---

##### `visit` <a name="visit" id="@jaykingson/cdk-nag-custom-nag-pack.CustomChecks.visit"></a>

```typescript
public visit(node: IConstruct): void
```

All aspects can visit an IConstruct.

###### `node`<sup>Required</sup> <a name="node" id="@jaykingson/cdk-nag-custom-nag-pack.CustomChecks.visit.parameter.node"></a>

- *Type:* constructs.IConstruct

---


#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@jaykingson/cdk-nag-custom-nag-pack.CustomChecks.property.readPackName">readPackName</a></code> | <code>string</code> | *No description.* |
| <code><a href="#@jaykingson/cdk-nag-custom-nag-pack.CustomChecks.property.cr1TagsToCheck">cr1TagsToCheck</a></code> | <code>string[]</code> | *No description.* |
| <code><a href="#@jaykingson/cdk-nag-custom-nag-pack.CustomChecks.property.cr2TagsWithValueToCheck">cr2TagsWithValueToCheck</a></code> | <code>{[ key: string ]: string[]}</code> | *No description.* |

---

##### `readPackName`<sup>Required</sup> <a name="readPackName" id="@jaykingson/cdk-nag-custom-nag-pack.CustomChecks.property.readPackName"></a>

```typescript
public readonly readPackName: string;
```

- *Type:* string

---

##### `cr1TagsToCheck`<sup>Required</sup> <a name="cr1TagsToCheck" id="@jaykingson/cdk-nag-custom-nag-pack.CustomChecks.property.cr1TagsToCheck"></a>

```typescript
public readonly cr1TagsToCheck: string[];
```

- *Type:* string[]

---

##### `cr2TagsWithValueToCheck`<sup>Required</sup> <a name="cr2TagsWithValueToCheck" id="@jaykingson/cdk-nag-custom-nag-pack.CustomChecks.property.cr2TagsWithValueToCheck"></a>

```typescript
public readonly cr2TagsWithValueToCheck: {[ key: string ]: string[]};
```

- *Type:* {[ key: string ]: string[]}

---


### CustomChecksSuppressions <a name="CustomChecksSuppressions" id="@jaykingson/cdk-nag-custom-nag-pack.CustomChecksSuppressions"></a>

Consolidated suppression utilities for cdk-nag custom checks.

This class provides suppression helper methods for custom checks,
including log bucket suppressions and IAM5 granular suppressions.

*Example*

```typescript
import { CustomChecksSuppressions } from '@jaykingson/cdk-nag-custom-nag-pack';

// Suppress S1 for a log bucket
CustomChecksSuppressions.addS1SuppressionAndTagAsLogBucket(logBucket);
```


#### Initializers <a name="Initializers" id="@jaykingson/cdk-nag-custom-nag-pack.CustomChecksSuppressions.Initializer"></a>

```typescript
import { CustomChecksSuppressions } from '@jaykingson/cdk-nag-custom-nag-pack'

new CustomChecksSuppressions()
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |

---


#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#@jaykingson/cdk-nag-custom-nag-pack.CustomChecksSuppressions.addIam5StatementResourceSuppressions">addIam5StatementResourceSuppressions</a></code> | Granularly suppress AwsSolutions-IAM5 findings for specific IAM policy statements. |
| <code><a href="#@jaykingson/cdk-nag-custom-nag-pack.CustomChecksSuppressions.addLogBucketS1Suppression">addLogBucketS1Suppression</a></code> | *No description.* |
| <code><a href="#@jaykingson/cdk-nag-custom-nag-pack.CustomChecksSuppressions.addS1SuppressionAndTagAsLogBucket">addS1SuppressionAndTagAsLogBucket</a></code> | Suppress AwsSolutions-S1 finding for a log bucket and tag it as a log bucket. |

---

##### `addIam5StatementResourceSuppressions` <a name="addIam5StatementResourceSuppressions" id="@jaykingson/cdk-nag-custom-nag-pack.CustomChecksSuppressions.addIam5StatementResourceSuppressions"></a>

```typescript
import { CustomChecksSuppressions } from '@jaykingson/cdk-nag-custom-nag-pack'

CustomChecksSuppressions.addIam5StatementResourceSuppressions(resource: IConstruct, suppressions: Iam5StatementResourceSuppressionsProps, applyToChildren?: boolean)
```

Granularly suppress AwsSolutions-IAM5 findings for specific IAM policy statements.

This method only suppresses the finding if ALL wildcard-containing statements in the
resource's policy have a matching entry in the appliesTo array. This ensures you only
suppress the specific wildcard permissions you've intentionally reviewed and approved.

###### `resource`<sup>Required</sup> <a name="resource" id="@jaykingson/cdk-nag-custom-nag-pack.CustomChecksSuppressions.addIam5StatementResourceSuppressions.parameter.resource"></a>

- *Type:* constructs.IConstruct

The CDK construct to suppress findings for (typically a Lambda, Role, etc.).

---

###### `suppressions`<sup>Required</sup> <a name="suppressions" id="@jaykingson/cdk-nag-custom-nag-pack.CustomChecksSuppressions.addIam5StatementResourceSuppressions.parameter.suppressions"></a>

- *Type:* <a href="#@jaykingson/cdk-nag-custom-nag-pack.Iam5StatementResourceSuppressionsProps">Iam5StatementResourceSuppressionsProps</a>

Suppression configuration object.

---

###### `applyToChildren`<sup>Optional</sup> <a name="applyToChildren" id="@jaykingson/cdk-nag-custom-nag-pack.CustomChecksSuppressions.addIam5StatementResourceSuppressions.parameter.applyToChildren"></a>

- *Type:* boolean

Whether to apply suppressions to child constructs (default: false).

---

##### ~~`addLogBucketS1Suppression`~~ <a name="addLogBucketS1Suppression" id="@jaykingson/cdk-nag-custom-nag-pack.CustomChecksSuppressions.addLogBucketS1Suppression"></a>

```typescript
import { CustomChecksSuppressions } from '@jaykingson/cdk-nag-custom-nag-pack'

CustomChecksSuppressions.addLogBucketS1Suppression(bucket: IConstruct, reason?: string)
```

###### `bucket`<sup>Required</sup> <a name="bucket" id="@jaykingson/cdk-nag-custom-nag-pack.CustomChecksSuppressions.addLogBucketS1Suppression.parameter.bucket"></a>

- *Type:* constructs.IConstruct

---

###### `reason`<sup>Optional</sup> <a name="reason" id="@jaykingson/cdk-nag-custom-nag-pack.CustomChecksSuppressions.addLogBucketS1Suppression.parameter.reason"></a>

- *Type:* string

---

##### `addS1SuppressionAndTagAsLogBucket` <a name="addS1SuppressionAndTagAsLogBucket" id="@jaykingson/cdk-nag-custom-nag-pack.CustomChecksSuppressions.addS1SuppressionAndTagAsLogBucket"></a>

```typescript
import { CustomChecksSuppressions } from '@jaykingson/cdk-nag-custom-nag-pack'

CustomChecksSuppressions.addS1SuppressionAndTagAsLogBucket(bucket: IConstruct, props?: LogBucketS1SuppressionAndTagProps)
```

Suppress AwsSolutions-S1 finding for a log bucket and tag it as a log bucket.

Log buckets cannot have their own server access logging enabled as that would
create an infinite recursion loop. This method suppresses the S1 finding
with an appropriate explanation.

This suppression is automatically applied by `LogBucketTagger` when
`enableLogBucketTagger` is set to true in CustomChecks.

*Example*

```typescript
import { CustomChecksSuppressions } from '@jaykingson/cdk-nag-custom-nag-pack';

const logBucket = new Bucket(stack, 'LogBucket');

// Mark a bucket as log bucket (tags + suppresses AwsSolutions-S1)
CustomChecksSuppressions.addS1SuppressionAndTagAsLogBucket(logBucket);
```


###### `bucket`<sup>Required</sup> <a name="bucket" id="@jaykingson/cdk-nag-custom-nag-pack.CustomChecksSuppressions.addS1SuppressionAndTagAsLogBucket.parameter.bucket"></a>

- *Type:* constructs.IConstruct

The S3 bucket construct that is used as a log bucket.

---

###### `props`<sup>Optional</sup> <a name="props" id="@jaykingson/cdk-nag-custom-nag-pack.CustomChecksSuppressions.addS1SuppressionAndTagAsLogBucket.parameter.props"></a>

- *Type:* <a href="#@jaykingson/cdk-nag-custom-nag-pack.LogBucketS1SuppressionAndTagProps">LogBucketS1SuppressionAndTagProps</a>

Optional suppression reason and tag configuration.

---




