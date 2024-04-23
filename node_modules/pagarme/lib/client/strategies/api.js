/**
 * @name api
 * @memberof strategies
 * @private
 */
import { dissocPath, merge, path } from 'ramda'
import paymentLinks from '../../resources/paymentLinks'

const getErrorMessage = path(['response', 'errors', '0', 'message'])
/**
 * Creates an object with
 * the `api_key` from
 * the supplied `options` param
 *
 * @param {any} options
 * @returns {Object} an object containing
 *                   a body property with
 *                   the desired `api_key
 * @private
 */
function execute (opts) {
  const { api_key: apiKey, options } = opts
  const body = {
    body: {
      api_key: apiKey,
      count: 1,
    },
  }
  if (options && options.baseURL) {
    body.baseURL = options.baseURL
  }
  return paymentLinks.all(body)
    .catch((error) => {
      if (opts.skipAuthentication) { return }
      if (getErrorMessage(error) === 'api_key inválida') {
        throw new Error('You must supply a valid API key')
      }
      if (error.name === 'ApiError') {
        throw error
      }

      // eslint-disable-next-line no-console
      console.warn(`Warning: Could not verify key. Pagar.me may be offline ${error.name}`)
    })
    .then(() => merge(dissocPath(['body', 'count'], body), opts.options))
    .then(requestOpts => ({
      authentication: { api_key: apiKey },
      options: requestOpts,
    }))
}

/**
 * Returns the supplied parameter with
 * the `execute` function added to it.
 *
 * @param {any} options
 * @returns {Object} The `options` parameter
 *                   with `execute` add to it
 * @private
 */
function build (options) {
  return merge(options, { execute: execute.bind(null, options) })
}

export default {
  build,
}
