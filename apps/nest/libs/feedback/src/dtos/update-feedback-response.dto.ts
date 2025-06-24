import { PartialType } from '@nestjs/swagger'
import { CreateFeedbackResponseDto } from './create-feedback-response.dto'

export class UpdateFeedbackResponseDto extends PartialType(CreateFeedbackResponseDto) {}
