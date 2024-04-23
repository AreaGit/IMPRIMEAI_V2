import runTest from '../../test/runTest'

test('client.versions', () => {
  runTest({
    connect: {
      api_key: 'api_key',
    },
    method: 'GET',
    url: '/versions',
    body: {
      api_key: 'api_key',
    },
    subject: client => client.versions(),
  })
})
