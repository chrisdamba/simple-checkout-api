import {AppDataSource} from '#/config/dataSource'
import app from '#/app'
import Logger from '#/config/logger'

const PORT = process.env.PORT || 3000

AppDataSource.initialize()
  .then(() => {
    Logger.info('Data Source has been initialized!')
    app.listen(PORT, () => {
      Logger.info(`Server is running on port ${PORT}`)
    })
  })
  .catch((err) => {
    Logger.error('Error during Data Source initialization:', err)
  })

process.on('unhandledRejection', (reason, promise) => {
  Logger.error('Unhandled Rejection at:', promise, 'reason:', reason)
})

process.on('uncaughtException', (error) => {
  Logger.error('Uncaught Exception:', error)
  process.exit(1)
})
