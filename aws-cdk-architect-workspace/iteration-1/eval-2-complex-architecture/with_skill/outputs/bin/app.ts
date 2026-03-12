#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { CognitoApiThumbnailStack } from '../lib/cognito-api-thumbnail-stack';

const app = new cdk.App();

new CognitoApiThumbnailStack(app, 'CognitoApiThumbnailStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
  environment: 'dev',
});
