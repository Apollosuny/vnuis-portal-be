import { Module } from '@nestjs/common'

import { CoreModule } from '@app/core/core.module'

@Module({
  imports: [CoreModule],
  controllers: [],
  providers: [],
})
export class ApiModule {}
