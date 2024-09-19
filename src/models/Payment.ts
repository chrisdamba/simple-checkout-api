import {Entity, PrimaryGeneratedColumn, Column, ManyToOne} from 'typeorm'
import {Product} from './Product'

export enum PaymentStatus {
  INITIALIZED = 'initialized',
  USER_SET = 'user_set',
  PAYMENT_TAKEN = 'payment_taken',
  COMPLETE = 'complete',
}

export enum PaymentMethod {
  CREDIT_CARD = 'credit_card',
  PAYPAL = 'paypal',
  BANK_TRANSFER = 'bank_transfer',
}

@Entity()
export class Payment {
  @PrimaryGeneratedColumn()
  id!: number

  @Column('decimal')
  amount!: number

  @Column()
  paymentMethod!: string

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.INITIALIZED,
  })
  status!: PaymentStatus;

  @Column()
  userId!: string // assuming Auth0 user ID

  @ManyToOne(() => Product)
  product!: Product
}
