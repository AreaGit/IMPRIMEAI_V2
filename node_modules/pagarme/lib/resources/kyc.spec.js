import { merge } from 'ramda'
import runTest from '../../test/runTest'

const findOptions = {
  connect: {
    api_key: 'ak_test_dev',
  },
  body: {
    api_key: 'ak_test_dev',
  },
}

test('client.kyc.identityCheck.findOne', () =>
  runTest(merge(findOptions, {
    subject: client => client.kyc.identityCheck.findOne({
      recipientId: 're_1638449629355',
    }),
    url: '/recipients/re_1638449629355/upgrade',
    method: 'GET',
  }))
)

test('client.kyc.identityCheck.create', () =>
  runTest(merge(findOptions, {
    subject: client => client.kyc.identityCheck.create({
      recipientId: 're_1638449629355',
    }),
    url: '/recipients/re_1638449629355/upgrade',
    method: 'POST',
  }))
)

test('client.kyc.identityCheck.update', () =>
  runTest(merge(findOptions, {
    subject: client => client.kyc.identityCheck.update({
      recipientId: 're_1638449629355',
    }),
    url: '/recipients/re_1638449629355/upgrade',
    method: 'PUT',
  }))
)

test('client.kyc.identityCheck.upgrade', () =>
  runTest(merge(findOptions, {
    subject: client => client.kyc.identityCheck.upgrade({
      recipientId: 're_1638449629355',
    }),
    url: '/recipients/re_1638449629355/upgrade/identity',
    method: 'POST',
  }))
)

test('client.kyc.identityCheck.updateSettings', () =>
  runTest(merge(findOptions, {
    subject: client => client.kyc.identityCheck.updateSettings({
      recipientId: 're_1638449629355',
    }),
    url: '/recipients/re_1638449629355/settings',
    method: 'PUT',
  }))
)
