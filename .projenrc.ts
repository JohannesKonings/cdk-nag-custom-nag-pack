import { awscdk, javascript } from "projen";
const name = "cdk-nag-custom-nag-pack";
const scope = "@jaykingson";
const project = new awscdk.AwsCdkConstructLibrary({
  author: "Johannes Konings",
  authorAddress: "johannes.konings@outlook.com",
  cdkVersion: "2.146.0",
  defaultReleaseBranch: "main",
  jsiiVersion: "~5.4.0",
  name,
  packageName: `${scope}/${name}`,
  npmAccess: javascript.NpmAccess.PUBLIC,
  packageManager: javascript.NodePackageManager.NPM,
  projenrcTs: true,
  repositoryUrl: "git@github.com:JohannesKonings/cdk-nag-custom-nag-pack.git",
  prettier: true,
  deps: [],
  devDeps: ["cdk-nag", "@aws-cdk/assert"],
  peerDeps: ["cdk-nag", "aws-cdk-lib"],
  keywords: ["aws", "cdk", "cdk-nag", "custom-nag-pack"],
});
project.synth();
