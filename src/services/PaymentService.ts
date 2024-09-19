import {Payment, PaymentStatus} from '#/models/Payment'
import {PaymentRepository} from '#/config/dataSource'

export class PaymentService {
  async createPayment(paymentData: Partial<Payment>): Promise<Payment> {
    const payment = PaymentRepository.create(paymentData)
    return PaymentRepository.save(payment)
  }

  async updatePaymentStatus(
    id: number,
    status: PaymentStatus
  ): Promise<Payment> {
    const payment = await PaymentRepository.findOne({where: {id}})
    if (!payment) {
      throw new Error('Payment not found')
    }
    payment.status = status
    return PaymentRepository.save(payment)
  }

  async getAllPayments(): Promise<Payment[]> {
    return PaymentRepository.find({relations: ['product']})
  }

  async getPaymentsByStatus(status: PaymentStatus): Promise<Payment[]> {
    return PaymentRepository.find({where: {status}, relations: ['product']})
  }

  async getTotalCompletedPayments(): Promise<number> {
    const result = await PaymentRepository.createQueryBuilder('payment')
      .where('payment.status = :status', {status: PaymentStatus.COMPLETE})
      .select('SUM(payment.amount)', 'total')
      .getRawOne()
    return result.total || 0
  }
}
