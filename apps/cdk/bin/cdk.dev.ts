#!/usr/bin/env node
import 'source-map-support/register'
import * as cdk from 'aws-cdk-lib'
import { CdkStack } from '../lib/cdk-stack'

const app = new cdk.App()
new CdkStack(
  app,
  'be-boilerplate-dev',
  {
    env: 'dev',
    name: 'nexus-boilerplate',
    ORIGINS: ['http://localhost:3000', 'https://virtuuni-nexus.netlify.app'],
    SECRET_ARN: process.env.SECRET_ARN!,
  },
  {
    env: { account: '390844773626', region: 'ap-southeast-2' },
  },
)
