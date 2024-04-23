import Promise from 'bluebird'
import { merge } from 'ramda'

import runTest from '../../test/runTest'

test('client.transactions.payables', () => {
  const options = {
    connect: {
      api_key: 'abc123',
    },
    method: 'GET',
    body: {
      api_key: 'abc123',
    },
  }

  const findAll = runTest(merge(options, {
    subject: client => client.payables.all(),
    url: '/payables',
  }))

  const findTransaction = runTest(merge(options, {
    subject: client => client.payables.find({ transactionId: 1234 }),
    url: '/transactions/1234/payables',
  }))

  const findOne = runTest(merge(options, {
    subject: client => client.payables.find({ id: 5432 }),
    url: '/payables/5432',
  }))

  const bodyParams = {
    end_date: '1559669088459',
    start_date: '1559064288461',
    status: ['waiting_funds', 'prepaid'],
    recipient_id: 're_abc',
  }

  const findDays = runTest(merge(
    options,
    {
      body: merge(options.body, bodyParams),
      subject: client => client.payables.days(bodyParams),
      url: '/payables/days',
    }
  ))

  const findPayablesWithFormatAndQueryParams = runTest(merge(options, {
    subject: client => client.payables.find({
      recipient_id: 1234,
      format: 'csv',
      status: ['prepaid', 'waitig_funds'],
      payment_date: [
        '>=1643165999999',
        '<=1643165999999',
      ],
    }),
    url: '/payables.csv',
  }))

  return Promise.props({
    findAll,
    findTransaction,
    findOne,
    findDays,
    findPayablesWithFormatAndQueryParams,
  })
})
