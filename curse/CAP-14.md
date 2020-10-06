# Cap 14

# 230 Setting a Cookie
--> Cookies podem ser definidos no objeto `res` com `setHeader('Set-Cookie')`:
```javascript
router.post('/login', (req, res, next) => {
  res.setHeader('Set-Cookie', 'loggedIn=true');
  res.redirect('/');
}));
```
--> A sua recuperação é feita no objeto `req` solicitando `get('Cookie')`:
```javascript
router.get('/', (req, res, next) => {
  const cookies = req.get('Cookie');
  console.log('allCookies: ', cookies);
}));
```

# 232 Configuring Cookies
--> O tempo de circulação de um cookie pode ser especificado junto a ele:
```javascript
// Expires= define o momento no tempo a partir do qual o cookie não é mais enviado.
res.setHeader('Set-Cookie', 'loggedIn=true; Expires=Sun, 15 Jul 2012 00:00:01 GMT');
// Max-Age= tempo de vida em segundos contando a partir do horário do cliente.
res.setHeader('Set-Cookie', 'loggedIn=true; Max-Age=3600');
```
* Não definindo o tempo de circulação, o cookie é expirado assim que o browser é encerrado.

--> É possível definir o domínio ao qual o cookie pertence:
```javascript
res.setHeader('Set-Cookie', 'loggedIn=true; Domain=www.example.com');
```

--> É possível restringir o envio do cookie à páginas servidas em http ou https, somente:
```javascript
// Only http://
res.setHeader('Set-Cookie', 'loggedIn=true; HttpOnly');
// Only https://
res.setHeader('Set-Cookie', 'loggedIn=true; Secure');
```

# 233 What is a Session
--> Sessions são utilizadas para temporariamente armazenar no servidor dados de um usuário em específico. 
A identificação das requisições de usuário que possui uma session no servidor é feita com Cookies. 
Usualmente é armazenada nos cookies, uma chave que permite acesso a session.


# 234 Initializing the Session Middleware
--> O pacote `express-session` fornece funcionalidades para manipulação de sessions no Express.js.
* Install: `npm install --save express-session`

--> Configuração:
```javascript
const session = require('express-session');

app.use(session({ secret: 'my secret', resave: false, saveUninitialized: false }));
```
* `secret`: uma chave que será utilizada para assinar os cookies;
* `resave`: determina se as sessions serão salvas após acada requisição atendida;
* `saveUninitialized:` determina se as sessions serão salvas em requisições que não a manipulam;
* `cookie`: permite definir parâmetros para cookies, como tempos de expiração.

# 235 Using the Session Middleware
--> O middleware express-session fornece o objeto `req.session` nas requisições.
* Assim que uma requisição é recebida, o middleware procura uma session key no header Cookie;
* Quando não presente, uma session é criada e sua chave de acesso é configurada com Set-Cookie;
* Quando presente, a session é recuperada;
* Por padrão são armazenadas em memória.
```javascript
router.post('/login', (req, res, next) => {
  if (req.session.isLoggedIn) {
    console.log('already logged in');
  } else {
    req.session.isLoggedIn = true;
  }
  res.redirect('/');
}));
```

# 236 Using MongoDB to Store Sessions
--> O pacote `express-session` pode ter sua funcionalidade extendida por pacotes que permitem utilizar 
outros meios de armazenado e diferentes bancos de dados.

--> O pacote `connect-mongodb-session` permite armazenar as sessions no MongoDB:
* Install: `npm install --save connect-mongodb-session`

--> Configuação:
```javascript
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);

const app = express();
const mongoStore = new MongoDBStore({
    uri: MONGODB_URI,
    collection: 'sessions'
});

app.use(session({ secret: 'my secret', resave: false, saveUninitialized: false, store: mongoStore }));
```
* A propriedade `collection` permite definir o nome da coleção onde os objetos serão armazenados.

# 238 Deleting a Cookie
--> Uma session pode ser destruída, o que em banco de dados equivaleria a remoção de objeto da coleção:
```javascript
router.post('/logout', (req, res, next) => {
    req.session.destroy(err => {
        res.redirect('/');
    });
}));
```
* Apesar da session ser removida, o usuário continua com o cookie definido no navegador.

# 241 Two Tiny Improvements
--> Quando o objeto session sobre alguma alteração, pode haver um atraso significativo até que o seu estado 
seja persistindo no meio de armazenamento. O que pode provocar erros entre requests, como quando no login é 
feito um redirecionamento e a página seguinte não tem o estado mais recente da session criada.

--> O objeto `req.session` oferece um a função `save()` que permite executar uma ação somente após o estado 
da session ter sido persistido:
```javascript
router.post('/login', (req, res, next) => {
    req.session.isLoggedIn = true;
    req.session.save(err => {
        res.redirect('/home');
    });
});
```