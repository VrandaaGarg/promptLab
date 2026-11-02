import { createServerFn } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start/server'
import { getSessionUser } from './middleware'

export const getCurrentUser = createServerFn({ method: 'GET' }).handler(() =>
  getSessionUser(getRequestHeaders()),
)
