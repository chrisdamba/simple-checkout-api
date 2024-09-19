import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import {productRoutes} from '#/routes/productRoutes'
import {paymentRoutes} from '#/routes/paymentRoutes'
import {checkJwt} from '#/middleware/auth'
import Logger, {morganMiddleware} from '#/config/logger'
import {errorHandler, notFoundHandler} from '#/middleware/errorHandler'

const app = express()

app.use(cors())
app.use(helmet())
app.use(express.json())
app.use(morganMiddleware)

app.use((req, res, next) => {
  Logger.info(`${req.method} ${req.path}`)
  next()
})

app.use('/api/products', checkJwt, productRoutes)
app.use('/api/payments', checkJwt, paymentRoutes)

app.use(notFoundHandler)

app.use(errorHandler)

export default app
