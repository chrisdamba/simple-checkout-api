import {PaymentService} from '../PaymentService'
import {Payment, PaymentMethod, PaymentStatus} from '../../models/Payment'

jest.mock('typeorm', () => ({
  PrimaryGeneratedColumn: () => {},
  Column: () => {},
  Entity: () => {},
  ManyToOne: () => {},
  RelationId: () => {},
}))

jest.mock('#/config/dataSource', () => ({
  getPaymentRepository: jest.fn().mockReturnValue({
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    createQueryBuilder: jest.fn(),
  }),
  getProductRepository: jest.fn().mockReturnValue({
    findOne: jest.fn(),
  }),
}))

describe('PaymentService', () => {
  let paymentService: PaymentService
  let mockPaymentRepository: any
  let mockProductRepository: any

  beforeEach(() => {
    jest.clearAllMocks()
    mockPaymentRepository =
      require('#/config/dataSource').getPaymentRepository()
    mockProductRepository =
      require('#/config/dataSource').getProductRepository()
    paymentService = new PaymentService()
  })

  describe('createPayment', () => {
    it('creates and saves a new payment with status INITIALIZED', async () => {
      const paymentData = {
        amount: 100,
        productId: 1,
        paymentMethod: PaymentMethod.CREDIT_CARD,
        userId: 'user123',
      }
      const product = {id: 1, name: 'Test Product'}

      ;(mockProductRepository.findOne as jest.Mock).mockResolvedValue(product)

      const createdPayment = {
        id: 1,
        amount: paymentData.amount,
        paymentMethod: paymentData.paymentMethod,
        status: PaymentStatus.INITIALIZED,
        userId: paymentData.userId,
        product: product,
      }
      ;(mockPaymentRepository.create as jest.Mock).mockReturnValue(
        createdPayment
      )
      ;(mockPaymentRepository.save as jest.Mock).mockResolvedValue(
        createdPayment
      )

      const result = await paymentService.createPayment(paymentData)

      expect(result).toEqual(createdPayment)
      expect(mockProductRepository.findOne).toHaveBeenCalledWith({
        where: {id: paymentData.productId},
      })
      expect(mockPaymentRepository.create).toHaveBeenCalledWith({
        amount: paymentData.amount,
        paymentMethod: paymentData.paymentMethod,
        status: PaymentStatus.INITIALIZED,
        userId: paymentData.userId,
        productId: product.id,
      })
      expect(mockPaymentRepository.save).toHaveBeenCalledWith(createdPayment)
    })
  })

  describe('updatePaymentStatus', () => {
    it('updates the status of an existing payment', async () => {
      const paymentId = 1
      const currentStatus = PaymentStatus.INITIALIZED
      const newStatus = PaymentStatus.USER_SET
      const existingPayment = {id: paymentId, status: currentStatus}

      const updatedPayment = {...existingPayment, status: newStatus}
      ;(mockPaymentRepository.findOne as jest.Mock).mockResolvedValue(
        existingPayment
      )
      ;(mockPaymentRepository.save as jest.Mock).mockResolvedValue(
        updatedPayment
      )

      const result = await paymentService.updatePaymentStatus(
        paymentId,
        newStatus
      )

      expect(result).toEqual(updatedPayment)
      expect(mockPaymentRepository.findOne).toHaveBeenCalledWith({
        where: {id: paymentId},
      })
      expect(mockPaymentRepository.save).toHaveBeenCalledWith(updatedPayment)
    })

    it('does not allow status update after completion', async () => {
      const paymentId = 1
      const currentStatus = PaymentStatus.COMPLETE
      const attemptedStatus = PaymentStatus.USER_SET // Attempting to regress
      const existingPayment = {id: paymentId, status: currentStatus}

      ;(mockPaymentRepository.findOne as jest.Mock).mockResolvedValue(
        existingPayment
      )

      await expect(
        paymentService.updatePaymentStatus(paymentId, attemptedStatus)
      ).rejects.toThrow(
        `Invalid status transition from ${currentStatus} to ${attemptedStatus}`
      )

      expect(mockPaymentRepository.findOne).toHaveBeenCalledWith({
        where: {id: paymentId},
      })
      expect(mockPaymentRepository.save).not.toHaveBeenCalled()
    })

    it('throws an error if payment is not found', async () => {
      ;(mockPaymentRepository.findOne as jest.Mock).mockResolvedValue(null)

      await expect(
        paymentService.updatePaymentStatus(1, PaymentStatus.COMPLETE)
      ).rejects.toThrow('Payment not found')
    })

    it('throws an error when transitioning to an invalid status', async () => {
      const paymentId = 1
      const currentStatus = PaymentStatus.INITIALIZED
      const invalidStatus = PaymentStatus.PAYMENT_TAKEN // Skipping USER_SET
      const existingPayment = {id: paymentId, status: currentStatus}

      ;(mockPaymentRepository.findOne as jest.Mock).mockResolvedValue(
        existingPayment
      )

      await expect(
        paymentService.updatePaymentStatus(paymentId, invalidStatus)
      ).rejects.toThrow(
        `Invalid status transition from ${currentStatus} to ${invalidStatus}`
      )

      expect(mockPaymentRepository.findOne).toHaveBeenCalledWith({
        where: {id: paymentId},
      })
      expect(mockPaymentRepository.save).not.toHaveBeenCalled()
    })
  })

  describe('getAllPayments', () => {
    it('returns all payments', async () => {
      const payments = [{id: 1}, {id: 2}]
      ;(mockPaymentRepository.find as jest.Mock).mockResolvedValue(payments)

      const result = await paymentService.getAllPayments()

      expect(result).toEqual(payments)
      expect(mockPaymentRepository.find).toHaveBeenCalledWith({
        relations: ['product'],
      })
    })
  })

  describe('getPaymentsByStatus', () => {
    it('returns payments filtered by status', async () => {
      const status = PaymentStatus.COMPLETE
      const payments = [
        {id: 1, status},
        {id: 2, status},
      ]
      ;(mockPaymentRepository.find as jest.Mock).mockResolvedValue(payments)

      const result = await paymentService.getPaymentsByStatus(status)

      expect(result).toEqual(payments)
      expect(mockPaymentRepository.find).toHaveBeenCalledWith({
        where: {status},
        relations: ['product'],
      })
    })
  })

  describe('getTotalCompletedPayments', () => {
    it('returns the total amount of completed payments', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({total: 1000}),
      }
      ;(mockPaymentRepository.createQueryBuilder as jest.Mock).mockReturnValue(
        mockQueryBuilder
      )

      const result = await paymentService.getTotalCompletedPayments()

      expect(result).toEqual(1000)
      expect(mockPaymentRepository.createQueryBuilder).toHaveBeenCalledWith(
        'payment'
      )
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'payment.status = :status',
        {status: PaymentStatus.COMPLETE}
      )
      expect(mockQueryBuilder.select).toHaveBeenCalledWith(
        'SUM(payment.amount)',
        'total'
      )
    })

    it('returns 0 if there are no completed payments', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({total: null}),
      }
      ;(mockPaymentRepository.createQueryBuilder as jest.Mock).mockReturnValue(
        mockQueryBuilder
      )

      const result = await paymentService.getTotalCompletedPayments()

      expect(result).toEqual(0)
    })
  })
})
