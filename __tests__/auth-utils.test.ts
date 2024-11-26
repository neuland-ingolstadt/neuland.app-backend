import { GraphQLError } from 'graphql'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import {
    adminRole,
    checkAuthorization,
    sportRole,
} from '../src/utils/auth-utils'

describe('auth-utils', () => {
    beforeEach(() => {
        process.env.NODE_ENV = 'test'
        process.env.BYPASS_AUTH_IN_DEV = 'false'
    })

    afterEach(() => {
        delete process.env.NODE_ENV
        delete process.env.BYPASS_AUTH_IN_DEV
    })

    describe('checkAuthorization', () => {
        it('should not throw an error when the user has the required role', () => {
            const contextValue = {
                jwtPayload: { groups: [sportRole, adminRole] },
            }

            expect(() =>
                checkAuthorization(contextValue, sportRole)
            ).not.toThrow()
        })

        it('should throw an error when the user does not have the required role', () => {
            const contextValue = { jwtPayload: { groups: [adminRole] } }

            expect(() => checkAuthorization(contextValue, sportRole)).toThrow(
                GraphQLError
            )
        })

        it('should throw an error when jwtPayload is missing', () => {
            const contextValue = {}

            expect(() => checkAuthorization(contextValue, sportRole)).toThrow(
                GraphQLError
            )
        })

        it('should not throw an error when NODE_ENV is not production and BYPASS_AUTH_IN_DEV is true', () => {
            process.env.NODE_ENV = 'development'
            process.env.BYPASS_AUTH_IN_DEV = 'true'
            const contextValue = { jwtPayload: { groups: [] } }

            expect(() =>
                checkAuthorization(contextValue, sportRole)
            ).not.toThrow()
        })

        it('should throw an error when NODE_ENV is production and BYPASS_AUTH_IN_DEV is true', () => {
            process.env.NODE_ENV = 'production'
            process.env.BYPASS_AUTH_IN_DEV = 'true'
            const contextValue = { jwtPayload: { groups: [] } }

            expect(() => checkAuthorization(contextValue, sportRole)).toThrow(
                GraphQLError
            )
        })
    })
})
