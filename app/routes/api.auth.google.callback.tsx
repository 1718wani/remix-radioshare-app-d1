// app/routes/auth/google/callback.tsx

import { LoaderFunctionArgs } from '@remix-run/cloudflare'
import { authenticator } from '~/features/Auth/services/auth.server'


export const  loader = ({ request,context }: LoaderFunctionArgs) => {
  return authenticator.authenticate('google', request, {
    successRedirect: '/highlights/all',
    failureRedirect: '/signin',
    context:context
  })
}