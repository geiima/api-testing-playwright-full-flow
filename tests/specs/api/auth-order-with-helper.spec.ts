import { test, expect } from '@playwright/test'
import {
  fetchJwt,
  createOrder,
  getOrderById,
  deleteOrder,
  getDeletedOrder,
  getAllOrders,
  getTwoLastOrders,
} from '../../helpers/api-helper'
import { StatusDto } from '../../dto/status-dto'
import { OrderDto } from '../../dto/order-dto'

test.describe.configure({ mode: 'serial' })

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
  //console.log(orderId)
  await deleteOrder(request, jwt, orderId)
  await getDeletedOrder(request, jwt, orderId)
})

test('Create two orders and get two last orders from all the list', async ({ request }) => {
  const orderIdFirst = await createOrder(request, jwt)
  const orderIdSecond = await createOrder(request, jwt)
  const allOrders: OrderDto[] = await getTwoLastOrders(request, jwt)
  expect(allOrders.length).toBe(2)

  const receivedIds = [allOrders[0].id, allOrders[1].id]
  expect(receivedIds).toContain(orderIdFirst)
  expect(receivedIds).toContain(orderIdSecond)

  expect.soft(allOrders[0].status).toBe(StatusDto.OPEN)
  expect.soft(allOrders[1].status).toBe(StatusDto.OPEN)

  //console.log(allOrders[0], allOrders[1])
})

test('Student creates order and verifies it in all orders list - the last one', async ({
  request,
}) => {
  const orderId = await createOrder(request, jwt)
  const retrieveOrder = await getOrderById(request, jwt, orderId)
  expect(retrieveOrder.id).toBe(orderId)
  expect(retrieveOrder.status).toBe(StatusDto.OPEN)

  const allOrders = await getAllOrders(request, jwt)

  const lastOrderIndex = allOrders.length - 1
  expect(allOrders[lastOrderIndex].id).toBe(orderId)
})
