# Cap 29 - Deploying our App

# 442 Deployment Preparations
--> O lançamento de uma aplicação Node em ambiente de produção independe da arquitetura lógica utilizada. 
Seja uma aplicação web tradicional ou uma API, ela é executada como um programa Node comum no servidor.

--> Antes de lançar uma aplicação web, é interessante atender certas práticas:
* Variáveis de ambiente: evitar deixar valores mutáveis no código;
* API Keys: utilizar API keys dedicadas para produção;
* Exposição de erros: tratar a saída de erros para evitar a exposição de detalhes técnicos;
* Configurar Secure Response Headers: definir o uso de headers seguros nas respostas HTTP;
* Compressão de assets: compressão de arquivos textuais como CSS, tratamento do tamanho de imagens;
* Logging: utilizar mecanísmo para registro e monitoramento do estado da aplicação;
* Protocolo SSL/TLS: uso de criptografia no transporte de dados sensíveis.

# 443 Using Environment Variables
--> Variáveis de ambiente são acessíveis no Node através do objeto globalmente acessível `process.env`:
```javascript
Object.keys(process.env).forEach(key => {
    console.log(`${key}=${process.env[key]}`);
});
```

--> Variáveis de ambiente podem ser definidas globalmente no sistema operacional, ou no contexto de execução 
do processo. No arquivo `package.json` é possível definir scripts de execução com as variáveis:
```json
{
  "name": "nodejs",
  "version": "1.0.0",
  "description": "Complete Node.js Guide",
  "main": "app.js",
  "scripts": {
    "start": "SET MY_KEY=1232 && SET MY_MESSAGE=Hello Human! && node app.js",
    "start:dev": "nodemon app.js"
  },
  ...
}
```
* Em sistemas Windows:
```
SET MY_KEY=1232 && SET MY_MESSAGE=Hello Human! && node app.js
```
* Em sistemas Linux:
```
MY_KEY=1232 MY_MESSAGE='Hello Human!' node app.js
```

--> Em ambiente de desenvolvimento, a ferramenta `Nodemon` permite introduzir variáveis definindo as mesmas 
em um arquivo `nodemon.json`:
```json
{
    "env": {
        "MY_KEY": "123ferger",
        "MY_MESSAGE": "Hfrmek gelrgjerl!"
    }
}
```

--> Uma prática comum é utilizar a variável de nome `NODE_ENV` para identificar a execução como `production`. 
Quando Express.js verifica que este valor está definido na variável, ele habilita algumas otimizações e 
comportamentos para o ambiente de produção.

# 445 Setting Secure Response Headers with Helmet
--> `Helmet` permite adicionar um middleware ao Express.js que define alguns headers nas respostas que 
potencialmente tratam pontos de exploração no protocolo HTTP.
* Install: `npm install --save helmet`
* Setup:
```javascript
const helmet = require('helmet');

app.use(helmet());
```

# 446 Compressing Assets
--> `Compression` é um pacote que permite realizar a compressão de assets no Express.js.
* Install: `npm install --save compression`
* Setup:
```javascript
const compression = require('compression');

app.use(compression());
```
* Muitas vezes plataformas de hospedagem Node já oferecem o serviço de compressão fora da aplicação.

# 447 Setting Up Request Logging
--> `Morgan` é um pacote utilizado para realizar o logging de acesso no Express.js.
* Install: `npm install --save morgan`
* Setup:
```javascript
const morgan = require('morgan');

app.use(morgan('combined'));
```

--> Para realizar a escrita do log em um arquivo:
```javascript
const fs = require('fs');

const acessLogStream = fs.createWriteStream(
    path.join(__dirname, 'access.log'),
    { flags: 'a' }
);

app.use(morgan('combined', { stream: acessLogStream }));
```

# 449 Setting Up a SSL Server
--> O protocolo SSL transporta o tráfego HTTP em um canal criptografado que somente o seridor e o cliente 
têm acesso, protegendo dados sensíveis de quem possivelmente esteja no meio do caminho. Isso é possível ao 
uso da criptografia de chave pública:
* É produzido para a aplicação um certificado associado a uma chave pública, e uma chave privada;
* O certificado é então enviado para uma entidade certificadora na internet, que o assina;
* A aplicação Node é então iniciada com o pacote `https` com o certificado assinado e com a chave privada;
* Ao fazer acesso com `https://`,  o browser recebe o certificado fornecido pela aplicação e valida se o 
mesmo é assinado por um dos certificados das entidades registradas na máquina local;
* E por fim, o cliente utiliza a chave pública do certificado fornecido para criptografar/descriptografar o 
tráfego, e o servidor utiliza sua chave privada para a mesma tarefa.

--> `openssl` é um programa que pode ser utilizado para gerar certificados e chaves privadas:
```
openssl req -nodes -new -x509 -keyout server.key -out server.cert
```

--> O pacote `https`, já presente na plataforma Node, permite iniciar um servidor HTTP com SSL informando o 
certificado e a chave privada:
```javascript
const https = require('https');
const fs = require('fs');

const privateKey = fs.readFileSync('server.key');
const certificate = fs.readFileSync('server.cert');

const app = express();

https.createServer({ 
    key: privateKey,
    cert: certificate
}, app).listen(3000);
```
