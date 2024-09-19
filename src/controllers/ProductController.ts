import {Request, Response} from 'express'
import {ProductService} from '#/services/ProductService'

export class ProductController {
  private productService: ProductService

  constructor() {
    this.productService = new ProductService()
  }

  async getAllProducts(req: Request, res: Response): Promise<void> {
    try {
      const products = await this.productService.getAllProducts()
      res.json(products)
    } catch (error) {
      res.status(500).json({error: 'Internal server error'})
    }
  }
}
