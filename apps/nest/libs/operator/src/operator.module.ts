import { Module } from '@nestjs/common';
import { OperatorService } from './operator.service';

@Module({
  providers: [OperatorService],
  exports: [OperatorService],
})
export class OperatorModule {}
