import { test } from 'ramda'

// eslint-disable-next-line no-useless-escape
const validate = test(/^([a-zA-Z0-9_\.\-\+])+@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/)

export default validate
