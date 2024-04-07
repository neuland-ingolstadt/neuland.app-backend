import gql from 'graphql-tag'

export const foodType = gql`
    type Meal {
        name: Name
        id: ID!
        category: String!
        prices: Prices!
        allergens: [String]
        flags: [String]
        nutrition: Nutrition
        variants: [Variation!]
        originalLanguage: OriginalLanguage!
        static: Boolean!
        restaurant: String
    }

    type Variation {
        name: Name!
        additional: Boolean!
        prices: Prices!
        id: ID!
        allergens: [String]
        flags: [String]
        nutrition: Nutrition
        originalLanguage: OriginalLanguage!
        static: Boolean!
        restaurant: String
        parent: Parent
        variants: [Variation]
    }

    type Name {
        de: String!
        en: String!
    }

    type Nutrition {
        kj: Float!
        kcal: Float!
        fat: Float!
        fatSaturated: Float!
        carbs: Float!
        sugar: Float!
        fiber: Float!
        protein: Float!
        salt: Float!
    }

    enum OriginalLanguage {
        de
        en
    }

    type Prices {
        student: Float!
        employee: Float!
        guest: Float!
    }

    type Food {
        timestamp: String!
        mensa: [Meal!]!
        reimanns: [Meal!]!
        canisius: [Meal!]!
    }

    type Parent {
        id: ID!
        category: String!
        name: Name!
    }
`
