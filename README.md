# cdk-nag-custom-nag-pack

## rules

| Rule ID | Cause                   | Explanation                          |
| ------- | ----------------------- | ------------------------------------ |
| CR1     | Definend tags not exist | Certain tags are checked if it exist |

## config

### CR1

```typescript
import { CustomChecks } from '@jaykingson/cdk-nag-custom-nag-pack'
...
Aspects.of(app).add(new CustomChecks({
    // use whatever tags you want to check
  cr1TagsToCheck: ['Environment', 'Owner'],
}));
```
