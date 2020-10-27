# Cap 5 - Working with Express.js

# 057 What is Express.js
--> Desenvolver uma aplicação servidor com os módulos nativos do Node.js, requer que boa parte 
do tempo seja alocado na construção da infraestrutura para receber requisições e trata-las 
adequadamente. Este tipo de trabalho comum a todas as aplicações pode ser facilmente atribuída 
a um frameworks web.

--> Express.js é o framework web mais utilizado na plataforma Node.js para este proprosito. Em 
grande parte devido a sua facilidade de extensão com demais módulos.

--> Install: `npm install --save express`

--> A importação retorna um função que cria um contexto para tratamento de requisições:
```javascript
const http = require('http');
const express = require('express');

const app = express();
http.createServer(app).listen(3000);
```
--> O que seria o mesmo para a forma resumida:
```javascript
const express = require('express');

const app = express();
app.listen(3000);
```

# 059 Adding Middleware
--> A extensibilidade do Express.js reside na capacidade de adicionar funções para tratamentos 
de requisição que são isoladas e executadas em sequência. O que pode ser feito com `app.use()`:
```javascript
const app = express();

app.use((req, res, next) => {
    console.log('prev handle');
    next();
});
app.use((req, res, next) => {
    console.log('next handle');
    res.send('<h1>test</h1>');
});
```
* O parâmetro `next`, corresponde a uma função que executa o próximo tratamento registrado.
* Por padrão, `res.send()` assegura que o Content-Type header seja text/html caso o mesmo já 
não tenha sido definido no objeto `res`.

# 062 Handling Different Routes
--> É possível distinguir rotas com a função `app.use()`. Para isso deve ser informado como 
primeiro parâmetro o path ao qual a requisição deve ser decendente ou igual:
```javascript
app.use('/test', (req, res, next) => {
    console.log('handling /test');
});
app.use('/', (req, res, next) => {
    console.log('runs on / only');
    next();
});
```
* Para evitar que um path raiz seja executado, basta não executar `next()` na rota descendente.

# 063 Parsing Incoming Requests
--> O módulo `Body-parser` consiste em um middleware para Express.js que realiza o processo parse 
do corpo de requisições. Em uma requisição POST de formulário, os campos são mapeadores para 
propriedades de um objeto, acessível em `req.body`.

* Install: `npm install --save body-parse`
* A sua utilização se resume a registrar o parse antes do tratamento de rotas:
```javascript
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({extended: false}));

app.use('/send', (req, res) => {
    console.log(req.body);
    res.redirect('/');
});
```

# 064 Limiting Middleware Execution to POST Requests
--> Tratamentos registrados com `app.use()` receptivos a qualquer método HTTP. Para assegurar que 
um tratamento atenda a um método em específico, basta utilizar o nome corresponde:
```javascript
app.post('/send', (req, res) => {
    console.log(req.body);
    res.redirect('/');
});
app.get('/', (req, res) => {
    res.send('<h1>hello!</h1>');
});
//app.put(...);
//app.delete(...);
//app.path(...);
//app.head(...);
```
--> Todavia ao especificar o método, diferentemente de `app.use()`, o tratamento só será executado 
caso o path da requisição seja o mesmo.
* `app.get('/', ...)` não é executado em uma requisição GET /test.

# 065 Using Express Router
--> A função `express.Router()` permite trabalhar com rotas isoladamente em diferentes arquivos.
* Em um arquivo `routes/detail.js`:
```javascript
const router = express.Router();

router.get('/detail', (req, res) => {
    res.send('Detail...');
});

module.exports = router;
```
* No arquivo `app.js`:
```javascript
const detailRoutes = require('./routes/detail');

app.use(detailRoutes);
```
* Por convenção as rotas em um projeto Node são definidas no diretório `routes` do projeto.

# 066 Adding a 404 Error Page
--> O tratamento de 404 pode ser feito adicionando um `app.use` ao final do registro de todas 
as rotas, todavia assegurando que as rotas não chamam `next()`.
```javascript
app.use(shopRoutes);
app.use(otherRoutes);

app.use((req, res, next) => {
    res.status(404).send('<h1>Not Found!</h1>');
});
```
* `res.status()` permite definir o HTTP status code da resposta.

# 067 Filtering Paths
--> É possível especificar um parent path para todas as rotas de um Router. Para isso basta 
especificar o parâmetro path ao registar as rotas com `app.use()`:
```javascript
const detailRoutes = require('./routes/detail');

app.use('/admin', detailRoutes);
```
* Uma rota declarada com `app.get('/detail', ...)` agora só será executada ao acionar o 
path `/admin/detail`.

# 069 Serving HTML Pages
--> É possível enviar o conteúdo de uma página presente em um arquivo com `res.sendFile()`.

--> Levando em consideração que o arquivo corrente reside em um nível abaixo do diretório do 
projeto (`./routes/home.js`), o acesso ao arquivo `./views/home.html` pode ser feito com:
```javascript
const path = require('path');

router.get('/', (req, res, next) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'home.html'));
});
```
* O módulo `path` permite trabalhar com caminhos em diferentes sistemas operacionais.
* A função `path.join()` concatena os diferentes níveis do diretório.
* A constante global `__dirname` corresponde ao diretório no qual o atual arquivo se encontra.
* O uso de `'../'` faz a navegação para o path superior, visto que estamos em um nível abaixo.

# 071 Using a Helper Function for Navigation
--> É possível obter o path da raiz do projeto com o módulo `path`.
* Em um arquivo `./util/path.js`:
```javascript
const path = require('path');

module.exports = path.dirname(require.main.filename);
```
* No arquivo `./routes/home.js`:
```javascript
const path = require('path');
const rootPath = require('../util/path');

router.get('/', (req, res, next) => {
    res.sendFile(path.join(rootPath, 'views', 'home.html'));
});
```

# 073 Serving Files Statically
--> Um diretório pode ter seus arquivos servidos com o utilitário `express.static()`.
* Considerando a existência de um diretório `./public`:
```javascript
app.use(express.static(path.join(__dirname, 'public')));
```
* O path para acesso a um arquivo deve levar em consideração a raiz: GET `/file.css`
* Múltiplos diretórios podem ser servidos duplicando a linha acima. Nesta ocasião o arquivo 
seria procurado em todos os diretórios na sequência em que foram registrados.