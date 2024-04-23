/**
 * Client Module
 * @description The client module is the entry point for our SDK.
 *              It holds a Promise-based authentication method
 *              ([connect]{@link client#connect}) as well as
 *              allowing for raw use of the resources (without authentication).
 * @module client
 */

import {
  assocPath,
  curry,
  merge,
  map,
  ifElse,
  is,
} from 'ramda'

import strategies from './strategies'
import resources from '../resources'

const bindOptions = options => func => func.bind(null, options)

const bindRecursive = options => ifElse(
  is(Function),
  bindOptions(options),
  resource => map(bindRecursive(options), resource)
)

/**
 * Binds the `options` and `version` received as param
 * to the client's resources.
 *
 * @param {Object} options
 * @param {Object} version
 * @returns A version of resources with its methods' first param binded to `options`
 * and sets the header 'X-PagarMe-Version' to the version passed as param
 */
const withVersion = curry((options, version) => {
  const optionsWithVersion = assocPath(
    ['headers', 'X-PagarMe-Version'],
    version,
    options
  )

  const boundClientWithVersion = map(bindRecursive(optionsWithVersion), resources)
  return boundClientWithVersion
})

/**
 * Binds the `options` received as param
 * to the client's resources.
 * @private
 *
 * @param {Object} options
 * @returns A version of resources with its methods' first param binded to `options`
 */
function bindClientOptions ({ options, authentication }) {
  const boundClient = map(bindRecursive(options), resources)

  return merge(
    boundClient,
    {
      authentication,
      withVersion: withVersion(options),
    }
  )
}

/**
 * Returns a version of client with
 * authentication data binded to the
 * resource requests.
 *
 * @example
 * // API Key Authentication
 * pagarme.client.connect({ api_key: 'ak_test_y7jk294ynbzf93' })
 *
 * // Encryption Key Authentication
 * pagarme.client.connect({ encryption_key: 'ek_test_y7jk294ynbzf93' })
 *
 * // Login Authentication
 * pagarme.client.connect({ email: 'user@email.com', password: '123456' })
 *
 * @param {Object} authentication
 * @returns {Promise} A Promise that resolves to a client with authentication data binded
 */
function connect (authentication) {
  return strategies
    .find(authentication)
    .then(s => s.execute())
    .then(bindClientOptions)
}

const client = merge({ connect }, resources)

export default client
