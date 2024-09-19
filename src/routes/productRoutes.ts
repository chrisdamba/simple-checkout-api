import {Router} from 'express'
import {ProductController} from '#/controllers/ProductController'
import {validateProduct} from '#/middleware/validators'

const router = Router()
const productController = new ProductController()

router.get('/', productController.getAllProducts.bind(productController))
router.post(
  '/',
  validateProduct,
  productController.createProduct.bind(productController)
)

export {router as productRoutes}
