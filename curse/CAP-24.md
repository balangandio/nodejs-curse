# Cap 24 - Working with REST APIs - The Basics

# 354 What are REST APIs and why do we use Them
--> REST API constitue um modelo de aplicação que expõe dados e serviços em um formato independente 
de interface do usuário.

--> Popularmente JSON é o padrão mais usual na formatação dos dados expostos.

# 356 Understanding Routing - HTTP Methods
--> Uma prática comum em REST APIs é o uso da notação do protocolo HTTP para requerer ações sobre um 
recurso.
* Método GET: obter o estado de um recurso;
* Método POST: criar uma nova instância em um recurso;
* Método PUT: atualizar o estado de um recurso;
* Método DELETE: deletar uma instância;
* Método OPTIONS: verificar se o recurso pode ser solicitado.

# 357 REST APIs - The Core Principles
--> REST APIs seguem alguns princípios inerentes a sua proposta.
* Uniformidade de interface: de maneira a manter uma interoperabilidade com outras aplicações, é 
importante que a interface uma API seja claramente definida e previsível, assim como a estrutura 
e formatação dos dados transferidos.
* Interação sem estado: cada requisição deve ser tratada de maneira isolada de tempo ou contexto. 
O que implica uma mudança na implementação de sessões.

# 358 Creating our REST API Project - Implementing the Route Setup
--> Express.js já oferece uma infrestrutura para implementar aplicações REST API.
* Install: `npm install --save express body-parser`

# 359 Sending Requests - Responses and Working with Postman
--> Uma simples API pode ser configurado com:
```javascript
const express = require('express');
const bodyParser = require('body-parser');


const app = express();

app.use(bodyParser.json());

app.get('/feed/posts', (req, res, next) => {
	res.status(200).json({
        posts: [ { title: 'gertge', content: 'fwgbtwsrgerg' } ]
    });
});

app.post('/feed/post', (req, res, next) => {
	const { title, content } = req.body;

    res.status(201).json({
		message: 'Post created',
		post: { id: new Date().getTime(), title, content }
	});
});

app.listen(8000);
```
* `app.use(bodyParser.json())` configura o middleware que realizará o parse do corpo de requisições 
com Content-Type application/json;
* `res.json()` configura o header Content-Type e anexa um objeto application/json à resposta.

# 360 REST APIs Clients  CORS Errors
--> CORS é mecanismo de proteção implementada pelos browsers para evitar que um recurso seja compartilhado 
entre múltiplos domínios. Quando uma requisição é feita pelo cliente, é verificado se o domínio do 
documento atualmente aberto no navegador é o mesmo da requisição. Caso não seja e a resposta da requisição 
não permita, a execução é bloqueada.

--> O mecanismo pode ser configurado segundo headers na resposta da API:
```javascript
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});
```