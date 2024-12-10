import { MongoClientOptions, Db, MongoClient, ClientSession } from 'mongodb'

export class MongoDb {
  private client: MongoClient | null

  constructor() {
    // console.log('new MongoDb connection')
  }

  async getDb(mongoUrl: string, options?: MongoClientOptions): Promise<Db> {
    try {
      const opt = options ? options : {}

      if (!this.client) {
        this.client = new MongoClient(mongoUrl, opt)
        // console.log('no client found ; connecting to new one')
        await this.client.connect()
      }

      return this.client.db()
    } catch (error) {
      console.error('Problem when connect mongoDB: ', error)
      throw error
    }
  }

  async closeDb(): Promise<void> {
    if (this.client) {
      this.client.close()
      this.client = null
    }
  }

  getTransaction(): ClientSession {
    if (!this.client) {
      throw Error('MongoDB need previews connection to get transaction!')
    }
    return this.client.startSession()
  }
}
