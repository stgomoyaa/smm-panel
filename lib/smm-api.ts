import axios, { AxiosInstance } from 'axios'

export interface SMMApiConfig {
  url: string
  apiKey: string
}

export interface SMMService {
  service: string
  name: string
  type: string
  rate: string
  min: string
  max: string
  category?: string
  refill?: boolean
  cancel?: boolean
}

export interface SMMOrderResponse {
  order?: string
  error?: string
}

export interface SMMStatusResponse {
  charge: string
  start_count: string
  status: string
  remains: string
  currency?: string
}

export class SMMApiClient {
  private client: AxiosInstance
  private apiKey: string

  constructor(config: SMMApiConfig) {
    this.apiKey = config.apiKey
    this.client = axios.create({
      baseURL: config.url,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })
  }

  private buildFormData(data: Record<string, any>): string {
    const params = new URLSearchParams()
    params.append('key', this.apiKey)
    
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value))
      }
    })
    
    return params.toString()
  }

  async getServices(): Promise<SMMService[]> {
    try {
      const formData = this.buildFormData({ action: 'services' })
      const response = await this.client.post('', formData)
      return response.data
    } catch (error) {
      console.error('Error fetching services:', error)
      throw new Error('Failed to fetch services from provider')
    }
  }

  async getBalance(): Promise<{ balance: string; currency: string }> {
    try {
      const formData = this.buildFormData({ action: 'balance' })
      const response = await this.client.post('', formData)
      return response.data
    } catch (error) {
      console.error('Error fetching balance:', error)
      throw new Error('Failed to fetch balance from provider')
    }
  }

  async createOrder(data: {
    service: string
    link: string
    quantity: number
    runs?: number
    interval?: number
    comments?: string[]
  }): Promise<SMMOrderResponse> {
    try {
      const formData = this.buildFormData({
        action: 'add',
        ...data,
      })
      const response = await this.client.post('', formData)
      return response.data
    } catch (error) {
      console.error('Error creating order:', error)
      throw new Error('Failed to create order')
    }
  }

  async getOrderStatus(orderId: string): Promise<SMMStatusResponse> {
    try {
      const formData = this.buildFormData({
        action: 'status',
        order: orderId,
      })
      const response = await this.client.post('', formData)
      return response.data
    } catch (error) {
      console.error('Error fetching order status:', error)
      throw new Error('Failed to fetch order status')
    }
  }

  async getMultipleOrderStatus(orderIds: string[]): Promise<Record<string, SMMStatusResponse>> {
    try {
      const formData = this.buildFormData({
        action: 'status',
        orders: orderIds.join(','),
      })
      const response = await this.client.post('', formData)
      return response.data
    } catch (error) {
      console.error('Error fetching multiple order status:', error)
      throw new Error('Failed to fetch multiple order status')
    }
  }
}
