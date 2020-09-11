# Cap 1

# 002 What is Node.js
--> Node.js é uma plataforma utilizada para executar código javascript em um ambiente de servidor.

--> Possui um motor de execução derivado do javascript V8, capaz de acessar recursos nativos da 
máquina, como ler arquivos e alocar sockets de rede.

# 003 Installing Node.js and Creating our First App
--> O acesso ao recurso de arquivos é feito com o pacote `fs`:
```javascript
const fs = require('fs');
fs.writeFileSync('file.txt', 'text content');
```

# 004 Understanding the Role  Usage of Node.js
--> Como Node.js se resume a um runtime, o seu uso não se restringe a servidores, é também bastante 
utilizado na criação de scripts e build tools de frameworks sobre javascript, como Angular e React.

--> Na utilização como servidor, uma aplicação Node.js é encarregada não só em executar a lógica do 
negócio como também o próprio servidor que trata as solicitações (diferentemente de uma solução PHP).

# 007 Working with the REPL vs Using FIles
--> Executando o comando `node` no terminal do sistema, é aberto um ambiente de interpretação de 
código chamado REPL. Útil para testes e rápidos experimentos.


# Cap 2

# 018 Destructuring
--> Elementos de um array podem ser atribuídos diretamente a variáveis através do destructuring:
```javascript
const [host, port] = ['127.0.0.1', 4242];
```

# 019 Async Code - Promises
--> Promises podem ser utilizadas para evitarem encadeamentos que degradam o entendimento do código:
```javascript
const fetchData = (callback) => {
    setTimeout(() => callback('done!'), 1500);
};

fetchData(result => {
    console.log(`1: ${result}`);

    fetchData(result => {
        console.log(`2: ${result}`);
    });
});
```

--> Com promise:
```javascript
const fetchData = () => {
    return new Promise((res, rej) => setTimeout(() => res('done!'), 1500));
};

fetchData().then(result => {
    console.log(`1: ${result}`);
    return fetchData();
}).then(result => {
    console.log(`2: ${result}`);
});
```
