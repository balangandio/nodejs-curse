# Cap 15 - Adding Authentication

# 250 Encrypting Passwords
--> `bcryptjs` é um pacote que fornece utilitários para criptografia de valores, como passwords.
* Install: `npm install --save bcryptjs`

--> A função `hash()` permite gerar um valor hash de uma string com a adição do tamanho do salt gerado 
randomicamente, ou o próprio salt:
```javascript
const bcrypt = require('bcryptjs');

bcrypt.hash('password123', 12)
    .then(hashedPassword => {
        console.log('random salt password hash: ', hashedPassword);
    });

let appSalt;

bcrypt.genSalt(12)
    .then(salt => {
        appSalt = salt; 

        return bcrypt.hash('123', appSalt);
    }).then(pwd1 => {

        return bcrypt.hash('123', appSalt)
            .then(pwd2 => {
               if (pwd1 === pwd2) {
                   console.log('Same passwords!');
               }
            });
    });
```

--> A função `compare()` permite comparar um valor com uma hash já gerada, para verificar se o valor de 
origem é o mesmo:
```javascript
const bcrypt = require('bcryptjs');

bcrypt.hash('123', 12)
    .then(hashed => {
        return bcrypt.compare('123', hashed);
    }).then(isTheSame => {
        if (isTheSame) {
            console.log('same passwords');
        }
    })
```

# 254 Using Middleware to Protect Routes
--> Rotas podem ser protegidas com um middleware adicionado anteriormente à função de tratamento da rota:
```javascript
const checkIfLoggedIn = (req, res, next) => {
    if (!req.session.isLoggedIn) {
        return res.redirect('/login');
    }
    next();
};
router.get('/add-product', checkIfLoggedIn, adminCtrl.getAddProduct);
router.post('/add-product', checkIfLoggedIn, adminCtrl.postAddProduct);
router.post('/edit-product', checkIfLoggedIn, adminCtrl.postEditProduct);
```

# 255 Understanding CSRF Attacks
--> Em um cenário CSRF (`Cross Site Resquest Forgery`), uma falsa aplicação pode se passar pela verdadeira 
visualmente, todavia, internamente, não possui um servidor próprio, e sim faz uso dos serviços de backend 
da aplicação original. 

--> Uma falsa sessão é então criada com o usuário potencialmente executando ações não desejadas de maneira
inconsciente, como efetuar a exclusão da sua conta.

# 256 Using a CSRF Token
--> Uma das formas de prevenção de ataques CSRF consiste em renderezir formulários sensíveis com tokens que 
somente o serviço de backend da aplicação pode produzir.

--> Tokens CSRF podem ser ferados com o pacote `csurf`.
* Install: `npm install --save csurf`
* Setup:
```javascript
const csrf = require('csurf');

const csrfProtection = csrf();

const app = express();
app.use(session({ ... }));
app.use(csrfProtection);
```
* O middleware precisa ser adicionado após o middleware session.

--> Por padrão csurf bloqueia requisições POST onde o body não contem um campo `_csrf` com token válido. 
Tokens podem ser gerados com a função `req.csrfToken()`:
```javascript
router.get('/edit-product', (req, res, next) => {
    res.render('page', {
        csrfToken: req.csrfToken()
    });
});
```
* Na view, o token pode ser escrito em um input type=hidden:
```html
<form action="/logout" method="post">
    <input type="hidden" name="_csrf" value="<%= csrfToken %>">
    <button type="submit">Confirm</button>
</form>
```

# 257 Adding CSRF Protection
--> Uma maneira de disponibilizar tokens para views, ou qualquer outro dado, de maneira global para todas 
as rotas, consiste em utilizar o objeto `res.locals` antes da execução dos demais middlewares:
```javascript
app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isLoggedIn;
    res.locals.csrfToken = req.csrfToken();
    next();
});

app.use(shopRoutes);
app.use('/admin', adminRoutes);
```

# 259 Providing User Feedback
--> Uma maneira de providenciar dados para requisições subsequentes, é utilizando a própria session do 
usuário. Uma mensagem de erro pode ser armazenada na session, e uma vez o usuário é redirecionado para 
uma outra página, o valor armazenado pode ser recuperado e disponibilizado para exibição na view. O 
valor sendo então removido da session por não ter mais utilidade.

--> Este fluxo pode ser facilmente implementado com a ajuda do pacote `connect-flash`.
* Install: `npm install --save connect-flash`
* Setup:
```javascript
const flash = require('connect-flash');

const app = express();
app.use(flash());
```

--> O uso pode ser feito com a função `req.flash()`:
```javascript
router.post('/login', (req, res, next) => {
    req.flash('msg', 'Invalid credentials');
    res.redirect('/login');
});

router.get('/login', (req, res, next) => {
    res.render('login-page', {
        errorMessage: req.flash('error')
    });
});
```
* Depois que valor é recuperado, ele é então removido da session.
