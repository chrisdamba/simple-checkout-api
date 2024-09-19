import winston from 'winston'
import {Request, Response} from 'express'
import morgan from 'morgan'

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  verbose: 4,
  debug: 5,
  silly: 6,
}

const level = () => {
  const env = process.env.NODE_ENV || 'development'
  const isDevelopment = env === 'development'
  return isDevelopment ? 'debug' : 'warn'
}

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  verbose: 'cyan',
  debug: 'blue',
  silly: 'gray',
}

winston.addColors(colors)

const format = winston.format.combine(
  winston.format.timestamp({format: 'YYYY-MM-DD HH:mm:ss:ms'}),
  winston.format.colorize({all: true}),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
)

const transports = [
  new winston.transports.Console(),
  new winston.transports.File({
    filename: 'logs/error.log',
    level: 'error',
  }),
  new winston.transports.File({filename: 'logs/all.log'}),
]
const exceptionHandlers = [
  new winston.transports.File({filename: 'logs/exceptions.log'}),
]

const Logger = winston.createLogger({
  level: level(),
  levels,
  format,
  transports,
  exceptionHandlers,
})

export default Logger

export const morganMiddleware = (morgan as any)(
  (tokens: any, req: Request, res: Response) => {
    return [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, 'content-length'),
      '-',
      tokens['response-time'](req, res),
      'ms',
    ].join(' ')
  },
  {
    stream: {
      write: (message: string) => Logger.http(message.trim()),
    },
  }
)
