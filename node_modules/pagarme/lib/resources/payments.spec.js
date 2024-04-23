
import runTest from '../../test/runTest'

test('client.payments.all', () => {
  runTest({
    connect: {
      api_key: 'abc123',
    },
    subject: client => client.payments.all({
      page: 1,
      count: 10,
    }),
    method: 'GET',
    url: '/payments',
    body: {
      api_key: 'abc123',
      page: '1',
      count: '10',
    },
  })
})

test('client.payments.create', () => {
  runTest({
    connect: {
      api_key: 'abc123',
    },
    subject: client => client.payments.create({
      barcode: '1234',
      amount: 2000,
      description: 'description',
    }),
    method: 'POST',
    url: '/payments',
    body: {
      api_key: 'abc123',
      barcode: '1234',
      amount: 2000,
      description: 'description',
    },
  })
})

test('client.payments.findOne', () => {
  runTest({
    connect: {
      api_key: 'abc123',
    },
    subject: client => client.payments.findOne({ id: 'pay_1234' }),
    method: 'GET',
    url: '/payments/pay_1234',
    body: {
      api_key: 'abc123',
    },
  })
})

test('client.payments.receipt', () => {
  runTest({
    connect: {
      api_key: 'abc123',
    },
    subject: client => client.payments.receipt({ id: 'pay_1234' }),
    method: 'POST',
    url: '/payments/pay_1234/receipt',
    body: {
      api_key: 'abc123',
    },
  })
})

test('client.payments.simulate', () => {
  runTest({
    connect: {
      api_key: 'abc123',
    },
    subject: client => client.payments.simulate({
      barcode: '1234',
    }),
    method: 'POST',
    url: '/payments/simulate',
    body: {
      api_key: 'abc123',
      barcode: '1234',
    },
  })
})

test('client.payments.update', () => {
  runTest({
    connect: {
      api_key: 'abc123',
    },
    subject: client => client.payments.update({ id: 'pay_1234' }),
    method: 'PUT',
    url: '/payments/pay_1234',
    body: {
      api_key: 'abc123',
    },
  })
})
