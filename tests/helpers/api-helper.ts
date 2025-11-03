import { APIRequestContext, expect } from '@playwright/test'
import { StatusCodes } from 'http-status-codes'
import { LoginDto } from '../dto/login-dto'
import { OrderDto } from '../dto/order-dto'
import { StatusDto } from '../dto/status-dto'

type Order = {
  "status": StatusDto,
  "courierId": number,
  "customerName": string,
  "customerPhone": string,
  "comment": string,
  "id": number
}
const serviceURL = 'https://backend.tallinn-learning.ee/'
const loginPath = 'login/student'
const orderPath = 'orders'

export async function fetchJwt(request: APIRequestContext): Promise<string> {
  const authResponse = await request.post(`${serviceURL}${loginPath}`, {
    data: LoginDto.createLoginWithCorrectData(),
  })
  if (authResponse.status() !== StatusCodes.OK) {
    throw new Error(`Authorization failed. Status: ${authResponse.status()}`)
  }
  return await authResponse.text()
}

export async function createOrder(request: APIRequestContext, jwt: string): Promise<number> {
  const response = await request.post(`${serviceURL}${orderPath}`, {
    data: OrderDto.createOrderWithRandomData(),
    headers: {
      Authorization: `Bearer ${jwt}`,
    },
  })
  expect(response.status()).toBe(StatusCodes.OK)
  const responseBody = await response.json()
  return responseBody.id
}

export async function getOrderById(
  request: APIRequestContext,
  jwt: string,
  id: number,
): Promise<OrderDto> {
  const response = await request.get(`${serviceURL}${orderPath}/${id}`, {
    headers: {
      Authorization: `Bearer ${jwt}`,
    },
  })
  expect(response.status()).toBe(StatusCodes.OK)
  const data = await response.json()
  return new OrderDto(
    data.status,
    data.courierId,
    data.customerName,
    data.customerPhone,
    data.comment,
    data.id,
  )
}

export async function deleteOrder(
  request: APIRequestContext,
  jwt: string,
  orderId: number,
): Promise<void> {
  const response = await request.delete(`${serviceURL}${orderPath}/${orderId}`, {
    headers: {
      Authorization: `Bearer ${jwt}`,
    },
  })
  expect(response.status()).toBe(StatusCodes.OK)
}

export async function getDeletedOrder(
  request: APIRequestContext,
  jwt: string,
  id: number,
): Promise<void> {
  const response = await request.get(`${serviceURL}${orderPath}/${id}`, {
    headers: {
      Authorization: `Bearer ${jwt}`,
    },
  })
  expect(response.status()).toBe(StatusCodes.OK)
  const data = await response.text()
  expect(data).toBe('')
}

export async function getTwoLastOrders(
  request: APIRequestContext,
  jwt: string,
): Promise<OrderDto[]> {
  const response = await request.get(`${serviceURL}${orderPath}`, {
    headers: {
      Authorization: `Bearer ${jwt}`,
    },
  })
  expect(response.status()).toBe(StatusCodes.OK)
  const data: Order[] = await response.json()

  const lastIndex = data.length - 1
  const secondToLastIndex = data.length - 2

  const item1 = data[secondToLastIndex]
  const item2 = data[lastIndex]

  const order1 = new OrderDto(
    item1.status,
    item1.courierId,
    item1.customerName,
    item1.customerPhone,
    item1.comment,
    item1.id,
  )
  const order2 = new OrderDto(
    item2.status,
    item2.courierId,
    item2.customerName,
    item2.customerPhone,
    item2.comment,
    item2.id,
  )
  return [order1, order2]
}

export async function getAllOrders(request: APIRequestContext, jwt: string): Promise<OrderDto[]> {
  const response = await request.get(`${serviceURL}${orderPath}`, {
    headers: {
      Authorization: `Bearer ${jwt}`,
    },
  })
  expect(response.status()).toBe(StatusCodes.OK)
  return await response.json()
}
