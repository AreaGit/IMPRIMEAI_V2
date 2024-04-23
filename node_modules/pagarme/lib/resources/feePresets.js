/**
 * @name FeePresets
 * @description This module exposes functions
 *              related to the '/fee_presets' path.
 *
 * @module feePresets
 **/

import routes from '../routes'
import request from '../request'

/**
 * `GET /fee_presets/:id`
 * Returns the requested fee preset.
 *
 * @param {Object} opts   An options params which
 *                        is usually already bound
 *                        by `connect` functions.
 *
 * @param {Object} body The payload for the request
 * @param {String} body.id The fee preset ID
 *
 * @returns {Promise} Resolves to the result of
 *                    the request or to an error.
 */
const find = (opts, body) =>
  request.get(opts, routes.feePresets.details(body.id), body)

export default {
  find,
}
