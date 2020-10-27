# Cap 13 - Working with Mongoose

# 205 What is Mongoose
--> Mongoose é uma biblioteca ODM (Object Document Mapping) que busca o mesmo objetivo que blibliotecas 
ORM (Object Relational Mapping), abstratir a interface com a base de dados. Todavia se destina a banco 
de dados baseados em documento, como MongoDB.

# 206 Connecting to the MongoDB Server with Mongoose
--> Install: `npm install --save mongoose`

--> Conexão:
```javascript
const mongoose = require('mongoose');

mongoose.connect('mongodb://node-curse-app:node-curse-pass@localhost/node-complete?retryWrites=true')
    .then(() => {
        app.listen(3000);
    });
```

# 207 Creating the Product Schema
--> Modelos são criados a partir de schemas. Em um Schema restrições sobre os dados dos modelos podem 
ou não ser definidas:
```javascript
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const productSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    props: {
        items: [{
            propId: { type: Schema.Types.ObjectId },
            quantity: { type: Number, required: true }
        }]
    }
});

module.exports = mongoose.model('Product', productSchema);
```
* O nome da coleção do model será o nome do model em letras minúsculas e no plural: `products`

--> Abrir mão de parte da flexibilidade de bancos não relacionais permite alguns benefícios sobre o 
controle dos dados, o que fica a cargo de cada aplicação definir a sua utilidade.

# 208 Saving Data Through Mongoose
--> A instância de um model é feita por construtor, informando o conjunto de propriedades do objeto, e
o registro com a função `save()`:
```javascript
const Product = require('../models/product');

const product = new Product({
  title: 'Human',
  price: 42
});

product.save().then(() => {
  console.log('done');
});
```

# 209 Fetching All Products
--> A recuperação dos objetos pode ser feita com a função estática `find()`:
```javascript
Product.find().then(products => {
  console.log('total: ', products.length);
});
```
* `find().cursor()` retorna um cursor para consumo da stream de objetos de maneira controlada.

# 210 Fetching a Single Product
--> Um único objeto pode ser recuperado com a função esática `findById()`:
```javascript
Product.findById(id).then(product => {
  console.log(product;
});
```

# 211 Updating Products
--> O update das propriedades de um objeto já armazenado pode ser feita com também com `save()`:
```javascript
Product.findById(id).then(product => {
  product.title = 'updated title';

  return product.save();
}).then(() => {
  console.log('done');
});
```

# 212 Deleting Products
--> A deleção de um objeto pode ser feita com a função estática `findByIdAndRemove()`:
```javascript
Product.findByIdAndRemove(id)
  .then(() => {
      console.log('removed');
  });
```

# 214 Using Relations in Mongoose
--> O relacionamento entre models é representado no schema pela propriedade `ref`, que indica o nome do 
modelo referenciado:
```javascript
const userSchema = new Schema({
    name: {
        type: String,
        require: true
    },
    email: {
        type: String
    }
});
const productSchema = new Schema({
    title: {
        type: String,
        require: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        require: true
    }
});

exports.Product = mongoose.model('Product', productSchema);
exports.User = mongoose.model('User', productSchema);
```
--> Na construção de uma instância o ID do objeto referência pode ser infomado ou o próprio objeto:
```javascript
const user = req.user;
const product = new Product({ title:  'something', userId: user });
```

# 215 One Important Thing About Fetching Relations
--> Ao recuperar objetos que fazem relaciomaneto com outros modelos, é possível solicitar a recuperação 
das referências ou de campos específicos das mesmas com `populate()`:
```javascript
Product.find()
  .populate('userId')
  .then(products => {
    console.log('total: ', products.length);
  });
```
* `userId` é um campo `ref`;
* `populate('userId', 'name')` especifica a recuperação somente do campo `name`.

--> É possível fazer restrições na recuperação de campos específicos do objeto com `select()`:
```javascript
Product.findById(id)
  .select('title price -_id')
  .then(product => {
  
    console.log('done');
  });
```
* Campos são separados com espaço;
* Campos sinalizados com `-` não são recuperados.

# 216 Working on the Shopping Cart
--> É possível definir métodos em models com a propriedade `methods` de schemas:
```javascript
const userSchema = new Schema({
    name: { type: String, require: true },
    email: { type: String }
});

userSchema.methods.addToCart = function() { ... };

exports.User = mongoose.model('User', productSchema);
```

--> IDs são automaticamente encapsulados em objetos ObjectID quando objetos são persistidos:
```javascript
const product = new Product({ title:  'something', userId: '634njk3h43hb43k4' });
product.save.then(() => console.log('done'));
```

# 217 Loading the Cart
--> Objetos podem ter propriedades populadas com `execPopulate()`:
```javascript
const user = req.user;
user.populate('cart.items.productId')
  .execPopulate()
  .then(user => {
    console.log('cart products: ', user.cart.items);
  });
```

# 219 Creating - Getting Orders
--> O relacionamento entre models pode ser uma mescla de objetos aninhados e referenciamento:
```javascript
const orderSchema = new Schema({
    products: [...],
    user: {
        name: { type: String, required: true },
        userId: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: 'User'
        }
    }
});
```
* Uma instância de Order sempre terá um `user.name`, e quando necessário, poderá popular `user.userId` 
com todo o objeto referenciado.

# 220 Storing All Order Related Data
--> Por padrão Mongoose armazena o ID de instâncias quando as mesmas são persistidas como propriedades em 
um objeto:
```javascript
const Order = mongoose.model('Order', new Schema({
    cart: [{ product: {type: Object}, quantity: {type: Number} }]
}));

Product.findOne().then(product => {
    const order = new Order({ 
        cart: [{ product: product, quantity: 1 }]
    });
    return order.save();
}).then(console.log);
```
* Mesmo que `order.cart.product` seja do `type: Object`, a instância `product` é armazenada como ObjectId no 
banco de dados.

--> Para armazenar toda a instância como um objeto comum, pode ser feito uma cópia do objeto interno `_doc`:
```javascript
Product.findOne().then(product => {
    const order = new Order({ 
        cart: [{ product: { ...product._doc }, quantity: 1 }]
    });
    return order.save();
}).then(console.log);
```

# 222 Getting - Displaying the Orders
--> A função de consulta `find()` pode receber restrições:
```javascript
const Order = mongoose.model('Order', new Schema({
    user: {
        name: { type: String, required: true },
        userId: { type: Schema.Types.ObjectId, required: true, ref: 'User' }
    }
}));

const user = req.user;
Order.find({ 'user.userId': user._id })
    .then(orders => console.log('user orders', orders));
```