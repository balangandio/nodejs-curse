# Cap 3 - Understanding the Basics

# 025 Creating a Node Server
--> Node.js disponibiliza módulos para acessar recursos da máquina. Alguns são:
http : disponibiliza uma api criação de servidor e manipulação do protocolo http.
https: disponibiliza uma api criação de servidor e manipulação do protocolo https.
fs   : disponibiliza acesso a arquivos.
path : disponibiliza recursos para a navegação no sistema de arquivos.
os   : disponibiliza recursos do sistema operacional.

--> A importação destes módulos é feita com a função ``require`` sem especificação de path:
```javascript
const http = require('http');
```

--> O módulo `http` oferece a função `createServer` para criação de servidores http. Recebe 
como parâmetro um callback chamado nas requisições. E retorna o objeto representando o 
servidor, que pode ser iniciado em uma porta com a função `listen`:
```javascript
const http = require('http');
const server = http.createServer((req, res) => { });
server.listen(3000);
```

# 026 The Node Lifecycle - Event Loop
--> Toda a execução de um programa node gira em torno de um `Event Loop`, uma execução 
síncrona e cíclica, que se mantém em execução até que não exista mais ouvintes para eventos. 

--> Eventos estes que podem ser a leitura de um arquivo, a resposta de um servidor remoto, 
ou o recebimento de requisições de um servidor http, por exemplo.

--> Em um servidor http por exemplo, esse tipo de funcionamento tem vantagem performática em 
gerenciar grandes volumes de requisições devido a não criação de novas threads de execução 
parada cada request a ser atendida.

--> Por outro lado, este funcionamento implica que deve haver um cuidado em evitar executar 
operações síncronas, como um cálculo matemático pesado, ou `fs.writeFileSync`, que irão 
bloquear a execução do `Event Loop` e consequentemente postergar o tratamento dos demais eventos.

--> O `Event Loop` pode ser interrompido abruptamente com:
```javascript
process.exit();
```

# 028 Understanding Requests
--> O listener informado na função `http.createServer` recebe como primeiro parâmetro o objeto 
que representa a requisição recebida. Ele permite acesso a detalhes informado na requisição, 
como método http, URL e headers:
```javascript
const handler = (request, response) => {
    const { method, url, headers } = request;
    ...
};
http.createServer(handler).listen(3000);
```

# 029 Sending Responses
--> O listener informado na função `http.createServer` recebe como segundo parâmetro o objeto 
que permite personalizar a resposta. É possível definir os headers da resposta assim como 
escrever o seu corpo:
```javascript
const handler = (request, response) => {
    response.setHeader('Content-Type', 'text/html');
    response.write('<html>');
    response.write('...');
    response.write('</html>')
    response.end();
};
http.createServer(handler).listen(3000);
```

--> A função `response.end()` indica que a resposta foi finalizada. Não necessariamente envia a 
resposta para o cliente. Caso seja tentado uma nova modificação da resposta, uma exceção é disparada.

# 032 Redirecting Requests
--> Uma redirecionamento pode ser feito com:
```javascript
const handler = (request, response) => {
    const { url, method } = request;

    if (url === '/message' && method == 'POST') {
        response.statusCode = 302;
        response.setHeader('Location', '/');
        response.end();
    }
    ...
};
http.createServer(handler).listen(3000);
```

# 033 Parsing Request Bodies
--> A leitura do corpo de uma requisição é feita com auxilio de eventos:
`data` corresponse ao evento de leitura de parte da corpo escrita em um buffer.
`end` corresponse ao evento disparado quando toda a leitura da requisição foi concluída.
```javascript
const handler = (request, response) => {
    const { url, method } = request;

    if (url === '/message' && method == 'POST') {
        const bodyRaw = [];
        request.on('data', buffer => bodyRaw.push(buffer));

        return request.on('end', () => {
            const bodyString = Buffer.concat(bodyRaw).toString();
            console.log(bodyString);

            response.statusCode = 302;
            response.setHeader('Location', '/');
            return response.end();
        });
    }
    ...
};
http.createServer(handler).listen(3000);
```

--> Node disponibiliza o objeto global `Buffer` para tratamento de buffers.

# 035 Blocking and Non-Blocking Code
--> Deve-se sempre atentar em não bloquear o `Event loop`. A escrita do conteúdo de uma requisição 
em um arquivo, por exemplo, deve ser feita de modo assíncrono (evitando `fs.writeFileSync`):
```javascript
const handler = (request, response) => {
    const { url, method } = request;

    if (url === '/message' && method == 'POST') {
        const bodyRaw = [];
        request.on('data', buffer => bodyRaw.push(buffer));

        return request.on('end', () => {
            const bodyString = Buffer.concat(bodyRaw).toString();

            fs.writeFile('out.txt', bodyString, err => {
                response.statusCode = 302;
                response.setHeader('Location', '/');
                return response.end();
            });
        });
    }
    ...
};
http.createServer(handler).listen(3000);
```

# 036 Node.js - Looking Behind the Scenes
--> Node.js pode ser resumido por:
JavaScriptThread: a thread que executa o programa a partir do seu entry point.
Event Loop      : a thread que executa os callbacks dos eventos registrados.
Worker Pool     : o conjunto de threads que realizam a execução de operações síncronas pesadas, como a 
escrita de um arquivo ou a leitura do corpo de uma requisição.

--> A cada iteração do `Event Loop` é feito:
1º Timers: são executados os callbacks registrados com `setTimeout` ou `setInterval` que tenham expirado.
2º Pending Callbacks: são executados os demais callbacks de eventos ocorridos.
3º Poll phase: são executados operações de I/O, em um curto período de tempo. Quando a operação supera 
um tempo limite, a execução é abandonada e o seu callback é adicionado aos `Pending Callbacks`. Entre o 
tratamento dessas operações, os `Timers` são regularmente verificados e caso algum tenha expirado, seu 
callback é executado.
4º Check: são executados os callbacks registrados com `setImmediate`.
5º Close: são executados eventos correlatos a liberação de recursos.

--> Antes de cada iteração, o `Event Loop` verifica se o contador de callbacks registrados é maior que 0. 
Esse mesmo contado é decrementado a cada evento finito que tenha seu callback executado.

--> `setImmediate` é um função que permite registrar callbacks que são executados na fase Check do Event 
Loop. Tipicamente callbacks registrados assim acabam sendo executado antes de um timer de 1 milisegundo 
`setTimeout(() => {}, 1)`.

# 037 Using the Node Modules System
--> A importação de código de um outro arquivo é feita com `require` especificando o path relativo a sua 
localização. Na existência de um arquivo routes.js, a importação seria feita com:
```javascript
const routes = require('./routes');
```

--> Deve ser definido no arquivo a ser importado, o conteúdo disponibilizado no objecto `module.exports`, 
ou somente `exports`:
```javascript
const routeHandler = (req, res) => {
    ...
};

// module.exports = routeHandler
// exports = routeHandler;
module.exports = {
   handler: routeHandler,
   COUNT: 23 
};
```
