import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import {productRoutes} from '#/routes/productRoutes'
import {paymentRoutes} from '#/routes/paymentRoutes'
import {checkJwt} from '#/middleware/auth'
import Logger, {morganMiddleware} from '#/config/logger'
import {errorHandler, notFoundHandler} from '#/middleware/errorHandler'
import {authRoutes} from '#/routes/authRoutes'

const app = express()

app.use(cors())
app.use(helmet())
app.use(express.json())
app.use(morganMiddleware)

app.use((req, res, next) => {
  Logger.info(`${req.method} ${req.path}`)
  next()
})

app.use('/auth', authRoutes)

app.use('/api/products', checkJwt, productRoutes)
app.use('/api/payments', checkJwt, paymentRoutes)

app.get('/', (req, res) => {
  res.send(`
    <h1>Welcome to the Checkout API</h1>
    ${
      req.oidc.isAuthenticated()
        ? `
      <p>Hello, ${req.oidc.user?.name}</p>
      <a href="/logout">Logout</a>
    `
        : `
      <a href="/login">Login</a>
    `
    }
  `)
})

app.use(notFoundHandler)

app.use(errorHandler)

export default app
