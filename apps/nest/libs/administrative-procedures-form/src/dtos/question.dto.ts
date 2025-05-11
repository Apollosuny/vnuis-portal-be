import { ApiProperty } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { IsArray } from 'class-validator'

class AnswerDto {
  @Expose()
  @ApiProperty()
  id: number

  @Expose()
  @ApiProperty()
  type: string

  @Expose()
  @ApiProperty()
  content: string
}

class QuestionDto {
  @Expose()
  @ApiProperty()
  id: number

  @Expose()
  @ApiProperty()
  type: string

  @Expose()
  @ApiProperty()
  title: string

  @IsArray()
  @Type(() => AnswerDto)
  @Expose()
  @ApiProperty()
  answers: AnswerDto[]
}

export class QuestionsDto {
  @IsArray()
  @Type(() => QuestionDto)
  @Expose()
  @ApiProperty()
  questions: QuestionDto[]
}
