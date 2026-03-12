# AWS CDK v2 Research Summary

Research Date: 2026-03-11

Sources:
- https://docs.aws.amazon.com/cdk/v2/guide/home.html
- https://docs.aws.amazon.com/cdk/v2/guide/core-concepts.html
- https://docs.aws.amazon.com/cdk/v2/guide/constructs.html
- https://docs.aws.amazon.com/cdk/v2/guide/best-practices.html
- https://github.com/aws/aws-cdk
- https://github.com/kalaiser/awesome-cdk

---

## 1. Overview and Version Information

- **Latest Version**: v2.242.0 (March 10, 2026)
- **CDK v1**: End of support June 1, 2023
- **GitHub Stars**: 12.7k+, 1,665+ contributors
- **What it is**: Open-source IaC framework that defines cloud infrastructure in general-purpose programming languages and provisions via AWS CloudFormation

### Supported Languages

| Language | Requirement |
|----------|-------------|
| TypeScript/JavaScript | Node.js >= 20.x (Active LTS recommended) |
| Python | >= 3.8 |
| Java | >= 8 with Maven >= 3.5.4 |
| C#/.NET | >= 8.0 |
| Go | >= 1.16.4 |

### Quick Start

```bash
npm i -g aws-cdk
mkdir hello-cdk && cd hello-cdk
cdk init sample-app --language=typescript
```

### Core CLI Commands

- `cdk synth` -- Synthesize CloudFormation template
- `cdk deploy` -- Deploy stack to AWS
- `cdk diff` -- Compare local changes vs deployed stack
- `cdk destroy` -- Remove deployed stack

---

## 2. Core Concepts and Terminology

### Hierarchy: App -> Stack -> Construct

- **App**: Top-level container for the CDK project
- **Stack**: Unit of deployment, maps directly to a CloudFormation stack
- **Construct**: Reusable building block representing one or more AWS resources

### Construct Levels

| Level | Name | Description | Naming | Use When |
|-------|------|-------------|--------|----------|
| L1 | CFN Resources | Direct 1:1 mapping to CloudFormation resources, no abstraction | Prefix `Cfn` (e.g., `CfnBucket`) | Need full control, no L2 exists |
| L2 | Curated Constructs | Intent-based API with sensible defaults and helper methods | Service name (e.g., `Bucket`) | Most common use case |
| L3 | Patterns | Multi-resource architectures for specific use cases | Descriptive (e.g., `ApplicationLoadBalancedFargateService`) | Deploy entire architectures |

#### L1 Example (TypeScript)

```typescript
const bucket = new s3.CfnBucket(this, "MyBucket", {
  bucketName: "my-bucket",
  corsConfiguration: {
    corsRules: [{
      allowedOrigins: ["*"],
      allowedMethods: ["GET"]
    }]
  }
});
```

#### L2 Example (TypeScript)

```typescript
new s3.Bucket(this, 'MyEncryptedBucket', {
  encryption: s3.BucketEncryption.KMS,
  websiteIndexDocument: 'index.html'
});
```

#### L3 Example (TypeScript)

```typescript
new ecsPatterns.ApplicationLoadBalancedFargateService(this, 'Service', {
  // Creates ECS cluster, Fargate service, ALB, and all related resources
});
```

### Construct Initialization Pattern

All constructs take three parameters:

```typescript
new ConstructClass(scope, id, props)
```

1. **scope**: Parent construct (usually `this`)
2. **id**: Unique identifier within scope; used for CloudFormation logical IDs
3. **props**: Configuration properties

### Mixins (Composable Features)

```typescript
new s3.CfnBucket(this, 'MyBucket')
  .with(new s3.mixins.BucketVersioning())
  .with(new s3.mixins.BucketBlockPublicAccess());
```

### Other Key Concepts

- **Environments**: Target AWS account + region for deployment
- **Bootstrapping**: One-time setup required before deploying to an environment
- **Assets**: Files (Lambda code, Docker images) bundled with infrastructure
- **Context**: Cached values from environment lookups (stored in `cdk.context.json`)
- **Tokens**: Lazy values resolved at synthesis/deploy time
- **Aspects**: Visitors that apply operations across all constructs in a scope
- **Feature Flags**: Opt-in behavior changes between CDK versions

---

## 3. Best Practices

### Organization

- Establish a Cloud Center of Excellence (CCoE) for standards and mentoring
- Define programming language standards for infrastructure code
- Use AWS Control Tower for multi-account landing zones
- Isolate environments in separate AWS accounts

### Code Organization

- **Start simple**, add complexity only when needed
- Start with a single package in a single repository
- Move packages to separate repos when shared across applications
- Use a private package repository (e.g., AWS CodeArtifact)
- Keep infrastructure and runtime code in the same package

### Construct Design

- **Model with Constructs, Deploy with Stacks**: Constructs are logical units; stacks define deployment
- **Configure with properties, NOT environment variables** (anti-pattern: env var lookups inside constructs)
- **Unit test infrastructure**: Ensure deterministic template generation
- **Never change logical IDs of stateful resources**: Causes resource replacement (data loss)
- Use composition over inheritance

### Security

- Constructs alone are NOT enough for compliance -- use SCPs, permission boundaries, Aspects
- Let CDK manage IAM roles and security groups via `grants` methods
- Example: `bucket.grants.read(myLambda)` creates minimally-scoped IAM policies automatically

### Stack Design

- Keep as many resources in the same stack as possible (simpler)
- Separate stateful resources (databases) from stateless resources
- Enable termination protection on stateful stacks
- Do not nest stateful resources inside constructs likely to be renamed/moved

### Deployment and Determinism

- **Commit `cdk.context.json` to version control** -- prevents non-deterministic synthesis
- Make decisions at synthesis time (use if/loops in code, NOT CloudFormation Conditions/Parameters)
- Use generated resource names, NOT physical/hardcoded names
- Model all production stages in code (separate stacks per environment)
- Store sensitive values in Secrets Manager or SSM Parameter Store
- Define explicit removal policies and log retention for production resources

### Monitoring

- Create metrics, alarms, and dashboards for all resources
- Record business metrics, not just infrastructure metrics
- Use L2 construct convenience methods (e.g., `table.metricUserErrors()`)

---

## 4. Anti-Patterns to Avoid

| Anti-Pattern | Recommendation |
|---|---|
| Multiple applications in same repository | Separate repositories per application |
| Environment variable lookups in constructs/stacks | Use properties objects for configuration |
| Hardcoding resource names | Let CDK generate names |
| Network/SDK calls during synthesis | Use context providers; commit `cdk.context.json` |
| Modifying AWS resources during synthesis | Synthesis is for template generation only |
| Using CloudFormation Conditions/Parameters | Make decisions at synthesis time with code |
| Relying solely on custom constructs for compliance | Use SCPs, permission boundaries, Aspects |
| Not testing infrastructure code | Write unit tests; assert logical IDs of stateful resources |
| Changing logical IDs of stateful resources | Write tests to ensure IDs remain static |
| Indefinite log/resource retention in production | Define explicit removal policies and log retention |
| Custom L2+ wrappers blocking third-party constructs | Use Aspects for enforcement instead |

---

## 5. Common Patterns

### Grant Pattern (IAM Permissions)

```typescript
const bucket = new s3.Bucket(this, 'Data');
const fn = new lambda.Function(this, 'Handler', { /* ... */ });
bucket.grantRead(fn); // Automatically creates minimal IAM policy
```

### Cross-Stack References

```typescript
// Stack A exports
this.uploadBucket = new s3.Bucket(this, 'Upload');

// Stack B imports
new lambda.Function(this, 'Processor', {
  environment: { BUCKET: props.uploadBucket.bucketName }
});
```

### Custom Construct (Composition)

```typescript
export class NotifyingBucket extends Construct {
  public readonly topic: sns.Topic;

  constructor(scope: Construct, id: string, props: NotifyingBucketProps) {
    super(scope, id);
    const bucket = new s3.Bucket(this, 'bucket');
    this.topic = new sns.Topic(this, 'topic');
    bucket.addObjectCreatedNotification(
      new s3notify.SnsDestination(this.topic),
      { prefix: props.prefix }
    );
  }
}
```

### Environment-Specific Stacks

```typescript
const app = new cdk.App();
new MyStack(app, 'Dev', { env: { account: '111111111111', region: 'us-east-1' } });
new MyStack(app, 'Prod', { env: { account: '222222222222', region: 'us-west-2' } });
```

---

## 6. Useful Libraries and Tools (TypeScript Focus)

### Construct Libraries

| Library | Description |
|---------|-------------|
| **cdk-monitoring-constructs** | High-level monitoring APIs with automatic dashboard generation |
| **cdk-watchful** | Auto-generates dashboards and CloudWatch alarms |
| **cdk-iam-floyd** | Fluent interface for IAM policy statements |
| **cdk-static-website** | Complete static site stack (S3 + CloudFront + Route53) |
| **aws-cdk-dynamodb-seeder** | Seed DynamoDB tables during deployment |
| **cdk-sqs-monitored** | SQS with DLQ and CloudWatch alarms |
| **aws-cdk-billing-alarm** | Cost threshold monitoring with email notifications |
| **cdk-time-bomb** | Auto-destroy stacks after specified duration |
| **aws-bootstrap-kit** | Enterprise multi-account setup with SSO and DNS |
| **cdk-organizations** | AWS Organizations and account provisioning |
| **aws-firewall-factory** | Centralized WAF management |
| **cdk-cloudfront-authorization** | Cognito authentication for CloudFront |

### High-Level Frameworks

| Framework | Description |
|-----------|-------------|
| **SST (Serverless Stack)** | Serverless framework with local Lambda development environment |
| **punchcard** | Unified TypeScript framework combining infrastructure and runtime |
| **Orkestra** | Event-driven workflow orchestration (alternative to Airflow) |
| **Datajob** | Rapid serverless data/ML pipeline deployment |
| **projen** | Project configuration management |

### Development Tools

| Tool | Description |
|------|-------------|
| **CDK-Dia** | Auto-generate infrastructure diagrams from CDK code |
| **aws-lambda-nodejs-esbuild** | High-performance Lambda bundling using esbuild |
| **jsii** | Language interoperability layer for multi-language constructs |
| **jsii-publish** | Docker/GitHub Actions for multi-language construct publishing |
| **GitHub Action (CDK)** | Official CDK GitHub Actions integration |
| **CodeArtifact** | AWS-hosted private package repository |

### Scaffolding Templates

| Template | Description |
|----------|-------------|
| **create-cdk-app** | Template-based CDK application generator |
| **awscdk-jsii-template** | GitHub template for construct library development |
| **cra-template-aws-cdk** | Create React App with built-in CDK provisioning |

### Related Ecosystem

| Project | Description |
|---------|-------------|
| **cdk8s** | CDK for Kubernetes |
| **cdktf** | CDK for Terraform |
| **Construct Hub** (constructs.dev) | Public registry for CDK construct libraries |

---

## 7. Key Resources

- **Developer Guide**: https://docs.aws.amazon.com/cdk/latest/guide
- **API Reference**: https://docs.aws.amazon.com/cdk/api/v2/docs/aws-construct-library.html
- **Construct Hub**: https://constructs.dev
- **CDK Patterns**: https://cdkpatterns.com
- **CDK Workshop**: https://cdkworkshop.com
- **GitHub**: https://github.com/aws/aws-cdk
- **Community Slack**: #aws-cdk via https://cdk.dev
- **Stack Overflow**: Tag `aws-cdk`
- **Awesome CDK**: https://github.com/kalaiser/awesome-cdk

---

## 8. Summary for Skill Building

Key takeaways for building an AWS CDK skill:

1. **Always use L2 constructs** when available -- they provide sensible defaults and security best practices
2. **TypeScript is the primary language** -- best documentation, most examples, first-class support
3. **Composition is the fundamental pattern** -- build custom constructs by composing L2/L3 constructs
4. **Stacks are deployment units** -- separate stateful from stateless, use environment-specific stacks
5. **Determinism is critical** -- commit `cdk.context.json`, avoid network calls during synthesis
6. **Use grants for IAM** -- never hand-craft IAM policies when grant methods exist
7. **Test infrastructure** -- assert templates, logical IDs, and security properties
8. **Use Aspects for enforcement** -- not custom wrapper constructs
9. **Generated names over hardcoded** -- enables multiple deployments and replacements
10. **Latest version**: v2.242.0 with stable module support and semantic versioning
