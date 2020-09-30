# Cap 12

# 172 What is MongoDB
--> MongoDB é um banco de dados não estruturado projetado para performar sobre grandes quantidades de dados.

--> Os dados são representados em formato JSON e internamente armazenados em formato BJSON.

# 173 Relations in NoSQL
--> As coleções de dados em bases NoSQL usualmente são montadas da maneira mais direta possível segundo a 
necessidade de recuperação. Todavia em um contexto de relacionamentos entre coleções e constantes atualizações 
de dado, nem sempre é a melhor estratégia a ser seguida.

--> A representação de relacionamentos pode se distinguir para cada situação, muitas vezes mais de uma maneira 
é utilizada em conjunto para obter um solução mais eficiente de armazenamento e recuperação:
* `Os dados de uma coleção são replicados em outra`: mais performático; alterações de dados precisão 
ser igualmente replicadas;
* `Identificações são usadas como referência para dados em outra coleção`: maior complexidade na recuperação;
mais performático em ambientes de constates atualizações; maior controle sobre redudância.

# 174 Setting Up MongoDB
--> Docker compose file:
```
version: '3.1'

services:
  mongo:
    image: mongo
    restart: always
    ports:
      - 27017:27017
    environment:
      MONGO_INITDB_ROOT_USERNAME: root
      MONGO_INITDB_ROOT_PASSWORD: root
    volumes:
      - mongodb:/data/db

  mongo-express:
    image: mongo-express
    restart: always
    ports:
      - 8081:8081
    environment:
      ME_CONFIG_MONGODB_ADMINUSERNAME: root
      ME_CONFIG_MONGODB_ADMINPASSWORD: root

volumes:
  mongodb:
    external:
      name: vol_mongodb
```

--> Criar volume:
```shell
mkdir /opt/mongodb
mkdir data
docker volume create --name vol_mongodb --opt type=none --opt device=/opt/mongodb/data --opt o=bind
```

--> Start:
```
docker-compose -f docker-compose.yml -d up
```

--> Criar database e usuário:
```
docker exec -it mongodb_mongo_1 mongo --host localhost -u root -p root
```
```javascript
use node-complete
db.deleteme.insertOne( { x: 1 } )
db.createUser(
  {
    user: "node-curse-app",
    pwd: "node-curse-pass",
    roles: [
       { role: "readWrite", db: "node-complete" }
    ]
  }
)
```

# 175 Installing the MongoDB Driver
--> Install: `npm install --save mongodb`

--> Criação de conexão:
```javascript
const mongodb = require('mongodb');

const MongoClient = mongodb.MongoClient;

let _db;

const mongoConnect = (cb) => {
    MongoClient.connect('mongodb://node-curse-app:node-curse-pass@192.168.168.1/node-complete?retryWrites=true')
        .then(client => {
            _db = client.db();

            cb();
        })
        .catch(err => {
            throw err;
        });
};

const getDb = () => {
    if (_db) {
        return _db;
    }

    throw 'No database found';
};

exports = { mongoConnect, getDb };
```

--> Starup
```javascript
mongoConnect(() => {
    app.listen(3000);
});

```

# 179 Creating Products
--> Por padrão mongodb calcula uma hash para objetos inseridos e define a propriedade `_id` com o valor da mesma.

--> Mongodb cria coleções na medida que as mesma são utilizadas. A inserção de um documento em uma coleção 
chamada products pode ser feito com:
```javascript
const db = getDb();
db.collection('products')
    .insertOne({ name: 'test', color: 'green' })
    .then(() => console.log('done'));
```

# 181 Fetching All Products
--> Uma coleção pode ser recuperada com:
```javascript
const db = getDb();
db.collection('products')
    .find()
    .toArray();
```
* `find()` retorna um cursor para consumo da stream de documentos.
* `toArray()` força a leitura de todos os documentos e retorna os mesmo em um array.

# 182 Fetching a Single Product
--> A recuperação de um único objeto pode ser feita com:
```javascript
const db = getDb();
db.collection('products')
    .find({ _id: new mongodb.ObjectID(prodId) })
    .next();
```
* A propriedade `_id` dos documentos é armazenada pelo mongodb como um objeto. Isso implica que em 
uma comparação direta de valores a representação em string precisa ser convertida.
* No caso de um único objeto, pode ser utilizado `findOne`:
```javascript
const db = getDb();
db.collection('products')
    .findOne({ _id: new mongodb.ObjectID(prodId) });
```

# 185 Finishing the Update Product Code
--> Update de um objeto pode ser feito com:
```javascript
const mongoId = new mongodb.ObjectID(id);

db.collection('products')
    .updateOne({ _id: mongoId }, {
        $set: { name: 'human', firstNumber: 42, _id: mongoId }
    });
```

# 187 Deleting Products
--> A deleção de um objeto pode ser feito com:
```javascript
const db = getDb();
db.collection('products')
    .deleteOne({ _id: new mongodb.ObjectID(id) });
```

# 194 Displaying the Cart Items
--> Múltiplos objetos podem ser recuperados o operador `$in`:
```javascript
const db = getDb();
db.collection('products')
    .find({ _id: {$in: ['...', '...', '...']} })
    .toArray().then(console.log);
```

# 199 Getting Orders
--> Objetos podem ser recuperados a partir de propriedades aninhada:
```javascript
const db = getDb();
db.collection('orders')
    .find({ 'user._id': userId })
    .toArray().then(console.log);
```