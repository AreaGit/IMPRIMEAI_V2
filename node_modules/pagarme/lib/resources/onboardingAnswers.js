/**
 * @name OnboardingAnswers
 * @description This module exposes functions
 *              related to the '/onboarding_answers' path.
 *
 * @module onboardingAnswers
 **/

import routes from '../routes'
import request from '../request'

/**
 * `POST /onboarding_answers`
 * Creates a onboarding answer from the given payload.
 *
 * @param {Object} opts An options params which
 *                      is usually already bound
 *                      by `connect` functions.
 *
 * @param {Object} body The payload for the request.
 *
 * @returns {Promise} Resolves to the result of
 *                    the request or to an error.
 */

const create = (opts, body) =>
  request.post(opts, routes.onboardingAnswers.base, body)

/**
 * `GET /onboarding_answers`
 * Makes a request to /onboarding_answers to get all answers
 *
 * @param {Object} opts An options params which
 *                      is usually already bound
 *                      by `connect` functions.
 *
 * @returns {Promise} Resolves to the result of
 *                    the request or to an error.
 */
const all = (opts, body) =>
  request.get(opts, routes.onboardingAnswers.base, body)

/**
 * `DELETE /onboarding_answers/:id`
 * Deletes an onboarding answer
 *
 * @param {Object} opts An options params which
 *                      is usually already bound
 *                      by `connect` functions.
 *
 * @param {String} [body.id] - The onboarding answer ID.
 *
 * @returns {Promise} Resolves to the result of
 *                    the request or to an error.
 */
const destroy = (opts, body) =>
  request.delete(opts, routes.onboardingAnswers.base, body)

export default {
  all,
  create,
  destroy,
}
