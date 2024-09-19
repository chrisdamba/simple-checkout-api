import {
  AppDataSource,
  getProductRepository,
  getPaymentRepository,
} from '#/config/dataSource'
import {faker} from '@faker-js/faker'
import {Product} from '#/models/Product'
import {Payment, PaymentStatus} from '#/models/Payment'
import Logger from '#/config/logger'

async function seedDatabase() {
  try {
    await AppDataSource.initialize()
    Logger.info('Database connection initialized')

    const productRepository = getProductRepository()
    const paymentRepository = getPaymentRepository()

    Logger.info('Seeding products...')
    for (let i = 0; i < 50; i++) {
      const product = new Product()
      product.name = faker.commerce.productName()
      product.description = faker.commerce.productDescription()
      product.price = parseFloat(faker.commerce.price())
      product.stockLevel = faker.number.int({min: 0, max: 1000})
      await productRepository.save(product)
    }
    Logger.info('Products seeded successfully')

    Logger.info('Seeding payments...')
    const products = await productRepository.find()
    const paymentMethods = ['credit_card', 'paypal', 'bank_transfer']
    const statuses = Object.values(PaymentStatus)

    for (let i = 0; i < 100; i++) {
      const payment = new Payment()
      payment.amount = parseFloat(faker.commerce.price())
      payment.status = faker.helpers.arrayElement(statuses)
      payment.product = faker.helpers.arrayElement(products)
      payment.paymentMethod = faker.helpers.arrayElement(paymentMethods)
      payment.userId = faker.string.uuid()
      await paymentRepository.save(payment)
    }
    Logger.info('Payments seeded successfully')

    Logger.info('Database seeded successfully')
  } catch (error) {
    Logger.error('Error seeding database:', error)
  } finally {
    await AppDataSource.destroy()
    Logger.info('Database connection closed')
    process.exit(0)
  }
}

seedDatabase()
