import { Module } from '@nestjs/common'

import { CoreModule } from '@app/core/core.module'
import { AuthModule } from '@app/auth'

@Module({
  imports: [CoreModule, AuthModule],
  controllers: [],
  providers: [],
})
export class ApiModule {}
