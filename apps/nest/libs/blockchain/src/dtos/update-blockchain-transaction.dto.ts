import { PartialType } from '@nestjs/swagger'
import { CreateBlockchainTransactionDto } from './create-blockchain-transaction.dto'

export class UpdateBlockchainTransactionDto extends PartialType(CreateBlockchainTransactionDto) {}
