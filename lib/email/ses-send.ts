import { sesClient } from '@/lib/email/aws-ses-client'
import { SendEmailCommand } from '@aws-sdk/client-ses'

const createSendEmailCommand = (toAddress: string, fromAddress: string) => {
  return new SendEmailCommand({
    Destination: {
      /* required */
      CcAddresses: [
        /* more items */
      ],
      ToAddresses: [
        toAddress,
        /* more To-email addresses */
      ],
    },
    Message: {
      /* required */
      Body: {
        /* required */
        Html: {
          Charset: 'UTF-8',
          Data: 'HTML_FORMAT_BODY',
        },
        Text: {
          Charset: 'UTF-8',
          Data: 'TEXT_FORMAT_BODY',
        },
      },
      Subject: {
        Charset: 'UTF-8',
        Data: 'EMAIL_SUBJECT',
      },
    },
    Source: fromAddress,
    ReplyToAddresses: [
      /* more items */
    ],
  })
}

const handleSend = async (toAddress: string) => {
  const fromAddress = process.env.AWS_SES_FROM_ADDRESS
  if (!fromAddress) {
    throw new Error(
      'Sender email address is not configured in environment variables.',
    )
  }
  const sendEmailCommand = createSendEmailCommand(toAddress, fromAddress)
  try {
    return await sesClient.send(sendEmailCommand)
  } catch (caught) {
    if (caught instanceof Error && caught.name === 'MessageRejected') {
      /** @type { import('@aws-sdk/client-ses').MessageRejected} */
      const messageRejectedError = caught
      return messageRejectedError
    }
    throw caught
  }
}

// snippet-end:[ses.JavaScript.email.sendEmailV3]
export { handleSend }
