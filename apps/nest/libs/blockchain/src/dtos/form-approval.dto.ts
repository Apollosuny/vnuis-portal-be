// This file defines the DTO for form approval on blockchain
import { FormSubmissionStatus } from '@prisma/client'
import { Expose } from 'class-transformer'
import { ApiProperty } from '@nestjs/swagger'

// DTO for blockchain form approval submission
export class FormApprovalDto {
  @ApiProperty({ description: 'The ID of the form submission' })
  @Expose()
  submissionId: string

  @ApiProperty({ description: 'The blockchain transaction ID' })
  @Expose()
  transactionId: string

  @ApiProperty({ description: 'The blockchain program ID', required: false })
  @Expose()
  programId?: string

  @ApiProperty({ description: 'The form approval data from blockchain', required: false })
  @Expose()
  formApprovalData?: {
    formId?: string
    formHash?: number[]
    signer?: string
    approvedAt?: number
    metadata?: string
  }

  @ApiProperty({ description: 'The timestamp of the approval' })
  @Expose()
  approvedAt: string
}

// Response DTO for blockchain form approval verification
export class FormVerificationResponseDto {
  @ApiProperty({ description: 'Whether the form data matches the blockchain record' })
  @Expose()
  isValid: boolean

  @ApiProperty({ description: 'The blockchain transaction ID', required: false })
  @Expose()
  transactionId?: string

  @ApiProperty({ description: 'The verification timestamp', required: false })
  @Expose()
  verifiedAt?: string

  @ApiProperty({ description: 'Error message if verification failed', required: false })
  @Expose()
  error?: string
}

// Response DTO for blockchain form approval record
export class FormApprovalResponseDto {
  @ApiProperty({ description: 'The ID of the blockchain approval record' })
  @Expose()
  id: string

  @ApiProperty({ description: 'The ID of the form submission' })
  @Expose()
  submissionId: string

  @ApiProperty({ description: 'The blockchain transaction ID' })
  @Expose()
  transactionId: string

  @ApiProperty({ description: 'The blockchain program ID', required: false })
  @Expose()
  programId?: string

  @ApiProperty({ description: 'The form approval data from blockchain', required: false })
  @Expose()
  formApprovalData?: Record<string, any>

  @ApiProperty({ description: 'The timestamp of the approval' })
  @Expose()
  approvedAt: string

  @ApiProperty({ description: 'The status of the form submission' })
  @Expose()
  status: FormSubmissionStatus
}
