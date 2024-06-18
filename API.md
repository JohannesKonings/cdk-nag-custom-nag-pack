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


### NagSuppressions <a name="NagSuppressions" id="@jaykingson/cdk-nag-custom-nag-pack.NagSuppressions"></a>

Helper class with methods to add cdk-nag suppressions to cdk resources.

#### Initializers <a name="Initializers" id="@jaykingson/cdk-nag-custom-nag-pack.NagSuppressions.Initializer"></a>

```typescript
import { NagSuppressions } from '@jaykingson/cdk-nag-custom-nag-pack'

new NagSuppressions()
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |

---


#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#@jaykingson/cdk-nag-custom-nag-pack.NagSuppressions.addResourceSuppressions">addResourceSuppressions</a></code> | Add cdk-nag suppressions to a CfnResource and optionally its children. |
| <code><a href="#@jaykingson/cdk-nag-custom-nag-pack.NagSuppressions.addResourceSuppressionsByPath">addResourceSuppressionsByPath</a></code> | Add cdk-nag suppressions to a CfnResource and optionally its children via its path. |
| <code><a href="#@jaykingson/cdk-nag-custom-nag-pack.NagSuppressions.addStackSuppressions">addStackSuppressions</a></code> | Apply cdk-nag suppressions to a Stack and optionally nested stacks. |

---

##### `addResourceSuppressions` <a name="addResourceSuppressions" id="@jaykingson/cdk-nag-custom-nag-pack.NagSuppressions.addResourceSuppressions"></a>

```typescript
import { NagSuppressions } from '@jaykingson/cdk-nag-custom-nag-pack'

NagSuppressions.addResourceSuppressions(construct: IConstruct | IConstruct[], suppressions: NagPackSuppression[], applyToChildren?: boolean)
```

Add cdk-nag suppressions to a CfnResource and optionally its children.

###### `construct`<sup>Required</sup> <a name="construct" id="@jaykingson/cdk-nag-custom-nag-pack.NagSuppressions.addResourceSuppressions.parameter.construct"></a>

- *Type:* constructs.IConstruct | constructs.IConstruct[]

The IConstruct(s) to apply the suppression to.

---

###### `suppressions`<sup>Required</sup> <a name="suppressions" id="@jaykingson/cdk-nag-custom-nag-pack.NagSuppressions.addResourceSuppressions.parameter.suppressions"></a>

- *Type:* cdk-nag.NagPackSuppression[]

A list of suppressions to apply to the resource.

---

###### `applyToChildren`<sup>Optional</sup> <a name="applyToChildren" id="@jaykingson/cdk-nag-custom-nag-pack.NagSuppressions.addResourceSuppressions.parameter.applyToChildren"></a>

- *Type:* boolean

Apply the suppressions to children CfnResources  (default:false).

---

##### `addResourceSuppressionsByPath` <a name="addResourceSuppressionsByPath" id="@jaykingson/cdk-nag-custom-nag-pack.NagSuppressions.addResourceSuppressionsByPath"></a>

```typescript
import { NagSuppressions } from '@jaykingson/cdk-nag-custom-nag-pack'

NagSuppressions.addResourceSuppressionsByPath(stack: Stack, path: string | string[], suppressions: NagPackSuppression[], applyToChildren?: boolean)
```

Add cdk-nag suppressions to a CfnResource and optionally its children via its path.

###### `stack`<sup>Required</sup> <a name="stack" id="@jaykingson/cdk-nag-custom-nag-pack.NagSuppressions.addResourceSuppressionsByPath.parameter.stack"></a>

- *Type:* aws-cdk-lib.Stack

The Stack the construct belongs to.

---

###### `path`<sup>Required</sup> <a name="path" id="@jaykingson/cdk-nag-custom-nag-pack.NagSuppressions.addResourceSuppressionsByPath.parameter.path"></a>

- *Type:* string | string[]

The path(s) to the construct in the provided stack.

---

###### `suppressions`<sup>Required</sup> <a name="suppressions" id="@jaykingson/cdk-nag-custom-nag-pack.NagSuppressions.addResourceSuppressionsByPath.parameter.suppressions"></a>

- *Type:* cdk-nag.NagPackSuppression[]

A list of suppressions to apply to the resource.

---

###### `applyToChildren`<sup>Optional</sup> <a name="applyToChildren" id="@jaykingson/cdk-nag-custom-nag-pack.NagSuppressions.addResourceSuppressionsByPath.parameter.applyToChildren"></a>

- *Type:* boolean

Apply the suppressions to children CfnResources  (default:false).

---

##### `addStackSuppressions` <a name="addStackSuppressions" id="@jaykingson/cdk-nag-custom-nag-pack.NagSuppressions.addStackSuppressions"></a>

```typescript
import { NagSuppressions } from '@jaykingson/cdk-nag-custom-nag-pack'

NagSuppressions.addStackSuppressions(stack: Stack, suppressions: NagPackSuppression[], applyToNestedStacks?: boolean)
```

Apply cdk-nag suppressions to a Stack and optionally nested stacks.

###### `stack`<sup>Required</sup> <a name="stack" id="@jaykingson/cdk-nag-custom-nag-pack.NagSuppressions.addStackSuppressions.parameter.stack"></a>

- *Type:* aws-cdk-lib.Stack

The Stack to apply the suppression to.

---

###### `suppressions`<sup>Required</sup> <a name="suppressions" id="@jaykingson/cdk-nag-custom-nag-pack.NagSuppressions.addStackSuppressions.parameter.suppressions"></a>

- *Type:* cdk-nag.NagPackSuppression[]

A list of suppressions to apply to the stack.

---

###### `applyToNestedStacks`<sup>Optional</sup> <a name="applyToNestedStacks" id="@jaykingson/cdk-nag-custom-nag-pack.NagSuppressions.addStackSuppressions.parameter.applyToNestedStacks"></a>

- *Type:* boolean

Apply the suppressions to children stacks (default:false).

---




