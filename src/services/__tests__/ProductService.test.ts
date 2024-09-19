import {ProductService} from '../ProductService'
import {Product} from '../../models/Product'
import {ProductRepository} from '../../config/dataSource'
import {getAsync, setAsync} from '../../config/redis'

jest.mock('../../config/dataSource', () => ({
  ProductRepository: {
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  },
}))

jest.mock('../../config/redis', () => ({
  getAsync: jest.fn(),
  setAsync: jest.fn(),
}))

describe('ProductService', () => {
  let productService: ProductService

  beforeEach(() => {
    productService = new ProductService()
    jest.clearAllMocks()
  })

  describe('getAllProducts', () => {
    it('returns cached products if available', async () => {
      const cachedProducts = [{id: 1, name: 'Cached Product'}]
      ;(getAsync as jest.Mock).mockResolvedValue(JSON.stringify(cachedProducts))

      const result = await productService.getAllProducts()

      expect(result).toEqual(cachedProducts)
      expect(getAsync).toHaveBeenCalledWith('all_products')
      expect(ProductRepository.find).not.toHaveBeenCalled()
    })

    it('fetches products from database and cache them if not cached', async () => {
      const products = [{id: 1, name: 'Database Product'}]
      ;(getAsync as jest.Mock).mockResolvedValue(null)
      ;(ProductRepository.find as jest.Mock).mockResolvedValue(products)

      const result = await productService.getAllProducts()

      expect(result).toEqual(products)
      expect(getAsync).toHaveBeenCalledWith('all_products')
      expect(ProductRepository.find).toHaveBeenCalled()
      expect(setAsync).toHaveBeenCalledWith(
        'all_products',
        JSON.stringify(products),
        'EX',
        3600
      )
    })
  })

  describe('createProduct', () => {
    it('creates and saves a new product', async () => {
      const productData: Partial<Product> = {
        name: 'New Product',
        price: 9.99,
        stockLevel: 100,
      }
      const createdProduct = {id: 1, ...productData}
      ;(ProductRepository.create as jest.Mock).mockReturnValue(createdProduct)
      ;(ProductRepository.save as jest.Mock).mockResolvedValue(createdProduct)

      const result = await productService.createProduct(productData)

      expect(result).toEqual(createdProduct)
      expect(ProductRepository.create).toHaveBeenCalledWith(productData)
      expect(ProductRepository.save).toHaveBeenCalledWith(createdProduct)
    })
  })
})
