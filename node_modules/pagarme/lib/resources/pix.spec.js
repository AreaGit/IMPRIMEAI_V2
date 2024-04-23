import runTest from '../../test/runTest'

test('client.pixKeys.create', () =>
  runTest({
    connect: {
      api_key: 'abc123',
    },
    subject: client =>
      client.pixKeys.create({ recipient_id: 'abc_123' }),
    method: 'POST',
    url: '/pix/keys',
    body: {
      api_key: 'abc123',
      recipient_id: 'abc_123',
    },
  })
)

test('client.pixKeys.all', () =>
  runTest({
    connect: {
      api_key: 'abc123',
    },
    subject: client =>
      client.pixKeys.all(),
    method: 'GET',
    url: '/pix/keys',
    body: {
      api_key: 'abc123',
    },
  })
)

test('client.pixKeys.destroy', () =>
  runTest({
    connect: {
      api_key: 'abc123',
    },
    subject: client =>
      client.pixKeys.destroy('key_123'),
    method: 'DELETE',
    url: '/pix/keys/key_123',
    body: {
      api_key: 'abc123',
    },
  })
)
