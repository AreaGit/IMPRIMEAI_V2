import runTest from '../../test/runTest'

test('client.feePresets.find', () =>
  runTest({
    connect: {
      api_key: 'abc123',
    },
    subject: client => client.feePresets.find({
      id: 1,
    }),
    method: 'GET',
    url: '/fee_presets/1',
    body: {
      api_key: 'abc123',
    },
  })
)
