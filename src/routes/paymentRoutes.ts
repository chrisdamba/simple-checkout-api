import {Router} from 'express'
import {PaymentController} from '../controllers/PaymentController'
import {validatePayment} from '#/middleware/validators'

const router = Router()
const paymentController = new PaymentController()

router.post(
  '/',
  validatePayment,
  paymentController.createPayment.bind(paymentController)
)
router.put(
  '/:id/status',
  paymentController.updatePaymentStatus.bind(paymentController)
)
router.get('/', paymentController.getAllPayments.bind(paymentController))
router.get(
  '/status',
  paymentController.getPaymentsByStatus.bind(paymentController)
)
router.get(
  '/total-completed',
  paymentController.getTotalCompletedPayments.bind(paymentController)
)

export {router as paymentRoutes}
