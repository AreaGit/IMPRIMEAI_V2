/**
 * @name Kyc
 * @description This module exposes functions
 *              related to the '/kyc' path.
 *
 * @module kyc
 **/

import routes from '../routes'
import request from '../request'

/**
  * `GET /recipient/:recipientId/upgrade`
  *
  * Returns requested identity check.
  *
  * @param {Object} opts An options params which
  *                      is usually already bound
  *                      by `connect` functions.
  * @returns {Promise} Resolves to the result of
  *                    the request or to an error.
*/
const findOne = (opts, body) =>
  request.get(opts, routes.kyc.identityCheck.findOne(body.recipientId))

/**
  * `POST /recipient/:recipientId/upgrade`
  *
  * Creates a identity check based on an recipientId.
  *
  * @param {Object} opts An options params which
  *                      is usually already bound
  *                      by `connect` functions.
  * @param {String} data An object containing
  *                      the form data
  * @returns {Promise} Resolves to the result of
  *                    the request or to an error.
*/
const create = (opts, body) =>
  request.post(opts, routes.kyc.identityCheck.create(body.recipientId), body)

/**
  * `PUT /recipient/:recipientId/upgrade`
  *
  * Updates a identity check based on an recipientId.
  *
  * @param {Object} opts An options params which
  *                      is usually already bound
  *                      by `connect` functions.
  * @param {String} data An object containing
  *                      the form data
  * @returns {Promise} Resolves to the result of
  *                    the request or to an error.
*/
const update = (opts, body) =>
  request.put(opts, routes.kyc.identityCheck.update(body.recipientId), body)

/**
  * `POST /recipient/:recipientId/upgrade/identity`
  *
  * Updates a identity check based on an recipientId.
  *
  * @param {Object} opts An options params which
  *                      is usually already bound
  *                      by `connect` functions.
  * @returns {Promise} Resolves to the result of
  *                    the request or to an error.
*/
const upgrade = (opts, body) =>
  request.post(opts, routes.kyc.identityCheck.upgrade(body.recipientId), body)

  /**
    * `PUT /recipient/:recipientId/settings`
    *
    * Updates an identity check settings based on an recipientId.
    *
    * @param {Object} opts An options params which
    *                      is usually already bound
    *                      by `connect` functions.
    * @param {String} data An object containing
    *                      the form data
    * @returns {Promise} Resolves to the result of
    *                    the request or to an error.
  */
const updateSettings = (opts, body) =>
  request.put(opts, routes.kyc.identityCheck.updateSettings(body.recipientId), body)

export default {
  identityCheck: {
    findOne,
    create,
    update,
    upgrade,
    updateSettings,
  },
}
