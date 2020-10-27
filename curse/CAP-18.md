# Cap 18 - Understanding Validation

# 286 Setup - Basic Validation
--> `express-validator` é um módulo que permite adicionar procedimentos de validação de entrada dentro 
do Express.js. Internamente ele utiliza o pacote `validator`, que oferece vários validadores de uso geral.
* Install: `npm install --save express-validator`

--> Formulários submetidos em requisições POST pode ter seus campos validados introduzinho o middleware 
`check` na rota:
```javascript
const { check } = require('express-validator/check');

router.post('/signup', check('email').isEmail().withMessage('Wrong e-mail format'), postSignup);
```
* `email` é o nome da entrada no corpo da requisição;
* `isEmail()` habilida a validação de formato de e-mail no campo.
* `withMessage()` define a mensagem disponível no objeto que identificará o erro.
* Pode ser informado um conjunto de validadores em um array:
`[ check('email'), check('other'), check('another'), ... ]`

--> O resultado da validação do middleware `check` é internamente armazenada no objeto `req`, e pode ser
 recuperado com a função `validationResult`:
```javascript
const { validationResult } = require('express-validator/check');

exports.postSignup = (req, res, next) => {
    const errors = validationResult(req);

    for (let e of errors.array()) {
        console.log(`Error on field ${e.name} with value ${e.value} : ${e.msg}`);
    }
};
```

# 288 Built-In - Custom Validators
--> Validadores customizados podem ser definidos no middleware `check` com `custom()`:
```javascript
const { check } = require('express-validator/check');

router.post(
    '/signup',
    check('email')
        .isEmail()
        .withMessage('Wrong e-mail format')
        .custom((value, { req }) => {
            if (value === 'test@example.com') {
                throw new Error('Not allowed e-mail address');
            }
            return true;
        }),
    postSignup
);
```
* O validador deve retornar `true` caso nenhum não haja problemas com a entrada;
* O validador deve lançar um `Error` caso a entrada seja inválida.

# 291 Adding Async Validation
--> Validadores podem executar código assíncrono retornando Promises:
```javascript
const emailValidador = check('email')
    .isEmail().withMessage('Enter a valid e-mail!')
    .custom((email, { req }) => {
        return User.findOne({ email })
            .then(user => {
                if (user) {
                    return Promise.reject('E-mail already been in use!')
                }
            });
    });
```
* Erros são indicados retornados com reject promises.

# 295 Sanitizing Data
--> Procedimentos comuns no tratamento de entradas, como remoção de espaços em vazios, normalização 
de formato de e-mail, etc, também conhecidos como `sanitizing`, são oferencidos dentro do pacote 
express-validator, e podem ser utilizados na definição do middleware:
```javascript
const emailValidador = check('email')
    .isEmail().withMessage('Enter a valid e-mail!')
    .normalizeEmail();

const passwordValidador = check('email')
    .isAlphanumeric().withMessage('Enter a valid e-mail!')
    .trim();
```