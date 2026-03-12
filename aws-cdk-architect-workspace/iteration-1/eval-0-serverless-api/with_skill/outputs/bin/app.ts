#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { TodoApiStack } from '../lib/todo-api-stack';

const app = new cdk.App();

const env = (app.node.tryGetContext('environment') as 'dev' | 'staging' | 'prod') ?? 'dev';

new TodoApiStack(app, `TodoApiStack-${env}`, {
  environment: env,
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION ?? 'ap-northeast-1',
  },
});
