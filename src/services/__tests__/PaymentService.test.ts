import {PaymentService} from '../PaymentService'
import {Payment, PaymentStatus} from '../../models/Payment'

jest.mock('typeorm', () => ({
  PrimaryGeneratedColumn: () => {},
  Column: () => {},
  Entity: () => {},
  ManyToOne: () => {},
}))

jest.mock('#/config/dataSource', () => ({
  getPaymentRepository: jest.fn().mockReturnValue({
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    createQueryBuilder: jest.fn(),
  }),
}))

describe('PaymentService', () => {
  let paymentService: PaymentService
  let mockPaymentRepository: any

  beforeEach(() => {
    jest.clearAllMocks()
    mockPaymentRepository =
      require('#/config/dataSource').getPaymentRepository()
    paymentService = new PaymentService()
  })

  describe('createPayment', () => {
    it('creates and saves a new payment', async () => {
      const paymentData: Partial<Payment> = {
        amount: 100,
        status: PaymentStatus.INITIALIZED,
      }
      const createdPayment = {id: 1, ...paymentData}
      ;(mockPaymentRepository.create as jest.Mock).mockReturnValue(
        createdPayment
      )
      ;(mockPaymentRepository.save as jest.Mock).mockResolvedValue(
        createdPayment
      )

      const result = await paymentService.createPayment(paymentData)

      expect(result).toEqual(createdPayment)
      expect(mockPaymentRepository.create).toHaveBeenCalledWith(paymentData)
      expect(mockPaymentRepository.save).toHaveBeenCalledWith(createdPayment)
    })
  })

  describe('updatePaymentStatus', () => {
    it('updates the status of an existing payment', async () => {
      const paymentId = 1
      const newStatus = PaymentStatus.PAYMENT_TAKEN
      const existingPayment = {id: paymentId, status: PaymentStatus.INITIALIZED}
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

    it('throws an error if payment is not found', async () => {
      ;(mockPaymentRepository.findOne as jest.Mock).mockResolvedValue(null)

      await expect(
        paymentService.updatePaymentStatus(1, PaymentStatus.COMPLETE)
      ).rejects.toThrow('Payment not found')
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
