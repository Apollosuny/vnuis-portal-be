import { ApiProperty } from '@nestjs/swagger'
import { JsonValue } from '@prisma/client/runtime/library'
import { Expose, Transform } from 'class-transformer'
import { IsNotEmpty, IsObject } from 'class-validator'

/**
 * Custom decorator to validate the answer data structure
 * while allowing dynamic keys
 */
export class SubmitDto {
  @ApiProperty({
    description: 'Form submission result data',
    example: {
      '1': {
        '1': false,
        '2': 'Some text answer',
        '3': true,
        '4': 42,
      },
      '2': {
        '1': false,
        '2': true,
        '3': 'Another text response',
        '4': false,
      },
    },
  })
  @IsObject()
  @IsNotEmpty()
  @Expose()
  @Transform(({ value }) => {
    // Ensure all values are valid question-answer pairs
    if (typeof value !== 'object' || value === null) return value

    // Validate each question's answers
    for (const questionId in value) {
      if (typeof value[questionId] !== 'object' || value[questionId] === null) {
        return value // Let validation handle this error
      }
    }

    return value
  })
  // Using Record<string, any> allows for mixed types in the answer values
  result: Record<string, Record<string, any>>
}
