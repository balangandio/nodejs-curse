# Cap 9

# 115 Extracting Dynamic Params
--> Express.js permite uma maneira de extrair parâmetros dentro da URL:
```javascript
router.get('/products/:productId', (req, res, next) => {
    const prodId = req.params.productId;
    res.redirect('/');
});
```
* A identificação de parâmetros na URL é feita com o caracter `:`.
* O mapa valores é representado pelo no objeto `req.params`.

--> O uso de path params pode apresentar uma comportamento não desejado dependendo da ordem de registro das rotas:
```javascript
router.get('/products/:productId', ...);
router.get('/products/promotion', ...);
```
* O rota `/products/promotion` nunca será acionada pois `/products/:productId` foi registrado antes.

# 118 Passing Data with POST Requests
--> A função `<%- include(...) %>` da engine EJS recebe como segundo parâmetro um objeto que representa o scope 
acessível pelo contexto que está sendo incluído. Esse parâmetro é últil para permitir que variáveis declaradas em 
na própria view (váriável de um loop, por exemplo) sejam acessíeis na partil:
```html
<div class="grid">
    <% for (let product of prods) { %>

        <%- include('../includes/product-desc.ejs', {product: product}) %>

    <% } %>
</div>
```
* `let product` não é acessível no contexto da partil `product-desc.ejs`.

# 119 Adding a Cart Model
--> Objetos em um array podem ter seu index localizado com `findIndex()`:
```javascript
const values = [ { id: 'fwe' }, { id: 'rwe'} ];
const index = values.findIndex(elem => elem.id == 'rwe');
```

--> Variáveis armazenando `String` podem ter seu valor convertido para `Number` com a notação `+var`:
```javascript
const desc = '4342';
const descNumber = +desc;
```

# 120 Using Query Params
--> Os URL query parameters de uma requisição são acessíveis no objeto `req.query`:
```javascript
// GET /product?id=42
router.get('/product', (req, res, next) => {
    const id = req.query.id;
    ...
});
```
