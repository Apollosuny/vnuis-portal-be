import { Expose } from 'class-transformer'
import { ApiProperty } from '@nestjs/swagger'

export class CategoryAnalysisDto {
  @ApiProperty({ type: Array })
  @Expose()
  distribution: any[]

  @ApiProperty({ type: Array })
  @Expose()
  trends: any[]
}
