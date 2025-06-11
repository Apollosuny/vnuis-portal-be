import { TestContext, UserContextTestType, testHelper } from '@app/spec/test.helper'
import { INestApplication } from '@nestjs/common'
import { PrismaService } from 'nestjs-prisma'
import { BlockchainModule } from './blockchain.module'
import qs from 'qs'
import { BlockchainType, BlockchainTransactionType } from './entities/blockchain-transaction.entity'
import { CreateBlockchainTransactionDto } from './dtos/create-blockchain-transaction.dto'
import { UpdateBlockchainTransactionDto } from './dtos/update-blockchain-transaction.dto'
import { CreateFormSignatureOnChainDto } from './dtos/create-form-signature.dto'

describe('BlockchainSpec', () => {
  let tc: TestContext
  let app: INestApplication
  let prismaService: PrismaService
  let uc: UserContextTestType

  beforeAll(async () => {
    tc = await testHelper.createContext({
      imports: [BlockchainModule],
    })
    app = tc.app
    prismaService = app.get(PrismaService)
    const { context } = await tc.createOperatorContext({
      role: 'ADMIN',
    })
    uc = context
  })

  afterAll(async () => {
    await prismaService.formSignatureOnChain.deleteMany({})
    await prismaService.administrativeProceduresFormSubmission.deleteMany({})
    await prismaService.blockchainTransaction.deleteMany({})
    await tc?.clean()
  })

  describe('Transaction', () => {
    test('Create:ValidationErrors', async () => {
      const res = await uc.request((r) => r.post('/blockchain/transactions')).send({} as CreateBlockchainTransactionDto)
      expect(res).toBeBad(/txHash should not be empty/)
    })

    test('Create:Success', async () => {
      const createDto: CreateBlockchainTransactionDto = {
        txHash: '0xabcdef1234567890',
        chain: BlockchainType.SOLANA,
        txType: BlockchainTransactionType.FORM_SIGN,
        senderAddress: 'sender-address',
        receiverAddress: 'receiver-address',
      }

      const res = await uc.request((r) => r.post('/blockchain/transactions')).send(createDto)
      expect(res).toBeCreated()
      expect(res.body.txHash).toBe('0xabcdef1234567890')
      expect(res.body.chain).toBe(BlockchainType.SOLANA)
    })

    describe('Fetch', () => {
      let transaction

      beforeAll(async () => {
        const createDto: CreateBlockchainTransactionDto = {
          txHash: '0xtest1234567890',
          chain: BlockchainType.ETHEREUM,
          txType: BlockchainTransactionType.NFT_MINT,
          senderAddress: 'test-sender',
          receiverAddress: 'test-receiver',
        }

        const res = await uc.request((r) => r.post('/blockchain/transactions')).send(createDto)
        transaction = res.body
      })

      test('GetTransaction', async () => {
        const res = await uc.request((r) => r.get(`/blockchain/transactions/${transaction.id}`))
        expect(res).toBeOK()
        expect(res.body.id).toBe(transaction.id)
      })

      test('GetTransactionByHash', async () => {
        const res = await uc.request((r) => r.get(`/blockchain/transactions/hash/${transaction.txHash}`))
        expect(res).toBeOK()
        expect(res.body.txHash).toBe(transaction.txHash)
      })

      test('GetTransactions', async () => {
        const paramDto = {
          where: {
            chain: BlockchainType.ETHEREUM,
          },
          take: 10,
        }

        const param = qs.stringify(paramDto)
        const res = await uc.request((r) => r.get(`/blockchain/transactions?${param}`))
        expect(res).toBeOK()
        expect(res.body.length).toBeGreaterThan(0)
        expect(res.body.find((t) => t.id === transaction.id)).toBeDefined()
      })
    })

    describe('Update', () => {
      let transaction

      beforeAll(async () => {
        const createDto: CreateBlockchainTransactionDto = {
          txHash: '0xupdate1234567890',
          chain: BlockchainType.POLYGON,
          txType: BlockchainTransactionType.REWARD_TRANSFER,
          senderAddress: 'update-sender',
          receiverAddress: 'update-receiver',
        }

        const res = await uc.request((r) => r.post('/blockchain/transactions')).send(createDto)
        transaction = res.body
      })

      test('Update:Success', async () => {
        const updateDto: UpdateBlockchainTransactionDto = {
          receiverAddress: 'new-receiver',
        }

        const res = await uc.request((r) => r.put(`/blockchain/transactions/${transaction.id}`)).send(updateDto)
        expect(res).toBeOK()
        expect(res.body.receiverAddress).toBe('new-receiver')
      })
    })

    describe('Delete', () => {
      let transaction

      beforeAll(async () => {
        const createDto: CreateBlockchainTransactionDto = {
          txHash: '0xdelete1234567890',
          chain: BlockchainType.SOLANA,
          txType: BlockchainTransactionType.FORM_SIGN,
          senderAddress: 'delete-sender',
          receiverAddress: 'delete-receiver',
        }

        const res = await uc.request((r) => r.post('/blockchain/transactions')).send(createDto)
        transaction = res.body
      })

      test('Delete:Success', async () => {
        const res = await uc.request((r) => r.delete(`/blockchain/transactions/${transaction.id}`))
        expect(res).toBeOK()

        const getRes = await uc.request((r) => r.get(`/blockchain/transactions/${transaction.id}`))
        expect(getRes).toBe404()
      })
    })
  })

  describe('FormSignature', () => {
    let transaction
    let formSubmissionId

    beforeAll(async () => {
      try {
        // Tạo form submission thực để tham chiếu
        // 1. Tạo form trước
        const form = await prismaService.administrativeProceduresForm.create({
          data: {
            name: 'Test Form',
            slug: 'test-form-' + Date.now(),
            description: 'Test Form Description',
            type: 'TEST',
            data: {},
            isActive: true,
          },
        })

        // 2. Tạo student context để lấy student id
        const { student } = await tc.createStudentContext()

        // 3. Tạo form submission
        const formSubmission = await prismaService.administrativeProceduresFormSubmission.create({
          data: {
            formId: form.id,
            studentId: student.id, // Sử dụng student ID đúng
            result: { test: 'data' },
            status: 'APPROVED',
          },
        })

        formSubmissionId = formSubmission.id

        // Tạo blockchain transaction
        const createDto: CreateBlockchainTransactionDto = {
          txHash: '0xsignature1234567890',
          chain: BlockchainType.SOLANA,
          txType: BlockchainTransactionType.FORM_SIGN,
          senderAddress: 'signature-sender',
          receiverAddress: 'signature-receiver',
        }

        const res = await uc.request((r) => r.post('/blockchain/transactions')).send(createDto)
        transaction = res.body
      } catch (error) {
        console.error('Error setting up FormSignature test:', error)
        throw error
      }
    })

    test('Create:Success', async () => {
      const createDto: CreateFormSignatureOnChainDto = {
        formHash: 'form-content-hash-123',
        formSubmissionId: formSubmissionId, // Sử dụng form submission ID thực
        transactionId: transaction.id,
      }

      const res = await uc.request((r) => r.post('/blockchain/signatures')).send(createDto)
      expect(res).toBeCreated()
      expect(res.body.formHash).toBe('form-content-hash-123')
      expect(res.body.transactionId).toBe(transaction.id)

      // Test fetching the signature
      const getRes = await uc.request((r) => r.get(`/blockchain/signatures/form/${formSubmissionId}`))
      expect(getRes).toBeOK()
      expect(getRes.body.formSubmissionId).toBe(formSubmissionId)
    })
  })
})
