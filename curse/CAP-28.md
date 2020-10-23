# Cap 28

# 413 What is GraphQL
--> GraphQL é uma solução para uma das problemáticas geradas quando uma REST API cresce sobe a demanda de 
diversos clientes com diferentes interfaces e necessidades. Usualmente quando múltiplos clientes precisam 
de uma visão ou fração diferente do mesmo dado, múltiplos endpoints são gerados ou uma estratégia de 
identificação por parâmetros é utilizada, o que por fim impacta na complexidade de manutenção do código. 

--> Com GraphQL o cliente especifica os dados desejados. Usualmente é disponibilizado um endpoint [`/graphql`] 
que recebe requisições POST contendo uma operação no corpo em um certo formato.
* `query`: a operação pode solicitar uma transformação ou apenas fração dos dados de uma entidade;
* `mutation`: pode solicitar a atualização/inserção de um dado;
* `subscription`: ou pode solicitar a inscrição em um canal websocket.

# 414 Understanding the Setup - Writing our First Query
--> O uso da ferramenta junto ao Express.js pode ser feita com a instalação dos pacotes `graphql` (definição 
dos modelos das consultas e operações) e `express-graphql` (parse das requisições no Express.js).
* Install: `npm install --save graphql express-graphql`

--> As consultas e os respectivos tipos de dados associados são definidos em um schema:
```javascript
const { buildSchema } = require('graphql');

module.exports = buildSchema(`
    type PostType {
        rating: Int!
        title: String!
        content: String!
    }

    type CommentType {
        rating: Int
        content: String!
    }

    type RootQuery {
        post: PostType!
        comment: CommentType!
    }

    schema {
        query: RootQuery
    }
`);
```
* `schema{ query }` define a query raiz com seu conjunto de modelos que a aplicação deseja servir;
* A aplicação precisa definir para cada modelo dentro da consulta raiz [`posts : PostType` e `coments: CommentType`] 
um resolver cujo retorno deve atender ao tipo especificado;
* `type TypeName{ ... }` define um tipo complexo para um elemento;
* `TypeName!` sinaliza que o objeto retornado pelo resolver deve ser obrigatoriamente do tipo de dado especificado. 
Caso o cliente especifique a consulta do elemento, o resolver não pode deixar de retorná-lo, ou retornar null, ou 
retornar um tipo diferente. Caso ocorra, um erro 500 é respondido;
* Quando solicitado um elemento cujo tipo de dado não é obrigatório, e o resolver retorna um tipo diferente, o status 
200 é ainda respondido, todavia em um campo `errors` constará um array descrevendo a ocorrência da incongruência.

--> Para cada elemento da consulta está associado a um resolver:
```javascript
module.exports = {
    post() {
        return {
            rating: 42
            title: 'Hello human!',
            content: 'some post content here'
        };
    }

    comment() {
        return {
            rating: 534,
            content: 'some comment'
        };
    }
}
```

--> A junção do schema com os resolvers é feito definindo um middleware com o pacote `express-graphql`:
```javascript
const { graphqlHTTP } = require('express-graphql');

const graphqlSchema = require('./graphql/schema');
const graphqlResolvers = require('./graphql/resolvers');

const app = express();

app.use('/graphql', graphqlHttp({
    schema: graphqlSchema,
    rootValue: graphqlResolvers
}));
```

--> O cliente poderia consultar apenas campos específicos de um modelo enviando uma requisição `POST /graphql` 
com a payload:
```javascript
{
    "query": "query {  post{ title content}  comment{ content }  }"
}
```
* Ou omitindo a keyword `query`: `"query": "{  post{ title content}  comment{ content }  }"`

# 415 Defining a Mutation Schema
--> Mutations são operações que, ao contrário de queries, produzem alterações na base de dados. É possível 
definir os tipos de parâmetros e retornos no Schema:
```javascript
const { buildSchema } = require('graphql');

module.exports = buildSchema(`
    type User {
        id: Int!
        name: String!
        email: String!
    }

    input UserInput {
        name: String!
        email: String!
        password: String!
    }

    type RootMutation {
        createUser(userInput: UserInput): User
    }

    schema {
        mutation: RootMutation
    }
`);
```
* `schema{ mutation }` define a mutation raiz com seu conjunto de operações que a aplicação deseja oferecer;
* `input UserInput { }` a keyword `input` é utilizada para definir tipos complexos para entradas em específico;
* `createUser(input: UserInput): User` operação recebe como parâmetro o `input` UserInput e retorna o `type` User;
* Alternativamente as propriedades poderiam ser especificadas na própria função:
```javascript
`
    type RootMutation {
        createUser(name: String!, email: String!, password: String!): User
    }
`
```

# 416 Adding a Mutation Resolver - GraphiQL
--> Um resolver de uma mutation recebe como parâmetros uma objeto com os argumentos definidos no schema, e 
o objeto da requisição. Caso não seja assíncrona, a função deve retornar uma Promise.
```javascript
module.exports = {
    createUser: async function({ userInput }, req) {
        const { name, email, password} = userInput;

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            throw new Error('User exists already!');
        }

        return await saveNewUser(name, email, password);
    }
};
```

--> O pacote `graphql` oferece uma interface web para interação e teste do Schema definido. Para habilitá-lo, 
é necessário informar o parâmetro `graphiql: true` no middleware:
```javascript
app.use('/graphql', graphqlHttp({
    schema: graphqlSchema,
    rootValue: graphqlResolvers,
    graphiql: true
}));
```
* Neste caso a interface é disponibilizada ao acessar `GET /graphql` no browser.

# 417 Adding Input Validation
--> Uma vez que há apenas uma rota de entrada, não é possível utilizar o pacote `express-validator` da 
maneira usual. A validação neste caso pode ser tratada no resolver com a ajuda do pacote `validator`.
* Install: `npm install --save validator`
* Uso:
```javascript
const validator = require('validator');

module.exports = {
    createUser: async function({ userInput }, req) {
        const { name, email, password} = userInput;

        if (!validator.isEmail(email))
            throw new Error('Invalid E-mail input!');

        if (validator.isEmpty(name))
            throw new Error('Empty Name input!');

        const existingUser = await User.findOne({ email });

        if (existingUser)
            throw new Error('User exists already!');

        return await saveNewUser(name, email, password);
    }
};
```
* A mensagem de uma exceção lançada no resolver consta no campo `errors` da resposta, que sua vez é produzida 
com o status code 500.

# 418 Handling Errors
--> GraphQL oferece na configuração do middleware a função `customFormatErrorFn` que permite formatar o campo de 
saída `errors` presente na resposta:
```javascript
app.use('/graphql', graphqlHTTP({
    schema: graphqlSchema,
    rootValue: graphqlResolvers,
    graphiql: true,

    customFormatErrorFn(err) {
        if (!err.originalError) {
            return err;
        }

        return {
            message: message || 'An error occurred',
            myCustomErrorData: err.originalError.errorData
        };
    } 
}));
```
* `err.originalError` se refere ao objeto `Error` lançado na execução do resolver. Quando não presente, o error 
foi produzido internamente pelo graphql;
* O retorna da função corresponde ao objeto que representa do erro no array `errors` da resposta.

# 419 Connecting the Frontend to the GraphQL API
--> Por padrão o browser envia uma requisição OPTIONS antes de chamar uma API para verificar se o recurso pode 
ser acessado. A chamada a este método falha ao acessar o path do GraphQL impedindo que o browser faça a solicitação 
seguinte. Uma maneira de evitar este problema é forçar o status 200 em um middleware anterior ao do GraphQL:
```javascript
app.use('/graphql', (req, res, next) => {
    return req.method === 'OPTIONS'
        ? res.sendStatus(200)
        : next();
});

app.use('/graphql', graphqlHTTP({ ... });
```

--> A request de uma mutation poderia ser feita no cliente com:
```javascript
const graphqlQuery = {
    query: `
        mutation {
            createUser(userInput: {email: "${email}", name: "${name}", password: "${password}"}) {
                _id
                email
            }
        }
    `
};
fetch('http://server/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(graphqlQuery)
}).then(resp => resp.json()).then(data => {
    console.log(data['createUser']);
});
```
* `{ _id email }` correspondem a seleção de campos do retorno da função.
* O retorno da request possui o retorno de cada mutation identificada pelo nome da mesma:
```javascript
{
    data: {
        createUser: {
            _id: "545654hgrth45gsg",
            email: "asd@asd.asd"
        }
    }
}
```

# 423 Extracting User Data From the Auth Token
--> A extratégia de validação da autenticação das requisições por middleware precisa ser alterada, uma vez 
que só há uma rota para todas as operações, seja elas autenticadas ou não. O middleware de autenticação 
passa então a somente definir se as requisições estão autenticadas no objeto `req`:
```javascript
app.use((req, res, next) => {
    const authHeader = req.get('Authorization');

    const decodedToken = decodeToken(authHeader);
    
    req.isAuth = decodedToken !== null;

    if (decodedToken !== null) {
        req.userId = decodedToken.userId;
    }

    next();
});

app.use('/graphql', graphqlHTTP({ ... });
```

--> E função de negar a requisição fica a cargo de cada resolver definir com o uso do parâmetro `req`:
```javascript
module.exports = {
    createPost: async function({ postInput }, req) {
        if (!req.isAuth) {
            const error = new Error('Not authenticated!');
            error.code = 401;
            throw error;
        }
        ...
    }
};
```

# 424 Sending the Create Post Query
--> É possível fazer seleções aninhadas em queries GraphQL:
```javascript
const graphqlQuery = {
    query: `
        mutation {
            createPost(postInput: {title: "${title}", content: "${content}") {
                title
                content
                creator {
                    name
                }
                createdAt
            }
        }
    `
};
```
* É feita a seleção somente da propriedade `name` no objeto `creator`.

# 429 Uploading Images
--> O endpoint GraphQL não trata de upload de arquivos. Para isso, um endpoint apropriado pode ser utilizado, 
ficando a cargo do cliente fazer o upload em uma requisição separada do envio de formulário de dados:
```javascript
app.put('/image-post', (req, res, next) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file provided!' });
    }
    return res.status(201).json({ message: 'File stored.', filePath: req.file.filename });
});

app.use('/graphql', graphqlHTTP({ ... });
```

# 436 Using Variables
--> GraphQL possui uma síntaxe para lidar com valores na payload enviada pelo cliente. É definido nomes de 
variáveis na query/mutation e os valores das mesmas são informadas num campo `variables`:
```javascript
const graphqlQuery = {
    query: `
        mutation MyCreatePost($title: String!, $content: String!) {
            createPost(postInput: {title: $title, content: $content) {
                title content creator{ name } createdAt
            }
        }
    `,
    variables: {
        title: 'the title value',
        content: 'the content value'
    }
};
```
* `MyCreatePost` é um nome arbitrário para definir o conjunto de variáveis;
* `$title: String!` o tipo da variável deve ser o mesmo tipo definido no schema do backend, o que incluí 
a obrigatóriedade `!` também.