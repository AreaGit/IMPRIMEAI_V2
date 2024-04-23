import runTest from '../../test/runTest'

const segments = {
  connect: {
    api_key: 'abc123',
  },
  method: 'GET',
  body: {
    api_key: 'abc123',
  },
  subject: client => client.companySegments.all(),
  url: '/company_segments',
}

test('client.companySegments.all()', () =>
  runTest(segments)
)
