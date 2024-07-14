# cdk-nag-custom-nag-pack

## rules

| Rule ID | Cause                         | Explanation                                 |
| ------- | ----------------------------- | ------------------------------------------- |
| CR1     | Definend tags not exist       | Certain tags are checked if it exist        |
| CR2     | Definend tags has wrong value | Certain tags are checked with defined value |

## config

### CR1

```typescript
import { CustomChecks } from '@jaykingson/cdk-nag-custom-nag-pack'
...
Aspects.of(app).add(new CustomChecks({
    // use whatever tags you want to check
  cr1TagsToCheck: ['Environment', 'Owner'],
  cr2TagsWithValueToCheck: { Stage: ["dev", "prod"] },
}));
```

## Contributors

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->
