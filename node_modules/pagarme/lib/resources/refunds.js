/**
 * @name Refunds
 * @description This module exposes functions
 *              related to the `/refunds` path.
 *
 * @module refunds
 **/

import { curry } from 'ramda'

import routes from '../routes'
import request from '../request'

/**
 * `GET /refunds`
 * Makes a request to /refunds
 *
 * @param {Object} opts - An options params which
 *                      is usually already bound
 *                      by `connect` functions.
 *
 * @param {Object} body - The payload for the request.
 * @param {String} [body.transaction_id] - The refunded transaction ID
 * @param {String} [body.local_transaction_id] - The refunded transaction external ID
 * @param {String} [body.metadata] - Metadata used for the refund
 * @param {String} [body.date_created] - Refund creation date
 * @param {String} [body.date_updated] - Refund update date
 */
const find = curry((opts, body) =>
  request.get(opts, routes.refunds.base, body)
)

/**
 * `POST /refunds/:id/cancel`
 * Makes a request to /refunds/:id/cancel
 *
 * @param {Object} opts - An options params which
 *                      is usually already bound
 *                      by `connect` functions.
 *
 * @param {Object} body - The payload for the request.
 * @param {String} [body.id] - The ID of the refund to be canceled
 */
const cancel = curry((opts, body) =>
  request.post(opts, routes.refunds.cancel(body.id))
)

export default {
  cancel,
  find,
}
