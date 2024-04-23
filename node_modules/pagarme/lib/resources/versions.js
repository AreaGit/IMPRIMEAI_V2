/**
 * @name Versions
 * @description This module exposes a function
 *              related to the `/versions` route.
 * @module versions
 */

import routes from '../routes'
import request from '../request'

/**
 * `GET /versions`
 * Returns the available versions from API.
 *
 * @return {Promise} Resolves to the available versions
 *                   from API.
 */
const versions = opts => request.get(opts, routes.versions)

export default versions
