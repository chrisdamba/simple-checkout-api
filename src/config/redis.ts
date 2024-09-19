import * as redis from 'redis'
import {promisify} from 'util'

const client = redis.createClient({
  url: `${process.env.REDIS_URL}:${process.env.REDIS_PORT || '6379'}`,
})

client.on('error', (err) => console.error('Redis Client Error', err))
;(async () => {
  await client.connect()
})()

export const getAsync = (key: string) => client.get(key)

export const setAsync = (
  key: string,
  value: string,
  expirationInSeconds?: number
) => {
  if (expirationInSeconds) {
    return client.setEx(key, expirationInSeconds, value)
  } else {
    return client.set(key, value)
  }
}
