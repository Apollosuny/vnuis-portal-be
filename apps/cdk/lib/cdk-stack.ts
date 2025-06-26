import * as cdk from 'aws-cdk-lib'
import { Construct } from 'constructs'
import { IConfig } from '../bin/config'
import { Code, LayerVersion, Runtime } from 'aws-cdk-lib/aws-lambda'
import path from 'path'
import { ISecurityGroup, IVpc, SecurityGroup, Vpc } from 'aws-cdk-lib/aws-ec2'
import { EventBus } from 'aws-cdk-lib/aws-events'
import { Apigateway } from './infras/apigateway'
import { ApiFunction } from './functions/api-function'
import { ISecret, Secret } from 'aws-cdk-lib/aws-secretsmanager'
import { Database } from './infras/database'

export class CdkStack extends cdk.Stack {
  secret: ISecret
  vpc: IVpc
  sg: ISecurityGroup
  bus: EventBus

  db: Database

  layer: LayerVersion
  apigateway: Apigateway

  commonEnvs: {
    ENV: string
    JWT_SECRET: string
    JWT_REFRESH_SECRET: string
    JWT_EXPIRES: string
    JWT_REFRESH_EXPIRES: string
    GEMINI_API_KEY: string
  }

  constructor(scope: Construct, id: string, config: IConfig, props?: cdk.StackProps) {
    super(scope, id, props)

    this.secret = Secret.fromSecretCompleteArn(this, 'nexus-secret', config.SECRET_ARN)

    this.commonEnvs = {
      ENV: config.env,
      JWT_SECRET: this.secret.secretValueFromJson('JWT_SECRET').unsafeUnwrap(),
      JWT_EXPIRES: this.secret.secretValueFromJson('JWT_EXPIRES').unsafeUnwrap(),
      JWT_REFRESH_SECRET: this.secret.secretValueFromJson('JWT_REFRESH_SECRET').unsafeUnwrap(),
      JWT_REFRESH_EXPIRES: this.secret.secretValueFromJson('JWT_REFRESH_EXPIRES').unsafeUnwrap(),
      GEMINI_API_KEY: this.secret.secretValueFromJson('GEMINI_API_KEY').unsafeUnwrap(),
    }

    this.vpc = Vpc.fromLookup(this, 'VPC', { isDefault: true })
    this.sg = SecurityGroup.fromLookupByName(this, 'sg', 'default', this.vpc)

    this.db = new Database(this, 'db', config)

    this.layer = new LayerVersion(this, 'Layer', {
      code: Code.fromAsset(path.join(__dirname, '../../nest/dist/layer')),
      compatibleRuntimes: [Runtime.NODEJS_20_X],
    })

    this.apigateway = new Apigateway(this, 'Apigateway', config)

    const apiFunc = new ApiFunction(this, 'ApiFunction', config)

    this.apigateway.addFunction(apiFunc, 'api').build()
  }
}
