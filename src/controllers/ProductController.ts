import {NextFunction, Request, Response} from 'express'
import {ProductService} from '#/services/ProductService'

export class ProductController {
  private productService: ProductService

  constructor() {
    this.productService = new ProductService()
  }

  async getAllProducts(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const products = await this.productService.getAllProducts()
      res.json(products)
    } catch (error) {
      next(error)
    }
  }

  async createProduct(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const productData = req.body
      const newProduct = await this.productService.createProduct(productData)
      res.status(201).json(newProduct)
    } catch (error) {
      next(error)
    }
  }
}
