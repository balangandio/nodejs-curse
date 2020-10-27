# Cap 22 - Understanding Async Requests

# 342 What are Async Requests
--> Em aplicações web requisições assíncronas são requisições desencadeadas por ações do cliente que não 
necessariamente trocam a atual página em exibição no browser. Usualmente o cliente e o servidor trocam 
dados em um formato não visual, como JSON ou XML.

# 345 Sending - Handling Background Requests
--> Express.js oferece função `res.json()` que sinaliza o tipo de conteúdo e atribui ao corpo da resposta 
um objeto JSON:
```javascript
router.delete('/product/:productId', (req, res, next) => {
    const { productId } = req.params;

    return Product.deleteOne({ _id: new ObjectId(productId), userId: req.user._id })
        .then(() => {
            res.status(200)
                .json({ message: 'Success!' });
        }).catch(err => res.status(500)
            .json({ message: 'Deletion failed!' }));
});
```

--> Uma requisição poderia ser feita com a FetchAPI no cliente:
```javascript
fetch(`/product/${prodId}`, {
        method: 'DELETE',
        headers: { 'csrf-token': token }
    }).then(result => {
        console.log(result.message);
    });
```
* O middleware de proteção CSRF `csurf` também verifica por tokens nos headers das requisições.