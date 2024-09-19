import {ProductRepository} from '#/config/dataSource'
import {getAsync, setAsync} from '#/config/redis'
import {ALL_PRODUCTS} from '#/constants'
import {Product} from '#/models/Product'

export class ProductService {
  async getAllProducts(): Promise<Product[]> {
    const cachedProducts = await getAsync(ALL_PRODUCTS)
    if (cachedProducts) {
      return JSON.parse(cachedProducts)
    }

    const products = await ProductRepository.find()
    await setAsync(ALL_PRODUCTS, JSON.stringify(products), 'EX', 3600) // cache for 1 hour
    return products
  }

  async createProduct(productData: Partial<Product>): Promise<Product> {
    const product = ProductRepository.create(productData)
    return ProductRepository.save(product)
  }
}
