import { Credentials, DatabaseInstance, DatabaseInstanceEngine, StorageType } from 'aws-cdk-lib/aws-rds'

import { InstanceClass, InstanceSize, InstanceType, Port, SubnetType } from 'aws-cdk-lib/aws-ec2'
import { Duration, SecretValue } from 'aws-cdk-lib'
import { BaseInfa } from './_infra-base'
import { CdkStack } from '../cdk-stack'
import { IConfig } from '../../bin/config'

export class Database extends BaseInfa {
  instance: DatabaseInstance
  dbName: string

  dbEnvs: { [key: string]: string } = {}

  constructor(scope: CdkStack, id: string, config: IConfig) {
    super(scope, id, config)

    const env = config.env
    this.dbName = `istech_db_${env}`

    const username = scope.secret.secretValueFromJson(`DB_USERNAME_${env}`).unsafeUnwrap()
    const password = scope.secret.secretValueFromJson(`DB_PASSWORD_${env}`)
    const dbCredentials = Credentials.fromPassword(username, password)

    this.instance = new DatabaseInstance(this, this.dbName, {
      engine: DatabaseInstanceEngine.POSTGRES,
      vpc: scope.vpc,
      vpcSubnets: { subnetType: SubnetType.PUBLIC },
      instanceType: InstanceType.of(InstanceClass.T4G, InstanceSize.MICRO),
      multiAz: false,
      storageType: StorageType.GP2,
      publiclyAccessible: true,
      allocatedStorage: 20,
      backupRetention: Duration.days(21),
      securityGroups: [scope.sg],
      credentials: dbCredentials,
      databaseName: this.dbName,
    })

    this.instance.connections.allowFromAnyIpv4(Port.tcp(5432))

    this.dbEnvs = {
      POSTGRES_HOST: this.instance.dbInstanceEndpointAddress,
      POSTGRES_PORT: this.instance.dbInstanceEndpointPort,
      POSTGRES_USERNAME: username,
      POSTGRES_PASSWORD: password.unsafeUnwrap(),
      POSTGRES_DB: this.dbName,
      DATABASE_URL: `postgresql://${username}:${password.unsafeUnwrap()}@${this.instance.dbInstanceEndpointAddress}:${
        this.instance!.dbInstanceEndpointPort
      }/${this.dbName}?schema=public`,
    }
  }
}
