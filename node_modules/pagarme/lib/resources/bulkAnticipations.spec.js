import Promise from 'bluebird'
import { merge } from 'ramda'

import runTest from '../../test/runTest'

const findOptions = {
  connect: {
    api_key: 'abc123',
  },
  method: 'GET',
  body: {
    api_key: 'abc123',
  },
}

test('client.bulkAnticipations.find', () => {
  const find = runTest(merge(findOptions, {
    subject: client => client.bulkAnticipations.find({
      recipientId: 're_123',
      id: '1337',
    }),
    url: '/recipients/re_123/bulk_anticipations/1337',
  }))

  const findAll = runTest(merge(findOptions, {
    subject: client => client.bulkAnticipations.find({
      recipientId: 're_123',
    }),
    url: '/recipients/re_123/bulk_anticipations',
  }))

  return Promise.props({
    find,
    findAll,
  })
})

test('client.bulkAnticipations.create', () =>
  runTest({
    connect: {
      api_key: 'abc123',
    },
    subject: client => client.bulkAnticipations.create({
      recipientId: 're_123',
      name: 'Deric',
    }),
    method: 'POST',
    url: '/recipients/re_123/bulk_anticipations',
    body: {
      api_key: 'abc123',
      name: 'Deric',
    },
  })
)

test('client.bulkAnticipations.update', () =>
  runTest({
    connect: {
      api_key: 'abc123',
    },
    subject: client => client.bulkAnticipations.update({
      recipientId: 're_123',
      id: '1337',
      name: 'Deric',
    }),
    method: 'PUT',
    url: '/recipients/re_123/bulk_anticipations/1337',
    body: {
      api_key: 'abc123',
      name: 'Deric',
    },
  })
)

test('client.bulkAnticipations.destroy', () =>
  runTest({
    connect: {
      api_key: 'abc123',
    },
    subject: client => client.bulkAnticipations.destroy({
      recipientId: 're_123',
      id: '1337',
    }),
    method: 'DELETE',
    url: '/recipients/re_123/bulk_anticipations/1337',
    body: {
      api_key: 'abc123',
    },
  })
)

test('client.bulkAnticipations.limits', () =>
  runTest({
    connect: {
      api_key: 'abc123',
    },
    subject: client => client.bulkAnticipations.limits({
      recipientId: 're_123',
    }),
    method: 'GET',
    url: '/recipients/re_123/bulk_anticipations/limits',
    body: {
      api_key: 'abc123',
    },
  })
)

test('client.bulkAnticipations.days', () =>
  runTest({
    connect: {
      api_key: 'abc123',
    },
    subject: client => client.bulkAnticipations.days({
      recipientId: 're_123',
      id: '1337',
    }),
    method: 'GET',
    url: '/recipients/re_123/bulk_anticipations/1337/days',
    body: {
      api_key: 'abc123',
    },
  })
)

test('client.bulkAnticipations.confirm', () =>
  runTest({
    connect: {
      api_key: 'abc123',
    },
    subject: client => client.bulkAnticipations.confirm({
      recipientId: 're_123',
      id: '1337',
    }),
    method: 'POST',
    url: '/recipients/re_123/bulk_anticipations/1337/confirm',
    body: {
      api_key: 'abc123',
    },
  })
)

test('client.bulkAnticipations.cancel', () =>
  runTest({
    connect: {
      api_key: 'abc123',
    },
    subject: client => client.bulkAnticipations.cancel({
      recipientId: 're_123',
      id: '1337',
    }),
    method: 'POST',
    url: '/recipients/re_123/bulk_anticipations/1337/cancel',
    body: {
      api_key: 'abc123',
    },
  })
)

test('client.bulkAnticipations.simulate', () =>
  runTest({
    connect: {
      api_key: 'abc123',
    },
    subject: client => client.bulkAnticipations.simulate({
      recipientId: 're_123',
      requested_amount: '8035',
      payment_date: '1672974000000',
      timeframe: 'start',
    }),
    method: 'GET',
    url: '/recipients/re_123/bulk_anticipations/simulate',
    body: {
      api_key: 'abc123',
      requested_amount: '8035',
      payment_date: '1672974000000',
      timeframe: 'start',
    },
  })
)
