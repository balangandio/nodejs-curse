# Cap 19 - Error Handling

# 306 Using the Express.js Error Handling Middleware
--> Express.js permite registrar um tipo específico de middleware responsável por tratar objetos `Error`:
```javascript
app.use((error, req, res, next) => {
    res.redirect(`/500?msg=${error.msg}`);
});
```
* Necessariamente a função deve receber 4 parâmetros;
* Quando mais de um error middleware é registrado, eles são executados em sequência.

--> Para que o middleware seja executado, é necessário chamar `next()` em um middleware comum informando 
como parâmetro um objeto `Error`:
```javascript
app.post('/save', (req, res, next) => {
    Product.save().then(() => {
        res.render('result');
    }).catch(err => {
        const error = new Error(err);
        error.msg = 'Error occurred in save operation!';
        next(error);
    });
});
```

# 308 Using the Error Handling Middleware Correctly
--> Por padrão o error middleware também é executado quando no tratamento de uma requisição é lançado 
um objeto `Error`:
```javascript
app.post('/save', (req, res, next) => {
    if (!req.body.value) {
        throw new Error('msg 1');
    }

    Product.save().then(result => {
        if (result.value !== req.body.value) {
            throw new Error('msg 2');    
        }

        return res.render('result');
    }).catch(err => next(new Error(err)));
});
```
* `msg 1` é capturado pelo Express.js para tratamento pelo error middleware;
* `msg 2` não é capturado pelo Express.js por estar fora do contexto de execução da requisição, e sim 
manualmente por `catch()`.

# 309 Status Codes
--> Por padrão o status code das respostas à requisições é 200. Todavia o mesmo pode ser alterado para 
informar de maneira mais acertiva sobre o que a resposta se trata:
```javascript
app.post('/save', (req, res, next) => {
    Product.save().then(() => {
        res.statusCode(201).render('result');
    });
});
```
