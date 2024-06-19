# cdk-nag-custom-nag-pack

[![All Contributors](https://img.shields.io/github/all-contributors/JohannesKonings/cdk-nag-custom-nag-pack?color=ee8449&style=flat-square)](#contributors)

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
## Contributors

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->
