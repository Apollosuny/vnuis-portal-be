import { Expose } from 'class-transformer'
import { ApiProperty } from '@nestjs/swagger'

export class RatingAnalysisDto {
  @ApiProperty({ type: Array })
  @Expose()
  distribution: any[]

  @ApiProperty()
  @Expose()
  average: number
}
