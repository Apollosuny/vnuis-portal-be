import { Module } from '@nestjs/common';
import { RecurringPatternService } from './recurring-pattern.service';

@Module({
  providers: [RecurringPatternService],
  exports: [RecurringPatternService],
})
export class RecurringPatternModule {}
