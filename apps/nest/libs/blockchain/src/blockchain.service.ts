import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { PrismaService } from 'nestjs-prisma'
import { CreateBlockchainTransactionDto } from './dtos/create-blockchain-transaction.dto'
import { UpdateBlockchainTransactionDto } from './dtos/update-blockchain-transaction.dto'
import { QueryBlockchainTransactionDto } from './dtos/query-blockchain-transaction.dto'
import { CreateFormSignatureOnChainDto } from './dtos/create-form-signature.dto'
import { FormApprovalDto, FormVerificationResponseDto } from './dtos/form-approval.dto'
import {
  User,
  FormSubmissionStatus,
  BlockchainType,
  BlockchainTransactionType,
  BlockchainTransactionStatus,
} from '@prisma/client'
import { th } from '@app/helper/transform.helper'
import { bh } from '@app/helper/blockchain.helper'
import { BlockchainTransactionEntity, FormSignatureOnChainEntity } from './entities/blockchain-transaction.entity'

@Injectable()
export class BlockchainService {
  private readonly programId: string

  constructor(private readonly prisma: PrismaService) {
    this.programId = process.env.SOLANA_PROGRAM_ID || '7xMFfY7wEggjbVTQvtLYXcnAsNBFxiBDSx6ohtuxSYXt'
  }

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
        user: {
          connect: { id: user.id },
        },
        metadata: dto.metadata || {}, // Ensure metadata is an object
      },
      include: { user: true },
    })
    return th.toInstanceSafe(BlockchainTransactionEntity, transaction)
  }

  async updateTransaction(id: string, dto: UpdateBlockchainTransactionDto, user: User) {
    const transaction = await this.prisma.blockchainTransaction.update({
      where: { id, userId: user.id },
      data: {
        ...dto,
        metadata: dto.metadata || {}, // Ensure metadata is an object
      },
      include: { user: true },
    })
    return th.toInstanceSafe(BlockchainTransactionEntity, transaction)
  }

  async deleteTransaction(id: string, user: User) {
    // Check if transaction exists and belongs to user
    const transaction = (await this.prisma.blockchainTransaction.findUnique({
      where: { id },
    })) as any // Type assertion since we check null later

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

  /**
   * Record a blockchain approval for a form submission
   */
  async recordFormApproval(dto: FormApprovalDto) {
    // Validate that the submission exists
    const submission = await this.prisma.administrativeProceduresFormSubmission.findUnique({
      where: { id: dto.submissionId },
    })

    if (!submission) {
      throw new NotFoundException(`Form submission with ID ${dto.submissionId} not found`)
    }

    // Ensure submission is in APPROVED status
    if (submission.status !== FormSubmissionStatus.APPROVED) {
      throw new BadRequestException('Can only record blockchain approvals for approved submissions')
    }

    // Create blockchain transaction record
    const transaction = await this.prisma.blockchainTransaction.create({
      data: {
        txHash: dto.transactionId,
        chain: BlockchainType.SOLANA,
        txType: BlockchainTransactionType.FORM_SIGNATURE,
        status: BlockchainTransactionStatus.CONFIRMED,
        senderAddress: dto.formApprovalData?.signer || 'Unknown',
        executedAt: dto.approvedAt ? new Date(dto.approvedAt) : new Date(),
        metadata: {
          programId: dto.programId || this.programId,
          ...dto.formApprovalData,
        },
      },
    })

    // Create form signature record linking to the transaction
    const formSignature = await this.prisma.formSignatureOnChain.create({
      data: {
        formHash: bh.arrayToHash(dto.formApprovalData?.formHash),
        formSubmissionId: dto.submissionId,
        transactionId: transaction.id,
      },
      include: {
        transaction: true,
        formSubmission: true,
      },
    })

    return formSignature
  }

  /**
   * Verify form data against blockchain record
   */
  async verifyFormSubmission(submissionId: string, formData: any): Promise<FormVerificationResponseDto> {
    try {
      const formSignature = await this.prisma.formSignatureOnChain.findUnique({
        where: { formSubmissionId: submissionId },
        include: { transaction: true },
      })

      if (!formSignature) {
        return {
          isValid: false,
          error: `Blockchain approval for submission ${submissionId} not found`,
          verifiedAt: new Date().toISOString(),
        }
      }

      // Hash the form data and compare
      const formHash = bh.createFormHash(formData)
      const storedHash = bh.hashToArray(formSignature.formHash)
      const isEqual = bh.compareUint8Arrays(formHash, storedHash)

      return {
        isValid: isEqual,
        transactionId: formSignature.transactionId,
        verifiedAt: new Date().toISOString(),
        error: isEqual ? undefined : 'Form data does not match blockchain record',
      }
    } catch (error) {
      console.error('Error verifying form submission:', error)
      return {
        isValid: false,
        verifiedAt: new Date().toISOString(),
        error: `Verification error: ${error.message}`,
      }
    }
  }
}
