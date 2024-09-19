import {NextFunction, Request, Response} from 'express'
import {PaymentService} from '#/services/PaymentService'
import {PaymentStatus} from '#/models/Payment'

export class PaymentController {
  private paymentService: PaymentService

  constructor() {
    this.paymentService = new PaymentService()
  }

  async createPayment(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const paymentData = req.body
      // optionally, get the user ID from the authenticated user
      const userId = req.oidc?.user?.sub
      if (userId) {
        paymentData.userId = userId
      }
      const payment = await this.paymentService.createPayment(req.body)
      res.status(201).json(payment)
    } catch (error) {
      next(error)
    }
  }

  async updatePaymentStatus(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const {id} = req.params
      const {status} = req.body
      const payment = await this.paymentService.updatePaymentStatus(
        parseInt(id),
        status
      )
      res.json(payment)
    } catch (error) {
      next(error)
    }
  }

  async getAllPayments(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const payments = await this.paymentService.getAllPayments()
      res.json(payments)
    } catch (error) {
      next(error)
    }
  }

  async getPaymentsByStatus(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const {status} = req.query
      const payments = await this.paymentService.getPaymentsByStatus(
        status as PaymentStatus
      )
      res.json(payments)
    } catch (error) {
      next(error)
    }
  }

  async getTotalCompletedPayments(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const total = await this.paymentService.getTotalCompletedPayments()
      res.json({total})
    } catch (error) {
      next(error)
    }
  }
}
