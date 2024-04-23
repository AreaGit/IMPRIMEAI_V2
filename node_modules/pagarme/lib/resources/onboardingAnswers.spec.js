import runTest from '../../test/runTest'

test('client.onboardingAnswers.create', () =>
  runTest({
    connect: {
      api_key: 'abc123',
    },
    subject: client => client.onboardingAnswers.create({ answer: 'answer' }),
    method: 'POST',
    url: '/onboarding_answers',
    body: {
      api_key: 'abc123',
      answer: 'answer',
    },
  })
)

test('client.onboardingAnswers.all', () =>
  runTest({
    connect: {
      api_key: 'abc123',
    },
    subject: client => client.onboardingAnswers.all(),
    method: 'GET',
    url: '/onboarding_answers',
    body: {
      api_key: 'abc123',
    },
  })
)

test('client.onboardingAnswers.destroy', () =>
  runTest({
    connect: {
      api_key: 'abc123',
    },
    subject: client => client.onboardingAnswers.destroy({
      question_id: 'abc_1',
    }),
    method: 'DELETE',
    url: '/onboarding_answers',
    body: {
      api_key: 'abc123',
      question_id: 'abc_1',
    },
  })
)
