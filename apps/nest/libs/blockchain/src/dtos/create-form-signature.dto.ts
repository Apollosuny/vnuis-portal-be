import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { IsNotEmpty, IsString, IsUUID } from 'class-validator'

export class CreateFormSignatureOnChainDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Expose()
  formHash: string

  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  @Expose()
  formSubmissionId: string

  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  @Expose()
  transactionId: string
}
