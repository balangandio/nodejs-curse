# Cap 25 - Working with REST APIs - The Practical Application

# 365 REST APIs - The Rest Of The Course
--> Observando em pespectiva à aplicação web tradicional, uma aplicação REST API não sofre grandes 
alterações na sua estrutura:
* Recebendo e respondendo a requisições: o parse da entrada e a saída de dados sofre alteração, views 
não são mais utilizadas;
* Rotas e endpoints: mais métodos HTTP são utilizados;
* Sessões e cookies: não mais utilizados;
* Autenticação: estratégia é alterada com o uso de tokens de expiração.

# 370 Adding Server Side Validation
--> A validação de entrada em APIs também pode ser feito com o pacote `express-validator`:
* Install: `npm install --save express-validator`
* Uso:
```javascript
const { validationResult, body } = require('express-validator');

app.post('/post', [
    body('title').trim().isLength({min: 5}),
    body('content').trim().isLength({min: 5})
], (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422)
            .json({ message: 'Invalid input data', errors: errors.array() });
    }
});
```

# 371 Setting Up a Post Model
--> Mongoose possui uma funcionalidade que mantem os timestamps de criação e atualização de registros. 
Para fazer uso da função basta informar no construtor do schema:
```javascript
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const postChema = new Schema({
    title: { type: String },
    content: { type: String }
}, { timestamps: true });
```

# 373 Static Images - Error Handling
--> O tratamento de errors pode também ser feito pelo mecanismo de error handling do Express.js:
```javascript
app.post('/post', (req, res, next) => {
    const { content } = req.body;

    if (!content) {
        const error = new Error('Invalid input data');
        error.statusCode = 422;
        throw error;
    }

    create(content).then(result => {
        res.status(201).json({ message: 'Post created' });
    }).catch(err => {
        err.statusCode = 500;
        next(err);
    });
});

app.use((error, req, res, next) => {
    res.status(error.statusCode || 500).json({
        message: error.message
    });
});
```

# 376 Updating Posts
--> A recepção de arquivos pode também ser feita pelo middleware `multer`:
* Install: `npm install --save multer`
* Use:
```javascript
const multer = require('multer');

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'images-folder-name'),
    filename: (req, file, cb) => cb(null, `file-${file.originalname}`)
});

app.use(multer({ storage: fileStorage }).single('image'));

app.post('/post', (req, res, next) => {
    console.log(`File name: ${req.file.filename}`);
});
```

# 382 How Does Authentication Work
--> A estratégia de autenticação em REST APIs se diferiencia das aplicações web por não utilizar o 
mecanismo de cookies e sessões.
* O usuário é identificado por um token assinado pela aplicação e entregue no momento da autenticação;
* Os dados relacionados a sessão do usuário são mantidos pela aplicação cliente assim como o seu token,
que sempre é enviado em cada requisição e validado pelo servidor.

# 384 Logging In - Creating JSON Web Tokens (JWTs)
--> O pacote `jsonwebtoken` pode ser utilizado para produzir tokens de autenticação.
* Install: `npm install --save jsonwebtoken`

--> Tokens são produzidos com a função `jwt.sign()`:
```javascript
const jwt = require('jsonwebtoken');
const SERVER_JWT_TOKEN_KEY = 'serverPrivateKey+_.*!@42';

app.post('/login', (req, res, next) => {
    const { user, password } = req.body;

    if (!isValid(user, password)) {
        return res.status(401);
    }

    const token = jwt.sign(
        { email: user.email, sameOtherData: 'sameOtherValue' },
        SERVER_JWT_TOKEN_KEY,
        { expiresIn: '1h' }
    );

    return res.status(200).json({ token });
});
```
* `payload`: em um token é possível armazenar uma payload de dados que é acessível publicamente, permitindo 
atribuir algum metadata de identificação por exemplo;
* `server-key`: tokens são assinados por uma chave de posse exclusiva do servidor;
* `expiresIn`: é possível definir o período de expiração dos tokens, que possua vez é incluído na payload no 
mesmo;

--> Não é possível forjar um token, alterar sua payload, sem ter conhecimento da chave privada. Assim, 
assegurando que somente o servidor possui a chave, a payload de um token válido é também integra.

# 385 Using - Validating the Token
--> Tokens são validados com a função `jwt.verify()`. Tipicamente o cliente o envia no header `Authorization`. 
Um middleware de validação pode ser definido como:
```javascript
const jwt = require('jsonwebtoken');

const SERVER_JWT_TOKEN_KEY = 'secret-private-key';

const validationMiddleware = (req, res, next) => {
    const authHeader = req.get('Authorization');
    if (!authHeader) {
        throw new Error('Not authenticated!');
    }

    const token = authHeader.split(' ')[1];
    let decodedToken;
    try {
        decodedToken = jwt.verify(token, SERVER_JWT_TOKEN_KEY);
    } catch(err) {
        throw err;
    }

    if (!decodedToken) {
        throw new Error('Not authenticated!');
    }

    req.userId = decodedToken.userId;
    next();
};

app.post('/create', validationMiddleware, (req, res, next) => {
    console.log('doSamethingAuthenticated');
});
```
* `decodedToken.userId`: o token decodificado possui a payload especificada na geração.

