import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards, UseInterceptors } from '@nestjs/common'
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { JwtGuard } from '@app/auth/guards/jwt.guard'
import { CacheTTL } from '@nestjs/cache-manager'
import { AppCacheInterceptor } from '@app/core/interceptors/app-cache-interceptor'
import { AppCacheKey } from '@app/core/decorators/app-cache-key.decorator'
import { CurUser } from '@app/core/decorators/user.decorator'
import { User } from '@prisma/client'
import { RawQuery } from '@app/core/decorators/query.decorator'
import { BlockchainService } from '../blockchain.service'
import { QueryBlockchainTransactionDto } from '../dtos/query-blockchain-transaction.dto'
import { BlockchainTransactionEntity, FormSignatureOnChainEntity } from '../entities/blockchain-transaction.entity'
import { CreateBlockchainTransactionDto } from '../dtos/create-blockchain-transaction.dto'
import { UpdateBlockchainTransactionDto } from '../dtos/update-blockchain-transaction.dto'
import { CreateFormSignatureOnChainDto } from '../dtos/create-form-signature.dto'

@ApiTags('blockchain')
@Controller('blockchain')
export class BlockchainController {
  constructor(private readonly blockchainService: BlockchainService) {}

  @Get('transactions')
  @ApiBearerAuth()
  @ApiOkResponse({ type: () => BlockchainTransactionEntity, isArray: true })
  @UseGuards(JwtGuard)
  @CacheTTL(2000)
  @UseInterceptors(AppCacheInterceptor)
  getTransactions(@RawQuery() query: QueryBlockchainTransactionDto) {
    return this.blockchainService.getTransactions(query)
  }

  @Get('transactions/:id')
  @ApiBearerAuth()
  @ApiOkResponse({ type: () => BlockchainTransactionEntity })
  @UseGuards(JwtGuard)
  @CacheTTL(2000)
  @AppCacheKey((req) => `blockchain-transaction-${req.params.id}`)
  @UseInterceptors(AppCacheInterceptor)
  getTransaction(@Param('id') id: string) {
    return this.blockchainService.getTransaction(id)
  }

  @Get('transactions/hash/:txHash')
  @ApiBearerAuth()
  @ApiOkResponse({ type: () => BlockchainTransactionEntity })
  @UseGuards(JwtGuard)
  @CacheTTL(2000)
  @AppCacheKey((req) => `blockchain-transaction-hash-${req.params.txHash}`)
  @UseInterceptors(AppCacheInterceptor)
  getTransactionByHash(@Param('txHash') txHash: string) {
    return this.blockchainService.getTransactionByHash(txHash)
  }

  @Post('transactions')
  @ApiBearerAuth()
  @ApiOkResponse({ type: () => BlockchainTransactionEntity })
  @UseGuards(JwtGuard)
  createTransaction(@Body() createDto: CreateBlockchainTransactionDto, @CurUser() user: User) {
    return this.blockchainService.createTransaction(createDto, user)
  }

  @Put('transactions/:id')
  @ApiBearerAuth()
  @ApiOkResponse({ type: () => BlockchainTransactionEntity })
  @UseGuards(JwtGuard)
  updateTransaction(@Param('id') id: string, @Body() updateDto: UpdateBlockchainTransactionDto, @CurUser() user: User) {
    return this.blockchainService.updateTransaction(id, updateDto, user)
  }

  @Delete('transactions/:id')
  @ApiBearerAuth()
  @ApiOkResponse({ type: () => BlockchainTransactionEntity })
  @UseGuards(JwtGuard)
  deleteTransaction(@Param('id') id: string, @CurUser() user: User) {
    return this.blockchainService.deleteTransaction(id, user)
  }

  @Post('signatures')
  @ApiBearerAuth()
  @ApiOkResponse({ type: () => FormSignatureOnChainEntity })
  @UseGuards(JwtGuard)
  createFormSignature(@Body() createDto: CreateFormSignatureOnChainDto) {
    return this.blockchainService.createFormSignature(createDto)
  }

  @Get('signatures/form/:formSubmissionId')
  @ApiBearerAuth()
  @ApiOkResponse({ type: () => FormSignatureOnChainEntity })
  @UseGuards(JwtGuard)
  @CacheTTL(2000)
  @AppCacheKey((req) => `form-signature-${req.params.formSubmissionId}`)
  @UseInterceptors(AppCacheInterceptor)
  getFormSignature(@Param('formSubmissionId') formSubmissionId: string) {
    return this.blockchainService.getFormSignature(formSubmissionId)
  }
}
