import {ProductService} from '../ProductService'
import {Product} from '../../models/Product'
import {getAsync, setAsync} from '../../config/redis'

jest.mock('#/config/dataSource', () => ({
  getProductRepository: jest.fn().mockReturnValue({
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  }),
}));

jest.mock('#/config/redis', () => ({
  getAsync: jest.fn(),
  setAsync: jest.fn(),
}));

describe('ProductService', () => {
  let productService: ProductService
  let mockProductRepository: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockProductRepository = require('#/config/dataSource').getProductRepository();
    productService = new ProductService();
  })

  describe('getAllProducts', () => {
    it('returns cached products if available', async () => {
      const cachedProducts = [{id: 1, name: 'Cached Product'}]
      ;(getAsync as jest.Mock).mockResolvedValue(JSON.stringify(cachedProducts))

      const result = await productService.getAllProducts()

      expect(result).toEqual(cachedProducts)
      expect(getAsync).toHaveBeenCalledWith('all_products')
      expect(mockProductRepository.find).not.toHaveBeenCalled();
    })

    it('fetches products from database and cache them if not cached', async () => {
      const products = [{id: 1, name: 'Database Product'}]
      ;(getAsync as jest.Mock).mockResolvedValue(null)
      ;mockProductRepository.find.mockResolvedValue(products);

      const result = await productService.getAllProducts()

      expect(result).toEqual(products)
      expect(getAsync).toHaveBeenCalledWith('all_products')
      expect(mockProductRepository.find).toHaveBeenCalled()
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
      ;(mockProductRepository.create as jest.Mock).mockReturnValue(createdProduct)
      ;(mockProductRepository.save as jest.Mock).mockResolvedValue(createdProduct)

      const result = await productService.createProduct(productData)

      expect(result).toEqual(createdProduct)
      expect(mockProductRepository.create).toHaveBeenCalledWith(productData)
      expect(mockProductRepository.save).toHaveBeenCalledWith(createdProduct)
    })
  })
})
