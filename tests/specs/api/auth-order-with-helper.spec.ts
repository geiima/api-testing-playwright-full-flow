import { test, expect } from '@playwright/test'
import {
  fetchJwt,
  createOrder,
  getOrderById,
  deleteOrder,
  getDeletedOrder,
  getAllOrders,
  getLastNOrders,
  deleteAllOrders,
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
  await deleteOrder(request, jwt, orderId)
})

test('create order and find order by id', async ({ request }) => {
  const orderId = await createOrder(request, jwt)
  expect.soft(orderId).toBeGreaterThan(0)
  const order: OrderDto = await getOrderById(request, jwt, orderId)
  expect.soft(order.id).toBe(orderId)
  expect.soft(order.status).toBe(StatusDto.OPEN)
  await deleteOrder(request, jwt, orderId)
})

test('create order and delete order by id and get deleted order', async ({ request }) => {
  const orderId = await createOrder(request, jwt)
  //console.log(orderId)
  await deleteOrder(request, jwt, orderId)
  await getDeletedOrder(request, jwt, orderId)
})

test('Create several orders and get last N orders', async ({ request }) => {
  await deleteAllOrders(request, jwt)

  const orderIdFirst = await createOrder(request, jwt)
  const orderIdSecond = await createOrder(request, jwt)
  const orderIdThird = await createOrder(request, jwt)

  const lastOrders: OrderDto[] = await getLastNOrders(request, jwt, 3)
  expect(lastOrders.length).toBe(3)

  const receivedIds: number[] = [
    Number(lastOrders[0].id),
    Number(lastOrders[1].id),
    Number(lastOrders[2].id),
  ]
  expect(receivedIds).toContain(orderIdFirst)
  expect(receivedIds).toContain(orderIdSecond)
  expect(receivedIds).toContain(orderIdThird)

  expect.soft(lastOrders[0].status).toBe(StatusDto.OPEN)
  expect.soft(lastOrders[1].status).toBe(StatusDto.OPEN)
  expect.soft(lastOrders[2].status).toBe(StatusDto.OPEN)

  await deleteOrder(request, jwt, orderIdFirst)
  await deleteOrder(request, jwt, orderIdSecond)
  await deleteOrder(request, jwt, orderIdThird)
})

test('Student creates order and verifies it in orders list', async ({ request }) => {
  const orderId = await createOrder(request, jwt)
  const retrieveOrder = await getOrderById(request, jwt, orderId)
  expect(retrieveOrder.id).toBe(orderId)
  expect(retrieveOrder.status).toBe(StatusDto.OPEN)

  const allOrders = await getAllOrders(request, jwt)
  const allReceivedIds: number[] = allOrders.map((order) => Number(order.id))

  expect(allReceivedIds).toContain(orderId)
  await deleteOrder(request, jwt, orderId)
})
