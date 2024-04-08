import gql from 'graphql-tag'

export const announcementsType = gql`
    type Announcement {
        title: MultiLanguageString!
        description: MultiLanguageString!
        startDateTime: String!
        endDateTime: String!
        priority: Int!
        url: String
    }

    type MultiLanguageString {
        de: String
        en: String
    }
`
