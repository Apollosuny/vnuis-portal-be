import { Module } from '@nestjs/common'

import { CoreModule } from '@app/core/core.module'
import { AuthModule } from '@app/auth'
import { OperatorModule } from '@app/operator'
import { StudentModule } from '@app/student'

@Module({
  imports: [CoreModule, AuthModule, OperatorModule, StudentModule],
  controllers: [],
  providers: [],
})
export class ApiModule {}
