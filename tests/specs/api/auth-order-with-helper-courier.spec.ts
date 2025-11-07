import { expect, test } from '@playwright/test'
import {
  assignOrderToCourier,
  createOrder,
  fetchCourierJwt,
  fetchJwt,
  updateOrderStatus,
} from '../../helpers/api-helper'
import { StatusDto } from '../../dto/status-dto'

test('Create order, assign it to courier and change status', async ({ request }) => {
  const courierJwt = await fetchCourierJwt(request)
  const jwt = await fetchJwt(request)

  const orderId = await createOrder(request, jwt)
  expect.soft(orderId).toBeGreaterThan(0)

  const assignedOrder = await assignOrderToCourier(request, courierJwt, orderId)
  expect.soft(assignedOrder.id).toBe(orderId)
  expect.soft(assignedOrder.status).toBe('ACCEPTED')

  const deliveredOrder = await updateOrderStatus(request, courierJwt, orderId, StatusDto.DELIVERED)
  expect.soft(deliveredOrder.id).toBe(orderId)
  expect.soft(deliveredOrder.status).toBe('DELIVERED')
})
