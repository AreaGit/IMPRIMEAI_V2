/**
 * @name CompanySegments
 * @description This module exposes functions
 *              related to the `/company_segments` path.
 *
 * @module CompanySegments
 **/

import routes from '../routes'
import request from '../request'

/**
 * `GET /company_segments`
 * Makes a request to /company_segments
 *
 * @param {Object} opts An options params which
 *                      is usually already bound
 *                      by `connect` functions.
 *
*/

const all = opts => request.get(opts, routes.companySegments)

export default {
  all,
}
