import { Test, TestingModule } from '@nestjs/testing'
import { BlockchainController } from './blockchain.controller'
import { BlockchainService } from '../blockchain.service'
import { CreateBlockchainTransactionDto } from '../dtos/create-blockchain-transaction.dto'
import { UpdateBlockchainTransactionDto } from '../dtos/update-blockchain-transaction.dto'
import { QueryBlockchainTransactionDto } from '../dtos/query-blockchain-transaction.dto'
import { User } from '@prisma/client'
import { BlockchainType, BlockchainTransactionType } from '../entities/blockchain-transaction.entity'
import { CreateFormSignatureOnChainDto } from '../dtos/create-form-signature.dto'

describe('BlockchainController', () => {
  let controller: BlockchainController
  let service: BlockchainService

  const mockBlockchainService = {
    getTransactions: jest.fn(),
    getTransaction: jest.fn(),
    getTransactionByHash: jest.fn(),
    createTransaction: jest.fn(),
    updateTransaction: jest.fn(),
    deleteTransaction: jest.fn(),
    createFormSignature: jest.fn(),
    getFormSignature: jest.fn(),
  }

  const mockUser = {
    id: 'user-123',
    username: 'testuser',
    role: 'ADMIN',
  } as User

  const mockTransaction = {
    id: 'transaction-123',
    txHash: '0xabcdef1234567890',
    chain: BlockchainType.SOLANA,
    txType: BlockchainTransactionType.FORM_SIGN,
    status: 'PENDING',
    senderAddress: 'sender-address',
    receiverAddress: 'receiver-address',
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const mockFormSignature = {
    id: 'signature-123',
    formHash: 'form-hash-123',
    formSubmissionId: 'form-submission-123',
    transactionId: 'transaction-123',
    createdAt: new Date(),
    updatedAt: new Date(),
    transaction: mockTransaction,
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BlockchainController],
      providers: [
        {
          provide: BlockchainService,
          useValue: mockBlockchainService,
        },
      ],
    }).compile()

    controller = module.get<BlockchainController>(BlockchainController)
    service = module.get<BlockchainService>(BlockchainService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  describe('getTransactions', () => {
    it('should return an array of transactions', async () => {
      const query: QueryBlockchainTransactionDto = {}
      mockBlockchainService.getTransactions.mockResolvedValue([mockTransaction])

      const result = await controller.getTransactions(query)

      expect(result).toEqual([mockTransaction])
      expect(mockBlockchainService.getTransactions).toHaveBeenCalledWith(query)
    })
  })

  describe('getTransaction', () => {
    it('should return a transaction by id', async () => {
      mockBlockchainService.getTransaction.mockResolvedValue(mockTransaction)

      const result = await controller.getTransaction('transaction-123')

      expect(result).toEqual(mockTransaction)
      expect(mockBlockchainService.getTransaction).toHaveBeenCalledWith('transaction-123')
    })
  })

  describe('getTransactionByHash', () => {
    it('should return a transaction by hash', async () => {
      mockBlockchainService.getTransactionByHash.mockResolvedValue(mockTransaction)

      const result = await controller.getTransactionByHash('0xabcdef1234567890')

      expect(result).toEqual(mockTransaction)
      expect(mockBlockchainService.getTransactionByHash).toHaveBeenCalledWith('0xabcdef1234567890')
    })
  })

  describe('createTransaction', () => {
    it('should create a transaction', async () => {
      const createDto: CreateBlockchainTransactionDto = {
        txHash: '0xabcdef1234567890',
        chain: BlockchainType.SOLANA,
        txType: BlockchainTransactionType.FORM_SIGN,
        senderAddress: 'sender-address',
        receiverAddress: 'receiver-address',
      }

      mockBlockchainService.createTransaction.mockResolvedValue(mockTransaction)

      const result = await controller.createTransaction(createDto, mockUser)

      expect(result).toEqual(mockTransaction)
      expect(mockBlockchainService.createTransaction).toHaveBeenCalledWith(createDto, mockUser)
    })
  })

  describe('updateTransaction', () => {
    it('should update a transaction', async () => {
      const updateDto: UpdateBlockchainTransactionDto = {
        receiverAddress: 'new-receiver-address',
      }

      const updatedTransaction = { ...mockTransaction, receiverAddress: 'new-receiver-address' }
      mockBlockchainService.updateTransaction.mockResolvedValue(updatedTransaction)

      const result = await controller.updateTransaction('transaction-123', updateDto, mockUser)

      expect(result).toEqual(updatedTransaction)
      expect(mockBlockchainService.updateTransaction).toHaveBeenCalledWith('transaction-123', updateDto, mockUser)
    })
  })

  describe('deleteTransaction', () => {
    it('should delete a transaction', async () => {
      await controller.deleteTransaction('transaction-123', mockUser)

      expect(mockBlockchainService.deleteTransaction).toHaveBeenCalledWith('transaction-123', mockUser)
    })
  })

  describe('createFormSignature', () => {
    it('should create a form signature', async () => {
      const createDto: CreateFormSignatureOnChainDto = {
        formHash: 'form-hash-123',
        formSubmissionId: 'form-submission-123',
        transactionId: 'transaction-123',
      }

      mockBlockchainService.createFormSignature.mockResolvedValue(mockFormSignature)

      const result = await controller.createFormSignature(createDto)

      expect(result).toEqual(mockFormSignature)
      expect(mockBlockchainService.createFormSignature).toHaveBeenCalledWith(createDto)
    })
  })

  describe('getFormSignature', () => {
    it('should return a form signature by formSubmissionId', async () => {
      mockBlockchainService.getFormSignature.mockResolvedValue(mockFormSignature)

      const result = await controller.getFormSignature('form-submission-123')

      expect(result).toEqual(mockFormSignature)
      expect(mockBlockchainService.getFormSignature).toHaveBeenCalledWith('form-submission-123')
    })
  })
})
