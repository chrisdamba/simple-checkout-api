import {Request, Response, NextFunction} from 'express'
import Logger from '#/config/logger'

export class AppError extends Error {
  statusCode: number
  isOperational: boolean

  constructor(message: string, statusCode: number) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = true

    Error.captureStackTrace(this, this.constructor)
  }
}

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof AppError) {
    Logger.error(
      `${err.statusCode} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`
    )
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    })
  }

  Logger.error(
    `500 - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`
  )
  console.error(err)
  res.status(500).json({
    status: 'error',
    message: 'Internal server error',
  })
}

export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const err = new AppError(`Not Found - ${req.originalUrl}`, 404)
  next(err)
}
