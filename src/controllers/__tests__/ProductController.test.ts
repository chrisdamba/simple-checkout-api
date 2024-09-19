import {NextFunction, Request, Response} from 'express'
import {ProductController} from '../ProductController'
import {ProductService} from '../../services/ProductService'

jest.mock('../../services/ProductService')

jest.mock('#/config/dataSource', () => ({
  getProductRepository: jest.fn().mockReturnValue({
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  }),
}))

jest.mock('#/config/redis', () => ({
  getAsync: jest.fn(),
  setAsync: jest.fn(),
}))

describe('ProductController', () => {
  let productController: ProductController
  let mockProductService: jest.Mocked<ProductService>
  let mockRequest: Partial<Request>
  let mockResponse: Partial<Response>
  let mockNext: jest.Mocked<NextFunction>

  beforeEach(() => {
    mockProductService = new ProductService() as jest.Mocked<ProductService>
    productController = new ProductController()
    ;(productController as any).productService = mockProductService

    mockRequest = {}
    mockResponse = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    }
    mockNext = jest.fn()
  })

  describe('getAllProducts', () => {
    it('returns all products', async () => {
      const products = [
        {id: 1, name: 'Product 1'},
        {id: 2, name: 'Product 2'},
      ]
      mockProductService.getAllProducts.mockResolvedValue(products)

      await productController.getAllProducts(
        mockRequest as Request,
        mockResponse as Response,
        mockNext as NextFunction
      )

      expect(mockProductService.getAllProducts).toHaveBeenCalled()
      expect(mockResponse.json).toHaveBeenCalledWith(products)
      expect(mockNext).not.toHaveBeenCalled()
    })

    it('handles errors', async () => {
      const error = new Error('Database error')
      mockProductService.getAllProducts.mockRejectedValue(error)

      await productController.getAllProducts(
        mockRequest as Request,
        mockResponse as Response,
        mockNext as NextFunction
      )

      expect(mockNext).toHaveBeenCalledWith(error)
      expect(mockResponse.status).not.toHaveBeenCalled()
      expect(mockResponse.json).not.toHaveBeenCalled()
    })
  })
})
