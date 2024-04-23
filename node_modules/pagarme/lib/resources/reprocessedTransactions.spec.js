import runTest from '../../test/runTest'

test('client.reprocessedTransactions.find', () => {
  const connect = {
    api_key: 'abc123',
  }

  const parameters = {
    transaction_id: '123',
    original_transaction_id: '123',
    starting_at: '2019-09-06',
    ending_at: '2036-09-06',
    count: '42',
    page: '2',
  }

  const subject = client => client.reprocessedTransactions.find(parameters)

  return runTest({
    connect,
    subject,
    method: 'GET',
    url: '/reprocessed_transactions',
    body: parameters,
  })
})
