# Cap 27

# 399 What Are Websockets - Why Would You Use Them
--> Diferentemente do modelo HTTP de requisição/resposta que utilizados nas aplicações web onde sempre 
parte do cliente a iniciativa de solicitar o recurso, a comunicação por websockets torna possível que 
o contrário seja possível, que o servidor dê inicio a um processamento no cliente.

--> Normalmente o uso de websockets se adequa a apenas algumas funcionalidades específicas. Ambos os 
modelos de comunicação coexistem sem problema dentro da mesma aplicação.

--> Uma conexão websocket normalmente se inicia com o cliente solicitando uma requisição HTTP para um 
determinado path [ex: `http://server/socket`].
* O servidor responde com uma identificação para o cliente;
* Em seguida o cliente realiza uma nova solicitação com a ID atribuida [ex: `http://server/socket?id=aNuf32xd`];
* O servidor responde com status [`HTTP/1.1 101 Switching Protocols`] informando a mudança do protocolo;
* Cliente e servidor passam agora a usar a conexão para trocar mensagens no protocolo `websocket`.

--> Quando o canal de comunicação é por algum motivo quebrado, o cliente faz uso de uma política de 
reconexão na tentativa de restabelecê-lo.

# 401 Setting Up Socket.io on the Server
--> `Socket.io` é uma das ferramentas mais utilizadas para integrar websockets em aplicações Node e 
javascript em geral. A ferramenta precisa ser instalado tanto no servidor como no cliente:
* Install server: `npm install --save socket.io`
* Install client: `npm install --save socket.io-client`

--> No lado do servidor:
```javascript
const express = require('express');

const app = express();

const server = app.listen(8080);

const io = require('socket.io')(server);

io.on('connection', socket => {
    console.log('client connected');
});
```
* A importação do pacote devolve uma função que recebe a implementação do servidor HTTP;
* `io.on('connection')` configura um listening para o evento de conexão de um cliente.

--> No lado do cliente:
```javascript
import openSocket from 'socket.io-client';

const socket = openSocket('http://localhost:8080');
```

# 405 Synchronizing POST Additions
--> Em um socket é possível emitir um evento com algum dado e igualmente esperar pela ocorrência do mesmo:
* No servidor um evento pode ser emitido para todos os clientes conectados com `emit()`:
```javascript
const io = require('socket.io')(server);

app.post('/post', (req, res, next) => {
    const { post } = req.body;

    addToDatabase(post).then(() => {
        io.emit('newPost', { post });
    });
});
```
* No cliente um evento pode ser esperado com `on()`:
```javascript
const socket = openSocket('http://localhost:8080');

socket.on('newPost', data => {
    addToList(data.post);
});
```