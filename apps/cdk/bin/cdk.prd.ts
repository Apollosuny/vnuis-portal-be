#!/usr/bin/env node
import 'source-map-support/register'
import * as cdk from 'aws-cdk-lib'
import { CdkStack } from '../lib/cdk-stack'

const app = new cdk.App()
new CdkStack(
  app,
  'be-boilerplate-prd',
  {
    env: 'prd',
    name: 'be-boilerplate',
    ORIGINS: ['http://localhost:3000'],
    SECRET_ARN: 'arn:aws:secretsmanager:ap-southeast-1:182399686191:secret:istech-secret-prd-XXXXX',
  },
  {
    env: { account: '390844773626', region: 'ap-southeast-2' },
  },
)
