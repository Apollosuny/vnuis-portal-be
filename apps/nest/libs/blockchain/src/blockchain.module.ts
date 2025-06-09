import { Module } from '@nestjs/common'
import { BlockchainService } from './blockchain.service'
import { BlockchainController } from './controllers/blockchain.controller'
import { PrismaModule } from 'nestjs-prisma'

@Module({
  imports: [PrismaModule],
  controllers: [BlockchainController],
  providers: [BlockchainService],
  exports: [BlockchainService],
})
export class BlockchainModule {}
