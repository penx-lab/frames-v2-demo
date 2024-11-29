import { handleSend } from '@/lib/email/ses-send'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  // Extract the 'to' parameter from the query string
  const url = new URL(req.url)
  // Note: Currently operating in a sandbox environment; only verified emails can be delivered successfully.
  const toAddress = url.searchParams.get('to')

  if (!toAddress) {
    return NextResponse.json(
      { error: 'Email address is required' },
      { status: 400 },
    )
  }

  const result = await handleSend(toAddress)
  return NextResponse.json(result)
}
