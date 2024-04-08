import gql from 'graphql-tag'

export const foodType = gql`
    "Meal data"
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

    "Variants of a meal"
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

    "Name of a meal in different languages"
    type Name {
        de: String!
        en: String!
    }

    "Nutritional values for a meal"
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

    "Original language of the meal name"
    enum OriginalLanguage {
        de
        en
    }

    "Prices for different types of customers"
    type Prices {
        student: Float!
        employee: Float!
        guest: Float!
    }

    "Provides a list of meals for a specific day"
    type Food {
        timestamp: String!
        meals: [Meal!]
    }

    "Parent meal for a variant meal"
    type Parent {
        id: ID!
        category: String!
        name: Name!
    }
`
