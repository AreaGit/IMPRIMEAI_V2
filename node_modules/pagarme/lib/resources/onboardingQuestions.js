/**
 * @name OnboardingQuestions
 * @description This module exposes functions
 *              related to the '/onboarding_questions' path.
 *
 * @module onboardingQuestions
 **/

import routes from '../routes'
import request from '../request'

/**
 * `GET /onboarding_questions/:id`
 * Return the onboarding question requested.
 *
 * @param {Object} opts   An options params which
 *                        is usually already bound
 *                        by `connect` functions.
 *
 * @param {Object} body The payload for the request
 * @param {String} body.id The question Id
 *
 * @returns {Promise} Resolves to the result of
 *                    the request or to an error.
 */
const find = (opts, body) =>
  request.get(opts, routes.onboardingQuestions.details(body.id), body)

export default {
  find,
}
