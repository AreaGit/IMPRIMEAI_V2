import runTest from '../../test/runTest'

test('client.session.create', () =>
  runTest({
    connect: {
      api_key: 'abc123',
    },
    subject: client => client.session.create('test@email.com', 'strongpasswordtrustme'),
    method: 'POST',
    url: '/sessions',
    body: {
      api_key: 'abc123',
      email: 'test@email.com',
      password: 'strongpasswordtrustme',
    },
  })
)

test('client.session.create.recaptchaToken', () =>
  runTest({
    connect: {
      api_key: 'abc123',
    },
    subject: client => client.session.create('test@email.com', 'strongpasswordtrustme', '03AGdBq24iZayBCpYCURzp3TO2NtAXnRLgUT40MSz0_KO0N-ajnDedxoNr-ZdFIVOHzLhchDpxQ86a36qBL_2cOJ9h2aKtFUMqVArA33wO-FrHoBcikQaTGmHZYAbOs0wf7srKfccKMXKYNO1xnPx8BxS-mNfh2ZdMNIsxzuwKEBZZWptJW9L6FXsJHet2JHFivhZLC9lbH1srk0A07a73NAMrKWwg_6ltTj8U44eLPifurNXCSgbZO_UhIkltgxI-JLm7xo9rMY_FIGT-8-tlc5wzhcHaF231dnX1jlso-KgvcSlMaO-S5mvB-cV00N6sL-0DRlrteQCvfp-qQoPqzPGUsJv4sdKZ5DlNBTpdlA6mdsXDE1U7jqzZ4Fe_9WtCkOtvW1TNkpBqqgb0s4S1b_7ykm6--mQk1A'),
    method: 'POST',
    url: '/sessions',
    body: {
      api_key: 'abc123',
      email: 'test@email.com',
      password: 'strongpasswordtrustme',
      recaptchaToken: '03AGdBq24iZayBCpYCURzp3TO2NtAXnRLgUT40MSz0_KO0N-ajnDedxoNr-ZdFIVOHzLhchDpxQ86a36qBL_2cOJ9h2aKtFUMqVArA33wO-FrHoBcikQaTGmHZYAbOs0wf7srKfccKMXKYNO1xnPx8BxS-mNfh2ZdMNIsxzuwKEBZZWptJW9L6FXsJHet2JHFivhZLC9lbH1srk0A07a73NAMrKWwg_6ltTj8U44eLPifurNXCSgbZO_UhIkltgxI-JLm7xo9rMY_FIGT-8-tlc5wzhcHaF231dnX1jlso-KgvcSlMaO-S5mvB-cV00N6sL-0DRlrteQCvfp-qQoPqzPGUsJv4sdKZ5DlNBTpdlA6mdsXDE1U7jqzZ4Fe_9WtCkOtvW1TNkpBqqgb0s4S1b_7ykm6--mQk1A',
    },
  })
)

test('client.session.verify', () =>
  runTest({
    connect: {
      api_key: 'abc123',
    },
    subject: client => client.session.verify({ id: 1234, password: 'strongpasswordtrustme' }),
    method: 'POST',
    url: '/sessions/1234/verify',
    body: {
      api_key: 'abc123',
      id: 1234,
      password: 'strongpasswordtrustme',
    },
  })
)
test('client.session.destroy', () =>
  runTest({
    connect: {
      api_key: 'abc123',
    },
    subject: client => client.session.destroy(1234),
    method: 'DELETE',
    url: '/sessions/1234',
    body: {
      api_key: 'abc123',
    },
  })
)
