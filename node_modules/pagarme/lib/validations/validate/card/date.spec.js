import moment from 'moment'
import date from './date'

describe('date validator', () => {
  const validFormat = 'MM/YY'
  it('should return true when a valid date is given', () => {
    const currentDate = moment()
    const oneMonthFuture = moment().add(1, 'month')
    const futureDateInNumber = Number(moment().endOf('year').format('MMYY'))

    expect(date(currentDate.format(validFormat))).toBe(true)
    expect(date(oneMonthFuture.format(validFormat))).toBe(true)
    expect(date(futureDateInNumber)).toBe(true)
  })

  it('should return false when an invalid date is given', () => {
    const invalidFormat = 'MM/YYYY'
    const oneMonthPast = moment().subtract(1, 'month')
    const oneMonthFuture = moment().add(1, 'month')

    expect(date(oneMonthPast.format(validFormat))).toBe(false)
    expect(date(oneMonthFuture.format(invalidFormat))).toBe(false)
    expect(date('01/ab')).toBe(false)
  })
})
