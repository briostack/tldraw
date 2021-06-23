import styled from 'styles'
import { getSession, signin, signout, useSession } from 'next-auth/client'
import { GetServerSideProps } from 'next'
import React from 'react'

export default function Sponsorware(): JSX.Element {
  const [session, loading] = useSession()

  return (
    <Content
      size={{
        '@sm': 'small',
      }}
    >
      <h1>tldraw (is sponsorware)</h1>
      <p>
        Hey, thanks for visiting <a href="https://tldraw.com/">tldraw</a>, a
        tiny little drawing app by{' '}
        <a href="https://twitter.com/steveruizok">steveruizok</a>.
      </p>
      <video autoPlay muted playsInline onClick={(e) => e.currentTarget.play()}>
        <source src="images/hello.mp4" type="video/mp4" />
      </video>
      <p>This project is currently: </p>
      <ul>
        <li>in development</li>
        <li>only available for my sponsors</li>
      </ul>
      <p>
        If you&apos;d like to try it out,{' '}
        <a
          href="https://github.com/sponsors/steveruizok"
          target="_blank"
          rel="noopener noreferrer"
        >
          sponsor me on Github
        </a>{' '}
        (at $1 or more) and sign in below.
      </p>
      <ButtonGroup>
        {session ? (
          <>
            <Button onClick={() => signout()} variant={'secondary'}>
              Sign Out
            </Button>
            <Detail>
              Signed in as {session?.user?.name} ({session?.user?.email}), but
              it looks like you&apos;re not yet a sponsor.
              <br />
              Something wrong? Try <a href="/">reloading the page</a> or DM me
              on <a href="https://twitter.com/steveruizok">Twitter</a>.
            </Detail>
          </>
        ) : (
          <>
            <Button onClick={() => signin('github')} variant={'primary'}>
              {loading ? 'Loading...' : 'Sign in With Github'}
            </Button>
            <Detail>Already a sponsor? Just sign in to visit the app.</Detail>
          </>
        )}
      </ButtonGroup>
    </Content>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context)

  if (session?.user) {
    context.res.setHeader('Location', `/`)
    context.res.statusCode = 307
  }

  return {
    props: {
      session,
    },
  }
}

const Content = styled('div', {
  width: '720px',
  maxWidth: '100%',
  backgroundColor: '$panel',
  margin: '32px auto',
  borderRadius: '0px',
  boxShadow: '0px 2px 24px rgba(0,0,0,.08), 0px 2px 4px rgba(0,0,0,.16)',
  padding: '16px',
  overflow: 'hidden',
  color: '$text',
  fontSize: '$2',
  fontFamily: '$body',
  lineHeight: 1.5,

  '& a': {
    color: '$bounds',
    backgroundColor: '$boundsBg',
    padding: '2px 4px',
    margin: '0 -3px',
    borderRadius: '2px',
  },

  '& p': {
    borderRadius: '8px',
  },

  '& video': {
    maxWidth: '100%',
    border: '1px solid $overlay',
    borderRadius: '4px',
    overflow: 'hidden',
    margin: '16px 0',
  },

  '& iframe': {
    border: 'none',
    backgroundColor: 'none',
    background: 'none',
  },

  variants: {
    size: {
      small: {
        fontSize: '$3',
        padding: '32px',
      },
    },
  },
})

const ButtonGroup = styled('div', {
  display: 'grid',
  gap: '16px',
  margin: '40px 0 32px 0',
})

const Detail = styled('p', {
  fontSize: '$2',
  textAlign: 'center',
})

const Button = styled('button', {
  cursor: 'pointer',
  width: '100%',
  padding: '12px 0',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  font: '$ui',
  fontSize: '$3',
  color: '$panel',
  border: 'none',
  borderRadius: '4px',

  variants: {
    variant: {
      primary: {
        fontWeight: 'bold',
        background: '$bounds',
        color: '$panel',
        boxShadow: '0px 2px 4px rgba(0,0,0,.2)',
      },
      secondary: {
        border: '1px solid $overlay',
        background: 'transparent',
        color: '$muted',
      },
    },
  },
})