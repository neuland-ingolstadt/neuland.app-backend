/* eslint-disable */
import type { DocumentTypeDecoration } from '@graphql-typed-document-node/core'

export type Maybe<T> = T | null
export type InputMaybe<T> = Maybe<T>
export type Exact<T extends { [key: string]: unknown }> = {
    [K in keyof T]: T[K]
}
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
    [SubKey in K]?: Maybe<T[SubKey]>
}
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
    [SubKey in K]: Maybe<T[SubKey]>
}
export type MakeEmpty<
    T extends { [key: string]: unknown },
    K extends keyof T,
> = { [_ in K]?: never }
export type Incremental<T> =
    | T
    | {
          [P in keyof T]?: P extends ' $fragmentName' | '__typename'
              ? T[P]
              : never
      }
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
    ID: { input: string; output: string }
    String: { input: string; output: string }
    Boolean: { input: boolean; output: boolean }
    Int: { input: number; output: number }
    Float: { input: number; output: number }
    /** Scalar for BigDecimal */
    BigDecimal: { input: any; output: any }
    /** Scalar for BigInteger */
    BigInteger: { input: any; output: any }
    /** Scalar for Date */
    Date: { input: string; output: string }
}

export type Day = {
    __typename?: 'Day'
    /** ISO-8601 */
    date?: Maybe<Scalars['Date']['output']>
    meals?: Maybe<Array<Maybe<Meal>>>
}

export type Meal = {
    __typename?: 'Meal'
    name_de?: Maybe<Scalars['String']['output']>
    name_en?: Maybe<Scalars['String']['output']>
}

export type Menu = {
    __typename?: 'Menu'
    days?: Maybe<Array<Maybe<Day>>>
}

/** Query root */
export type Query = {
    __typename?: 'Query'
    menu?: Maybe<Menu>
}

export type MenuQueryVariables = Exact<{ [key: string]: never }>

export type MenuQuery = {
    __typename?: 'Query'
    menu?: {
        __typename?: 'Menu'
        days?: Array<{
            __typename?: 'Day'
            date?: string | null
            meals?: Array<{
                __typename?: 'Meal'
                name_de?: string | null
                name_en?: string | null
            } | null> | null
        } | null> | null
    } | null
}

export class TypedDocumentString<TResult, TVariables>
    extends String
    implements DocumentTypeDecoration<TResult, TVariables>
{
    __apiType?: DocumentTypeDecoration<TResult, TVariables>['__apiType']

    constructor(
        private value: string,
        public __meta__?: Record<string, any> | undefined
    ) {
        super(value)
    }

    toString(): string & DocumentTypeDecoration<TResult, TVariables> {
        return this.value
    }
}

export const MenuDocument = new TypedDocumentString(`
    query Menu {
  menu {
    days {
      date
      meals {
        name_de
        name_en
      }
    }
  }
}
    `) as unknown as TypedDocumentString<MenuQuery, MenuQueryVariables>
