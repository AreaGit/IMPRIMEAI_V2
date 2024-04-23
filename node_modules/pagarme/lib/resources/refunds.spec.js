import Promise from 'bluebird'
import { merge } from 'ramda'

import runTest from '../../test/runTest'

const findOptions = {
  connect: {
    api_key: 'abc123',
  },
  body: {
    api_key: 'abc123',
  },
}

test('client.refunds.find', () => {
  const find = runTest(merge(findOptions, {
    subject: client => client.refunds.find({ transaction_id: 11 }),
    url: '/refunds',
    method: 'GET',
  }))

  return Promise.props({
    find,
  })
})

test('client.refunds.cancel', () =>
  runTest(merge({
    subject: client => client.refunds.cancel({ id: 1234 }),
    url: '/refunds/1234/cancel',
    method: 'POST',
  }, findOptions))
)

