import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { IsEnum, IsNotEmpty, IsOptional, IsString, ValidateIf } from 'class-validator'
import { BlockchainTransactionType, BlockchainType } from '../entities/blockchain-transaction.entity'

export class CreateBlockchainTransactionDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Expose()
  txHash: string

  @ApiProperty({ enum: BlockchainType })
  @IsEnum(BlockchainType)
  @IsNotEmpty()
  @Expose()
  chain: BlockchainType

  @ApiProperty({ enum: BlockchainTransactionType })
  @IsEnum(BlockchainTransactionType)
  @IsNotEmpty()
  @Expose()
  txType: BlockchainTransactionType

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Expose()
  senderAddress: string

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @Expose()
  receiverAddress?: string

  @ApiPropertyOptional()
  @IsOptional()
  @Expose()
  metadata?: Record<string, any>
}
