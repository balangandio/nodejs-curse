# Cap 10

# 133 NoSQL Introduction
--> Os dados no NoSQL são organizados também em Databases.
* Em um Database ficam as Collections (equivalente a tables);
* Em uma Collection são armazenados Documents (objetos com campos não estruturados).

--> Normalmente não existe relacionamento entre os dados de diferentes Collections. Quando um relacionamento 
se faz necessário, os dados são duplicados.
* Isso torna necessário que uma alteração de um valor seja propagada em várias Collections onde o mesmo se 
encontra presente;
* Isso torna a recuperação de dados mais simples em código e mais performática para o banco de dados. 

# 134 Comparing SQL and NoSQL
--> Bancos de dados SQL precisam assegurar que os relacionamentos não seja quebrados e que as consultas 
envolvendo várias tabelas sejam consistêntes em um ambiente de constantes alterações de dados.

--> Essas restrições envolvendo o funcionamento de bancos SQL torna bastante difícil a tarefa de descentralizar 
o trabalho em diferentes servidores. Normalmente só é possível crescer o banco de dados de maneira vertical, 
adicionando mais recursos ao servidor, o que tem seu limite.

--> Bancos de dados NoSQL naturalmente são mais convenientes na tarefa de descentralização. Os dados não 
relacionados podem ser administrados em diferentes servidores permitindo um escalonamento horizontal da 
infraestrutura, agregando bem mais performance em grandes massas de dados.

# 136 Connecting our App to the SQL Database
--> `mysql2` é um módulo que permite se conectar em bancos MySQL.
* Install: `npm install --save mysql2`
* Import: `const mysql = require('mysql2');`

--> Um pool de conexões pode ser utilizado na aplicação com:
```javascript
const mysql = require('mysql2');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'nodecomplete',
    database: 'node-complete'
});

module.exports = pool.promise();
```
* Importação do pool:
```javascript
const db = require('./util/database');
```
* Comandos podem ser executados com:
```javascript
db.execute('SELECT * FROM table').then(...).catch(...);
```
* O pool pode ser encerrado com:
```javascript
db.end();
```

# 138 Retrieving Data
--> O retorno de `db.execute()` é uma promise para o array contendo as linhas da tabela consultada, e 
um array contendo o metadata da tabela:
```javascript
const db = require('./util/database');

db.execute('SELECT * FROM products')
    .then(([rows, metaData]) => {
        console.log(rows.lenght);
    });
```

# 141 Inserting Data Into the Database
--> A inserção com `db.execute()` pode ser feita informando o array de dados como segundo parâmetro 
para a função:
```javascript
const db = require('./util/database');

db.execute(`
    INSERT INTO products 
        (title, price, imageUrl, description) 
    VALUES (?,?,?,?)
`, [this.title, this.price, this.imageUrl, this.description])
.then(() => console.log('succeed'))
.catch(err => console.log('error', err);
```