import { SESClient } from '@aws-sdk/client-ses'

const REGION = process.env.AWS_SES_REGION
  ? process.env.AWS_SES_REGION
  : 'ap-southeast-2'
const sesClient = new SESClient({
  region: REGION,
})

export { sesClient }
