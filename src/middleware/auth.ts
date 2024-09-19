import {auth} from 'express-oauth2-jwt-bearer'
import {Request, Response, NextFunction} from 'express'

export const checkJwt = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}/`,
  tokenSigningAlg: 'RS256',
})

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({error: 'Invalid token'})
  }
  next(err)
}
