import { test, expect } from '@playwright/test'
import {
  fetchJwt,
  createOrder,
  getOrderById,
  deleteOrder,
  getDeletedOrder,
} from '../../helpers/api-helper'
import { StatusDto } from '../../dto/status-dto'
import { OrderDto } from '../../dto/order-dto'

// defined on test file level for all
let jwt: string

test.beforeAll(async ({ request }) => {
  jwt = await fetchJwt(request)
})

test('login and create order with api-helper', async ({ request }) => {
  const orderId = await createOrder(request, jwt)
  expect.soft(orderId).toBeGreaterThan(0)
})

test('create order and find order by id', async ({ request }) => {
  const orderId = await createOrder(request, jwt)
  expect.soft(orderId).toBeGreaterThan(0)
  const order: OrderDto = await getOrderById(request, jwt, orderId)
  expect.soft(order.id).toBe(orderId)
  expect.soft(order.status).toBe(StatusDto.OPEN)
})

test('create order and delete order by id and get deleted order', async ({ request }) => {
  const orderId = await createOrder(request, jwt)
  console.log(orderId)
  await deleteOrder(request, jwt, orderId)
  await getDeletedOrder(request, jwt, orderId)
})
