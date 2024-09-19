import {DataSource} from 'typeorm'
import {Product} from '#/models/Product'
import {Payment} from '#/models/Payment'
import dotenv from 'dotenv'

dotenv.config()

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [Product, Payment],
  synchronize: true,
  logging: false,
})

export const ProductRepository = AppDataSource.getRepository(Product)
export const PaymentRepository = AppDataSource.getRepository(Payment)
