import {getPaymentRepository} from '#/config/dataSource'
import {Payment, PaymentStatus} from '#/models/Payment'
import {ApiError} from '#/middleware/errorHandler'
import Logger from '#/config/logger'

export class PaymentService {
  private paymentRepository = getPaymentRepository()

  async createPayment(paymentData: Partial<Payment>): Promise<Payment> {
    try {
      Logger.info('Creating new payment', {paymentData})
      const payment = this.paymentRepository.create(paymentData)
      const savedPayment = await this.paymentRepository.save(payment)
      Logger.info('Payment created successfully', {paymentId: savedPayment.id})
      return savedPayment
    } catch (error) {
      Logger.error('Error creating payment:', error)
      throw new ApiError('Failed to create payment', 500)
    }
  }

  async updatePaymentStatus(
    id: number,
    status: PaymentStatus
  ): Promise<Payment> {
    try {
      Logger.info(`Updating payment status`, {paymentId: id, newStatus: status})
      const payment = await this.paymentRepository.findOne({where: {id}})
      if (!payment) {
        Logger.warn(`Payment not found`, {paymentId: id})
        throw new ApiError('Payment not found', 404)
      }
      payment.status = status
      const updatedPayment = await this.paymentRepository.save(payment)
      Logger.info('Payment status updated successfully', {
        paymentId: id,
        newStatus: status,
      })
      return updatedPayment
    } catch (error) {
      if (error instanceof ApiError) throw error
      Logger.error('Error updating payment status:', error)
      throw new ApiError('Failed to update payment status', 500)
    }
  }

  async getAllPayments(): Promise<Payment[]> {
    try {
      Logger.info('Fetching all payments')
      const payments = await this.paymentRepository.find({
        relations: ['product'],
      })
      Logger.info(`Fetched ${payments.length} payments`)
      return payments
    } catch (error) {
      Logger.error('Error fetching all payments:', error)
      throw new ApiError('Failed to fetch payments', 500)
    }
  }

  async getPaymentsByStatus(status: PaymentStatus): Promise<Payment[]> {
    try {
      Logger.info(`Fetching payments by status`, {status})
      const payments = await this.paymentRepository.find({
        where: {status},
        relations: ['product'],
      })
      Logger.info(`Fetched ${payments.length} payments with status ${status}`)
      return payments
    } catch (error) {
      Logger.error('Error fetching payments by status:', error)
      throw new ApiError('Failed to fetch payments by status', 500)
    }
  }

  async getTotalCompletedPayments(): Promise<number> {
    try {
      Logger.info('Calculating total of completed payments')
      const result = await this.paymentRepository
        .createQueryBuilder('payment')
        .where('payment.status = :status', {status: PaymentStatus.COMPLETE})
        .select('SUM(payment.amount)', 'total')
        .getRawOne()
      const total = result.total || 0
      Logger.info(`Total of completed payments calculated`, {total})
      return total
    } catch (error) {
      Logger.error('Error calculating total of completed payments:', error)
      throw new ApiError('Failed to calculate total of completed payments', 500)
    }
  }
}
