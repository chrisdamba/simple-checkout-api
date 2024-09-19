import {Request, Response} from 'express'
import {PaymentController} from '../PaymentController'
import {PaymentService} from '../../services/PaymentService'
import {PaymentStatus} from '../../models/Payment'

jest.mock('typeorm', () => ({
  PrimaryGeneratedColumn: () => {},
  Column: () => {},
  Entity: () => {},
  ManyToOne: () => {},
}))

jest.mock('#/services/PaymentService')

jest.mock('#/config/dataSource', () => ({
  getProductRepository: jest.fn().mockReturnValue({
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  }),
}))

jest.mock('#/config/redis', () => ({
  getAsync: jest.fn(),
  setAsync: jest.fn(),
}))

describe('PaymentController', () => {
  let paymentController: PaymentController
  let mockPaymentService: jest.Mocked<PaymentService>
  let mockRequest: Partial<Request>
  let mockResponse: Partial<Response>

  beforeEach(() => {
    mockPaymentService = new PaymentService() as jest.Mocked<PaymentService>
    paymentController = new PaymentController()
    ;(paymentController as any).paymentService = mockPaymentService

    mockRequest = {
      body: {},
      params: {},
      query: {},
    }
    mockResponse = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    }
  })

  describe('createPayment', () => {
    it('creates a new payment', async () => {
      const paymentData = {amount: 100, status: PaymentStatus.INITIALIZED}
      const createdPayment = {id: 1, ...paymentData}
      mockRequest.body = paymentData
      mockPaymentService.createPayment.mockResolvedValue(createdPayment)

      await paymentController.createPayment(
        mockRequest as Request,
        mockResponse as Response
      )

      expect(mockPaymentService.createPayment).toHaveBeenCalledWith(paymentData)
      expect(mockResponse.status).toHaveBeenCalledWith(201)
      expect(mockResponse.json).toHaveBeenCalledWith(createdPayment)
    })
  })

  describe('updatePaymentStatus', () => {
    it('updates the payment status', async () => {
      const paymentId = '1'
      const newStatus = PaymentStatus.PAYMENT_TAKEN
      const updatedPayment = {id: 1, status: newStatus}
      mockRequest.params = {id: paymentId}
      mockRequest.body = {status: newStatus}
      mockPaymentService.updatePaymentStatus.mockResolvedValue(updatedPayment)

      await paymentController.updatePaymentStatus(
        mockRequest as Request,
        mockResponse as Response
      )

      expect(mockPaymentService.updatePaymentStatus).toHaveBeenCalledWith(
        1,
        newStatus
      )
      expect(mockResponse.json).toHaveBeenCalledWith(updatedPayment)
    })
  })

  describe('getAllPayments', () => {
    it('returns all payments', async () => {
      const payments = [{id: 1}, {id: 2}]
      mockPaymentService.getAllPayments.mockResolvedValue(payments)

      await paymentController.getAllPayments(
        mockRequest as Request,
        mockResponse as Response
      )

      expect(mockPaymentService.getAllPayments).toHaveBeenCalled()
      expect(mockResponse.json).toHaveBeenCalledWith(payments)
    })
  })

  describe('getPaymentsByStatus', () => {
    it('returns payments filtered by status', async () => {
      const status = PaymentStatus.COMPLETE
      const payments = [
        {id: 1, status},
        {id: 2, status},
      ]
      mockRequest.query = {status}
      mockPaymentService.getPaymentsByStatus.mockResolvedValue(payments)

      await paymentController.getPaymentsByStatus(
        mockRequest as Request,
        mockResponse as Response
      )

      expect(mockPaymentService.getPaymentsByStatus).toHaveBeenCalledWith(
        status
      )
      expect(mockResponse.json).toHaveBeenCalledWith(payments)
    })
  })

  describe('getTotalCompletedPayments', () => {
    it('returns the total amount of completed payments', async () => {
      const total = 1000
      mockPaymentService.getTotalCompletedPayments.mockResolvedValue(total)

      await paymentController.getTotalCompletedPayments(
        mockRequest as Request,
        mockResponse as Response
      )

      expect(mockPaymentService.getTotalCompletedPayments).toHaveBeenCalled()
      expect(mockResponse.json).toHaveBeenCalledWith({total})
    })
  })
})
