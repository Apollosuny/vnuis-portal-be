import { ApiProperty } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { IsNotEmpty, IsString, MinLength } from 'class-validator'

export class LoginDto {
  @IsNotEmpty()
  @Expose()
  @ApiProperty()
  readonly username: string

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @Expose()
  @ApiProperty({ minLength: 6, example: 'mypassword123', required: true })
  readonly password: string
}
