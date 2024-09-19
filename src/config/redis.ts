import redis from 'redis'
import {promisify} from 'util'

const client = redis.createClient({
  url: `${process.env.REDIS_URL}:${process.env.REDIS_PORT || '6379'}`,
})

export const getAsync = promisify(client.get).bind(client)
export const setAsync = promisify(client.set).bind(client)
