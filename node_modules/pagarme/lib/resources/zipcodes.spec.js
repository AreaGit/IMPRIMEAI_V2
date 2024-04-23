import runTest from '../../test/runTest'

const findOneOptions = {
  connect: {
    api_key: 'abc123',
  },
  method: 'GET',
  body: {
    api_key: 'abc123',
  },
  subject: client => client.zipcodes.find({ zipcode: '04551010' }),
  url: '/zipcodes/04551010',
}

test('client.zipcodes.find', () =>
  runTest(findOneOptions)
)
