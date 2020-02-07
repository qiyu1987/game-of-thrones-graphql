import { makeExecutableSchema } from 'graphql-tools'
import http from 'request-promise-json'
import { GraphQLScalarType } from 'graphql'

const baseUrl = 'https://www.anapioficeandfire.com/api'

const typeDefs = `
  type Query {
    books: [Book]
    book(url: String, name: String): Book
  }

  type Character {
    url: String!
    name: String!
    gender:String
    culture: String
    born: String
    died: String
    titles: [String]
    aliases: [String]
    father: String
    mother: String
    spouse: [String]
    allegiances: [String]
    books: [String]
    povBooks:[String]
    tvSeries:[String]
    playedBy:[String]
  }

  type Book {
      url: String!
      name: String!
      isbn: String!
      authors: [String]
      numberOfPages: Int
      publiser: String
      country: String
      mediaType: String
      released: Date
      characters: [String]
      characterDetails:[Character]
      povCharacters: [String]
  }
  scalar Date
`

const resolvers = {
	Date: new GraphQLScalarType({
		name: 'Date',
		description: 'ISO-8601 string',
		serialize: value => value.toISOString(),
		parseValue: value => new Date(value),
		parseLiteral: ast => new Date(ast.value)
	}),
	Query: {
		book: async (obj, args, context, info) => {
			if (args.url) {
				return http.get(args.url)
			}
			if (args.name) {
				const books = await http.get(`${baseUrl}/books`)
				return books.find(book => book.name === args.name)
			}
		},
		books: async (obj, args, context, info) => {
			return http.get(`${baseUrl}/books`)
		}
	},
	Book: {
		characterDetails: book => {
			return book.characters.map(url => http.get(url))
		}
	}
}

const schema = makeExecutableSchema({
	typeDefs,
	resolvers
})

export default schema
