import type { DocumentNode } from 'graphql'

import { queryType } from './query'

export const typeDefs: DocumentNode[] = [queryType]
