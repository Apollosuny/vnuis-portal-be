import { Expose, Type } from 'class-transformer'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { User } from '@prisma/client'
import { UserEntity } from '@app/user/entities/user.entity'

export enum BlockchainType {
  SOLANA = 'SOLANA',
  POLYGON = 'POLYGON',
  ETHEREUM = 'ETHEREUM',
}

export enum BlockchainTransactionType {
  FORM_SIGN = 'FORM_SIGN',
  NFT_MINT = 'NFT_MINT',
  REWARD_TRANSFER = 'REWARD_TRANSFER',
}

export enum BlockchainTransactionStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  FAILED = 'FAILED',
}

export class BlockchainTransactionEntity {
  @ApiProperty()
  @Expose()
  id: string

  @ApiProperty()
  @Expose()
  createdAt: Date

  @ApiProperty()
  @Expose()
  updatedAt: Date

  @ApiProperty()
  @Expose()
  txHash: string

  @ApiProperty({ enum: BlockchainType })
  @Expose()
  chain: BlockchainType

  @ApiProperty({ enum: BlockchainTransactionType })
  @Expose()
  txType: BlockchainTransactionType

  @ApiProperty({ enum: BlockchainTransactionStatus })
  @Expose()
  status: BlockchainTransactionStatus

  @ApiProperty()
  @Expose()
  senderAddress: string

  @ApiPropertyOptional()
  @Expose()
  receiverAddress?: string

  @ApiPropertyOptional()
  @Expose()
  executedAt?: Date

  @ApiPropertyOptional()
  @Expose()
  metadata?: Record<string, any>

  // Relations
  @ApiPropertyOptional()
  @Expose()
  userId?: string

  @ApiPropertyOptional()
  @Type(() => UserEntity)
  @Expose()
  user?: UserEntity

  @ApiProperty({ type: () => FormSignatureOnChainEntity, isArray: true })
  @Type(() => FormSignatureOnChainEntity)
  @Expose()
  formSignatures?: FormSignatureOnChainEntity[]
}

export class FormSignatureOnChainEntity {
  @ApiProperty()
  @Expose()
  id: string

  @ApiProperty()
  @Expose()
  createdAt: Date

  @ApiProperty()
  @Expose()
  updatedAt: Date

  @ApiProperty()
  @Expose()
  formHash: string

  @ApiProperty()
  @Expose()
  formSubmissionId: string

  @ApiProperty()
  @Expose()
  transactionId: string

  // Relations
  @ApiProperty()
  @Type(() => BlockchainTransactionEntity)
  @Expose()
  transaction: BlockchainTransactionEntity
}
