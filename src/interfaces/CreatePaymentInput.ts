import {PaymentMethod, PaymentStatus} from '#/models/Payment'

export interface CreatePaymentInput {
  amount: number
  paymentMethod: PaymentMethod
  productId: number
  userId?: string
  status?: PaymentStatus
}
