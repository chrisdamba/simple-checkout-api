import {Request, Response} from 'express'
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

  beforeEach(() => {
    mockProductService = new ProductService() as jest.Mocked<ProductService>
    productController = new ProductController()
    ;(productController as any).productService = mockProductService

    mockRequest = {}
    mockResponse = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    }
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
        mockResponse as Response
      )

      expect(mockProductService.getAllProducts).toHaveBeenCalled()
      expect(mockResponse.json).toHaveBeenCalledWith(products)
    })

    it('handles errors', async () => {
      const error = new Error('Database error')
      mockProductService.getAllProducts.mockRejectedValue(error)

      await productController.getAllProducts(
        mockRequest as Request,
        mockResponse as Response
      )

      expect(mockResponse.status).toHaveBeenCalledWith(500)
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Internal server error',
      })
    })
  })
})
