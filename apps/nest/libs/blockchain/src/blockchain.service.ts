import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from 'nestjs-prisma'
import { CreateBlockchainTransactionDto } from './dtos/create-blockchain-transaction.dto'
import { UpdateBlockchainTransactionDto } from './dtos/update-blockchain-transaction.dto'
import { QueryBlockchainTransactionDto } from './dtos/query-blockchain-transaction.dto'
import { CreateFormSignatureOnChainDto } from './dtos/create-form-signature.dto'
import { User } from '@prisma/client'
import { th } from '@app/helper/transform.helper'
import { BlockchainTransactionEntity, FormSignatureOnChainEntity } from './entities/blockchain-transaction.entity'

@Injectable()
export class BlockchainService {
  constructor(private readonly prisma: PrismaService) {}

  async getTransactions(queryDto: QueryBlockchainTransactionDto) {
    const { select, include } = queryDto
    const transactions = await this.prisma.blockchainTransaction.findMany({
      where: queryDto.where,
      orderBy: queryDto.sort,
      take: queryDto.take,
      skip: queryDto.skip,
      ...(select
        ? { select: Object.fromEntries(select.map((key) => [key, true])) }
        : include
          ? { include: Object.fromEntries(include.map((key) => [key, true])) }
          : {}),
    })
    return th.toInstancesSafe(BlockchainTransactionEntity, transactions)
  }

  async getTransaction(id: string) {
    const transaction = await this.prisma.blockchainTransaction.findUnique({
      where: { id },
      include: { formSignatures: true, user: true },
    })

    if (!transaction) {
      throw new NotFoundException(`Blockchain transaction with ID ${id} not found`)
    }

    return th.toInstanceSafe(BlockchainTransactionEntity, transaction)
  }

  async getTransactionByHash(txHash: string) {
    const transaction = await this.prisma.blockchainTransaction.findFirst({
      where: { txHash },
      include: { formSignatures: true, user: true },
    })

    if (!transaction) {
      throw new NotFoundException(`Blockchain transaction with hash ${txHash} not found`)
    }

    return th.toInstanceSafe(BlockchainTransactionEntity, transaction)
  }

  async createTransaction(dto: CreateBlockchainTransactionDto, user: User) {
    const transaction = await this.prisma.blockchainTransaction.create({
      data: {
        ...dto,
        userId: user.id,
      },
      include: { user: true },
    })
    return th.toInstanceSafe(BlockchainTransactionEntity, transaction)
  }

  async updateTransaction(id: string, dto: UpdateBlockchainTransactionDto, user: User) {
    const transaction = await this.prisma.blockchainTransaction.update({
      where: { id, userId: user.id },
      data: dto,
      include: { user: true },
    })
    return th.toInstanceSafe(BlockchainTransactionEntity, transaction)
  }

  async deleteTransaction(id: string, user: User) {
    // Check if transaction exists and belongs to user
    const transaction = await this.prisma.blockchainTransaction.findUnique({
      where: { id },
    })

    if (!transaction || transaction.userId !== user.id) {
      throw new NotFoundException(`Blockchain transaction with ID ${id} not found or not authorized`)
    }

    // Delete associated form signatures first (if any)
    await this.prisma.formSignatureOnChain.deleteMany({
      where: { transactionId: id },
    })

    // Then delete the transaction
    await this.prisma.blockchainTransaction.delete({
      where: { id },
    })
  }

  async createFormSignature(dto: CreateFormSignatureOnChainDto) {
    const formSignature = await this.prisma.formSignatureOnChain.create({
      data: dto,
      include: { transaction: true },
    })
    return th.toInstanceSafe(FormSignatureOnChainEntity, formSignature)
  }

  async getFormSignature(formSubmissionId: string) {
    const formSignature = await this.prisma.formSignatureOnChain.findUnique({
      where: { formSubmissionId },
      include: { transaction: true },
    })

    if (!formSignature) {
      throw new NotFoundException(`Form signature for submission ID ${formSubmissionId} not found`)
    }

    return th.toInstanceSafe(FormSignatureOnChainEntity, formSignature)
  }
}
