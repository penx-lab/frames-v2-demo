import { useCallback, useEffect, useState } from 'react'
import LoadingDots from '@/components/icons/loading-dots'
import { isMobile } from '@/lib/utils'
import { AuthClientError, StatusAPIResponse } from '@farcaster/auth-client'
import { useSignIn, UseSignInArgs } from '@farcaster/auth-kit'
import { toast } from 'sonner'
import { ActionButton } from '../ActionButton/index'
import { ProfileButton } from '../ProfileButton/index'
import { QRCodeDialog } from '../QRCodeDialog/index'
import { debugPanel } from './SignInButton.css'

type SignInButtonProps = UseSignInArgs & {
  onSignOut?: () => void
  debug?: boolean
  hideSignOut?: boolean
}

export function SignInButton({
  debug,
  hideSignOut,
  onSignOut,
  ...signInArgs
}: SignInButtonProps) {
  const { onSuccess, onStatusResponse, onError } = signInArgs
  const [loading, setLoading] = useState(false)

  const onSuccessCallback = useCallback(
    (res: StatusAPIResponse) => {
      setLoading(false)
      onSuccess?.(res)
    },
    [onSuccess],
  )

  const onStatusCallback = useCallback(
    (res: StatusAPIResponse) => {
      onStatusResponse?.(res)
    },
    [onStatusResponse],
  )

  const onErrorCallback = useCallback(
    (error?: AuthClientError) => {
      setLoading(false)
      onError?.(error)
    },
    [onError],
  )

  const onSignOutCallback = useCallback(() => {
    onSignOut?.()
    setLoading(false)
  }, [onSignOut])

  const signInState = useSignIn({
    ...signInArgs,
    onSuccess: onSuccessCallback,
    onStatusResponse: onStatusCallback,
    onError: onErrorCallback,
  })
  const {
    signIn,
    signOut,
    connect,
    reconnect,
    isSuccess,
    isError,
    error,
    channelToken,
    url,
    data,
    validSignature,
  } = signInState

  const handleSignOut = useCallback(() => {
    setShowDialog(false)
    signOut()
    onSignOutCallback()
  }, [signOut, onSignOutCallback])

  const [showDialog, setShowDialog] = useState(false)

  const onClick = useCallback(() => {
    if (isError) {
      setLoading(false)
      reconnect()
    }
    setShowDialog(true)
    signIn()
    if (url && isMobile()) {
      setLoading(true)
      setTimeout(() => {
        if (loading) {
          toast.error('Error connecting to farcaster. Please try again.')
        }
        setLoading(false)
      }, 1000 * 30)
      window.open(url, '_blank')
    }
  }, [isError, reconnect, signIn, url, loading])

  const authenticated = isSuccess && validSignature

  useEffect(() => {
    if (!channelToken) {
      connect()
    }
  }, [channelToken, connect])

  return (
    <div className="fc-authkit-signin-button">
      {authenticated ? (
        <ProfileButton
          userData={data}
          signOut={handleSignOut}
          hideSignOut={!!hideSignOut}
        />
      ) : (
        <>
          <ActionButton
            initializing={!url}
            onClick={onClick}
            // label={'Sign in'}
            label={
              loading ? (
                <>
                  <span>Farcaster login</span>
                  <LoadingDots></LoadingDots>
                </>
              ) : (
                'Farcaster login'
              )
            }
            loading={loading}
          />
          {url && (
            <QRCodeDialog
              open={showDialog && !isMobile()}
              onClose={() => setShowDialog(false)}
              url={url}
              isError={isError}
              error={error}
            />
          )}
        </>
      )}
      {debug && (
        <div className={debugPanel}>
          <pre>{JSON.stringify(signInState, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}
