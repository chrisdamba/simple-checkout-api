import {getProductRepository} from '#/config/dataSource'
import Logger from '#/config/logger'
import {getAsync, setAsync} from '#/config/redis'
import {ALL_PRODUCTS} from '#/constants'
import {AppError} from '#/middleware/errorHandler'
import {Product} from '#/models/Product'

export class ProductService {
  private productRepository = getProductRepository()
  async getAllProducts(): Promise<Product[]> {
    try {
      const cachedProducts = await getAsync(ALL_PRODUCTS)
      if (cachedProducts) {
        Logger.info('Returning cached products')
        return JSON.parse(cachedProducts)
      }

      Logger.info('Fetching products from db')
      const products = await this.productRepository.find()
      await setAsync(ALL_PRODUCTS, JSON.stringify(products), 'EX', 3600) // cache for 1 hour
      return products
    } catch (error) {
      Logger.error('Error fetching products:', error)
      throw new AppError('Failed to fetch products', 500)
    }
  }

  async createProduct(productData: Partial<Product>): Promise<Product> {
    try {
      Logger.info('Creating new product')
      const product = this.productRepository.create(productData)
      return await this.productRepository.save(product)
    } catch (error) {
      Logger.error('Error creating product:', error)
      throw new AppError('Failed to create product', 500)
    }
  }
}
