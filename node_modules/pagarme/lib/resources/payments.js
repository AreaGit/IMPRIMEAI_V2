/**
 * @name Payments
 * @description This module exposes functions
 *              related to the '/payments' path.
 *
 * @module payments
 **/

import routes from '../routes'
import request from '../request'

/**
 * `GET /payments`
 * Makes a request to /payments to get all payments.
 *
 * @param {Object} opts An options params which
 *                      is usually already bound
 *                      by `connect` functions.
 *
 * @param {Number} [body.count] Pagination option for payments list.
 *                              Number of payments in a page
 * @param {Number} [body.page] Pagination option for payments list.
 *                             The page index.
 * @returns {Promise} Resolves to the result of
 *                    the request or to an error.
*/
const all = (opts, body) => request.get(opts, routes.payments.all, body)

/**
   * `POST /payments`
   *
   * Creates a payment.
   *
   * @param {Object} opts An options params which
   *                      is usually already bound
   *                      by `connect` functions.
   * @param {Object} data An object containing
   *                      the data to create the payment
   * @returns {Promise} Resolves to the result of
   *                    the request or to an error.
 */
const create = (opts, body) => request.post(opts, routes.payments.create, body)

/**
 * `GET /payments/:id`
 * Makes a request to /payments/:id to get one payment.
 *
 * @param {Object} opts An options params which
 *                      is usually already bound
 *                      by `connect` functions.
 *
 * @param {String} [body.id] Payment ID.
 * @returns {Promise} Resolves to the result of
 *                    the request or to an error.
*/
const findOne = (opts, body) => request.get(opts, routes.payments.findOne(body.id), body)

/**
   * `POST /payments/:id/receipt`
   *
   * Creates a payment receipt.
   *
   * @param {Object} opts An options params which
   *                      is usually already bound
   *                      by `connect` functions.
   * @param {String} [body.id] PaymentId
   * @returns {Promise} Resolves to the result of
   *                    the request or to an error.
 */
const receipt = (opts, body) => request.post(opts, routes.payments.receipt(body.id), body)

/**
   * `POST /payments/simulate`
   *
   * Creates a payment simulation.
   *
   * @param {Object} opts An options params which
   *                      is usually already bound
   *                      by `connect` functions.
   * @param {Object} data An object containing
   *                      the data to simulate the payment
   * @returns {Promise} Resolves to the result of
   *                    the request or to an error.
 */
const simulate = (opts, body) => request.post(opts, routes.payments.simulate, body)

/**
   * `PUT /payments/:id`
   *
   * Update a payment.
   *
   * @param {Object} opts An options params which
   *                      is usually already bound
   *                      by `connect` functions.
   * @param {string} [body.id] The payment Id.
   * @param {Object} [body] The properties to update in the payment.
   * @returns {Promise} Resolves to the result of
   *                    the request or to an error.
 */
const update = (opts, body) => request.put(opts, routes.payments.update(body.id), body)

export default {
  create,
  findOne,
  simulate,
  all,
  receipt,
  update,
}
