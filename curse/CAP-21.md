# Cap 21 - Adding Pagination

# 334 Retrieving a Chunk of Data
--> Mongoose oferece as funções `skip()` e `limit()` utilizadas para restringir quais objetos objetos em 
uma consulta devem ser retornados. Funções estas que permitem implementar uma estratégia de paginação:
```javascript
const ITEMS_PER_PAGE = 10;
const currentPage = req.query.page;

Product.find()
    .skip((currentPage - 1) * ITEMS_PER_PAGE)
    .limit(ITEMS_PER_PAGE)
    .then(products => {
        console.log(`Products in page [${currentPage}] : `, products);
    });
```

# 336 Preparing Pagination Data on the Server
--> Mongoose oferece a função `countDocuments()` no objeto `collection` de um modelo:
```javascript
const ITEMS_PER_PAGE = 10;
const currentPage = req.query.page;

Product.collection
    .countDocuments()
    .then(total => {
        return Product.find()
            .skip((currentPage - 1) * ITEMS_PER_PAGE)
            .limit(ITEMS_PER_PAGE)
            .then(products => { return { products, total }; });
    }).then(({ products, total })) => {
        console.log(`Total of items    : ${total}`);
        console.log(`Has next page     : ${ITEMS_PER_PAGE * currentPage < total}`);
        console.log(`Has previous page : ${currentPage > 1}`);
        console.log(`Total of pages    : ${Math.ceil(total / ITEMS_PER_PAGE)}`);
    });
```
