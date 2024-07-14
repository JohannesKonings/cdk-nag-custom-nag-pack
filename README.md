# cdk-nag-custom-nag-pack

[![All Contributors](https://img.shields.io/github/all-contributors/JohannesKonings/cdk-nag-custom-nag-pack?color=ee8449&style=flat-square)](#contributors)

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
