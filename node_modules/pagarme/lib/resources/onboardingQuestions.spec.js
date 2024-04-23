import runTest from '../../test/runTest'

test('client.onboardingQuestions.find', () =>
  runTest({
    connect: {
      api_key: 'abc123',
    },
    subject: client => client.onboardingQuestions.find({
      id: 1,
    }),
    method: 'GET',
    url: '/onboarding_questions/1',
    body: {
      api_key: 'abc123',
    },
  })
)
