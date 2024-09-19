import express from 'express'
import {auth} from 'express-openid-connect'
import {config} from '#/config/auth0Config'
import Logger from '#/config/logger'

const router = express.Router()

router.use(auth(config))

router.get('/callback', (req, res) => {
  Logger.info('Auth0 callback received')
  res.redirect('/api/user')
})

router.get('/user', (req: any, res) => {
  res.json(req.oidc.user)
})

router.get('/logout', (req, res) => {
  res.oidc.logout()
  res.redirect('/')
})

export {router as authRoutes}
