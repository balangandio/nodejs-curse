# Cap 11

# 146 What is Sequelize
--> Sequelize é um módulo ORM (Object-relational mapping) que permite trabalhar com bases SQL de 
maneira mais eficiente.
* Install: `npm install --save sequelize`
* É necessário ter o módulo `mysql2` previamente instalado.

# 147 Connecting to the Database
--> A criação do pool de conexões pode ser feita com:
```javascript
const Sequelize = require('sequelize');

const sequelize = new Sequelize('node-complete', 'root', 'root', {
    dialect: 'mysql',
    host: 'mysql.dev'
});

module.exports = sequelize;
```

# 148 Defining a Model
--> Com base em um modelo, o ORM poderá criar a tabela no banco de dados assim como será capaz de 
recuperar os dados corretamente. A definição de um model é feito com a partir pool `seqDb.define()`:
```javascript
const Sequelize = require('sequelize');

const seqDb = require('../util/database');

const Product = seqDb.define('product', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    title: Sequelize.STRING,
    price: {
        type: Sequelize.DOUBLE,
        allowNull: false
    },
    imageUrl: {
        type: Sequelize.STRING,
        allowNull: false
    },
    description: {
        type: Sequelize.STRING,
        allowNull: false
    }
});

module.exports = Product;
```

# 149 Syncing JS Definitions to the Database
--> A estrutura do banco de dados pode ser sincronizada com o modelo definido no projeto a partir da 
função `seqDb.sync()`, executada no início da aplicação:
```javascript
const seqDb = require('../util/database');

seqDb.sync()
    .then(() => app.listen(3000))
    .catch(err => console.log(err));
```
* Objetos definidos no model que não estão presentes no banco de dados serão criados.
* Por padrão é definido as colunas `createdAt` e `updatedAt` nas tabelas no banco de dados.
* `seqDb.sync({ force: true })` faz com que estruturas existentes na base de dados sejam redefinidas.

# 150 Inserting Data - Creating a Product
--> Sequelize oferece no objeto modelo a função `create()`, que realiza o trabalho de construção do objeto 
assim como de gravá-lo no banco de dados:
```javascript
Product.create({
    title: 'Title',
    price: 12,
    imageUrl: 'http://e.e/',
    description: 'desc. of product'
}).then(() => console.log('succeed'))
.catch(err => console.log(err));
```
* A função `build()` apenas realiza a construção do objeto.

# 151 Retrieving Data - Finding Products
--> A recuperação dos dados pode ser feita com `findAll()`:
```javascript
Product.findAll().then(products => {
    console.log('all elements', products);
}).catch(err => console.log(err));
```

# 152 Getting a Single Product with the where Condition
--> Um objeto pode ser recuperado restringindo a consulta com `findAll()`:
```javascript
Product.findAll({
    where: {id: 1}
}).then(products => {
    console.log('id [1]', products[0]);
}).catch(err => console.log(err));
```

# 154 Updating Products
--> Um objeto pode ter seu estado persistido com `save()`:
```javascript
Product.findAll({where: {id: 1}})
    .then(products => products[0])
    .then(product => {
        product.title = 'Changed';

        return product.save();
    }).then(() => console.log('succeed'))
    .catch(err => console.log(err));
```
* `save()` cria o objeto no banco de dados caso ele não exista.

# 155 Deleting Products
--> Delete pode ser feito com a função `destroy()`:
```javascript
Product.findAll({where: {id: 1}})
    .then(products => products[0])
    .then(product => product.destroy())
    .then(() => console.log('succeed'))
    .catch(err => console.log(err));
```

# 157 Adding a One-To-Many Relationship
--> Relacionamentos entre tabelas podem ser configuradas através dos modelos antes de sincronizá-los 
com a base de dados. `hasMany` estabelece um relacionamento One-To-Many:
```javascript
Product.belongsTo(User, { constraints: true, onDelete: 'CASCADE' });
User.hasMany(Product);

seqDb.sync().then(() => app.listen(port))
    .catch(err => console.log(err));
```
* Um `User` possui muitos `Product`, por padrão é adicionado a coluna `userId` na tabela de produtos.
* O constraint deve ser definido antes do relacionamento.

# 158 Creating - Managing a Dummy User
--> Dados podem ser aclopados ao objeto correspondente a requisição No Express.js de maneira que estejam 
disponível para próximas funções de tratamento:
```javascript
app.use((req, res, next) => {
    User.findAll({where: {id: 1}})
        .then(users => users[0])
        .then(user => {
            req.user = user;
            next();
        })
        .catch(console.log);
});

app.use(shopRoutes);
app.use('/admin', adminRoutes.router);
```
* `req.user` fica acessível aos próximos middleware functions.

# 159 Using Magic Association Methods
--> Quando modelos estão relacionados, Sequelize disponibiliza funções utilitárias para a implementação de 
relaciomentos. Levando em consideração a ligação:
```javascript
Product.belongsTo(User, { constraints: true, onDelete: 'CASCADE' });
User.hasMany(Product);
```
* Podemos criar um `Product` a partir de um objeto `User` com a função `user.createProduct`:
```javascript
User.findAll({where: {id: 1}})
    .then(users => users[0])
    .then(user => user.createProduct({ ... }))
    .then(() => console.log('done'));
```
* Com `hasMany`, em `User` fica disponível a função `user.getProducts()`.

# 160 Fetching Related Products
--> É possível também recuperar todos os objetos ligados a uma entidade One-To-Many:
```javascript
User.findAll({where: {id: 1}})
    .then(users => users[0])
    .then(user => user.getProducts({ where: {id: prodId} }))
    .then(products => console.log('all user products', products));
```

# 161 One-To-Many - Many-To-Many Relations
--> O mesmo efeito prático de One-To-Many também pode ser estabelecido com `hasOne`:
```javascript
User.hasOne(Cart);
Cart.belongsTo(User);
```
* Em `Cart` é adicionado uma coluna `userId`.
* `Cart.belongsTo(User)` sem parâmetros não tem um efeito prático no banco de dados.
* Com `hasOne`, em `User` fica disponível a função `user.getCart()`.

--> Many-To-Many pode ser feito com `belongsToMany` informando o modelo da tabela associativa:
```javascript
Cart.belongsToMany(Product, { through: CartItem });
Product.belongsToMany(Cart, { through: CartItem });
```
* Em `Cart` é disponibilizado a função `cart.addProduct()`.
* Em `Product` é disponibilizado o objeto de ligação em `product.cartItem`.

# 163 Adding New Products to the Cart
--> Em uma ligação Many-To-Many, um objeto de ligação de ser inserido/atualizado com:
```javascript
Cart.findAll({where: {id:1}})
    .then(elems => elems[0])
    .then(cart => Product.findAll({where: {id:1}})
        .then(elems => new Object({cart, product: elems[0]})))
    .then(({cart, product}) => {

        cart.addProduct(product, {
            through: { quantity: newQuantity }
        });

    });
```
* Na propriedade `through` é possível definir valores para os campos da entidade de ligação.

# 164 Adding Existing Products - Retrieving Cart Items
--> Quando objetos envolvidos em uma ligação Many-To-Many são recuperados a partir de uma instância do 
relacionamento, fica disponível o objeto de ligação:
```javascript
Cart.findAll({where: {id:1}}).then(elems => elems[0])
    .then(cart => cart.getProducts())
    .then(products => {
        if (products.length > 0) {
            const product = products[0];
            console.log('cartItem qty', product.cartItem.quantity);
        }
    });
```
* Como `product` foi recuperado com `cart.getProducts`, fica disponível `product.cartItem` como o objeto 
da ligação.

# 167 Storing Cartitems as Orderitems
--> Um objeto de ligação pode também ser criado especificando o próprio objeto dentro da entidade:
```javascript
Cart.findAll({where: {id:1}})
    .then(elems => elems[0])
    .then(cart => Product.findAll({where: {id:1}})
        .then(elems => new Object({cart, product: elems[0]})))
    .then(({cart, product}) => {

        product.cartItem = { quantity: 1 };

        cart.addProduct(product);
    });
```

# 168 Resetting the Cart  Fetching and Outputting Orders
--> Objetos de ligação podem ser removidos com:
```javascript
Cart.findAll({where: {id:1}})
    .then(elems => elems[0])
    .then(cart => cart.setProducts(null));
```
* `setProducts(null)` remove os objetos `CartItem`.

# 168 Resetting the Cart - Fetching and Outputting Orders
--> Objetos envolvidos em uma relação Many-To-Many podem ser recuperados com eager fetch. Considerando uma 
ligação entre `Order` e `Product` por `OrderItem`:
```javascript
User.findAll({where: {id:1}})
    .then(elems => elems[0])
    .then(user => user.getOrders({ include: ['products'] }))
    .then(orders => {
        if (orders.length > 0) {
            const order = orders[0];
            console.log('order products', order.products);
        }
    });
```
* A propriedade `include` permite especificar os campos que serão obtidos na consulta.