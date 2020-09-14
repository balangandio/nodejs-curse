# Cap 4

# 041 Understanding NPM Scripts
--> Npm é uma ferramenta paralela a plataforma Node que permite gerenciar módulos, que não 
já presentes na plataforma, e padroniza a identificação do projeto.

--> O comando `npm init` cria no diretório corrente o arquivo `package.json`, contendo 
informações de nome e autoria do projeto, assim como módulos externos aos quais são dependentes.

--> No arquivo `package.json` também é possível especificar scripts para a execução do projeto.
```javascript
{
    "scripts": {
        "start": "node app.js"
        "start-custom": "..."
    }
}
```
* Os scripts são executados com o comando: `node run <script-name>`
* O script de nome "start" em específico, possui a abreviação: `node start`

# 042 Installing 3rd Party Packages
--> As dependências de um projeto são especificadas no arquivo `package.json`:
```javascript
{
    "dependencies": {
        "<module-name>": "<module-version>"
    },
    "devDependencies": {
        "<module-name>": "<module-version>"
    }
}
```

--> A inclusão de dependências é feita com o comando: `npm install <module-name>`
* As `devDependencies` são dependências que ficam disponíveis apenas em ambiente de desenvolvimento. 
Normalmente ferramentas que não tem utilidade em produção.
* Para que uma dependência seja adicionada não só ao sistema de arquivo, mas especificada no 
`package.json`, é necessário usar os parâmetros `--save` ou `--save-dev`:
```
npm install --save <module-name>
npm install --save-dev <module-name>
```
* Para que uma dependência fique disponível globalmente no sistema operacional, é necessário usar 
o parâmetro `-g`:
```
npm install -g <module-name>
```

--> Por padrão o comando `npm install <module-name>` faz o download da versão mais recente do módulo 
a partir do repositório público disponível na internet. A versão baixada fica disponível em uma pasta 
chamada `node-modules`.

* Como módulos podem acabar dependendo de outros módulos, os mesmos são igualmente baixados e a pasta 
`node-modules` acaba possuindo uma grande quantidade de arquivos.
* O compartilhamento do projeto normalmente é feito ignorando essa pasta. E para que o projeto possa 
ser executado em outro ambiente, é necessário reconstruí-la, o que é feito com o comando:
```
npm install
```
* Ao instalar uma dependência, é produzido um arquivo chamado `package-lock.json` contendo informações 
específicas do pacote baixado, o que inclui a versão da dependência.
* O compartilhamento deste arquivo faz com que o comando `node install` recontrua a pasta `node-modules` 
com as exatas verções especificadas no arquivo `package-lock.json`.

# 044 Using Nodemon for Autorestarts
--> Nodemon é uma ferramenta utilitária que reinicia a execução do projeto assim que mudanças são 
detectadas nos arquivos fontes.
* A instalação pode ser feita com:
```
npm install --save-dev nodemon
```
* Quando não instalada globalmente (`-g`), o programa de linha de comando pode ser executado a partir 
da seção `scripts` do `package.json`:
```javascript
{
    "scripts": {
        "start": "nodemon app.js"
    }
}
```
* A execução então pode ser feita com: `npm start`

# 046 Understanding different Error Types
--> Ao desenvolvimento com Node.js, estamos sucetíveis a três tipos de erros:
* `Syntax Errors`: erros derivados da escrita incorreta da linguagem.
* `Runtime Errors`: erros derivados de uma execução incorreta ou não prevista.
* `Logical Errors`: erros derivados de uma lógica de processamento defeituosa, que se manifestão em 
resultados não esperados.

# 051 Restarting the Debugger Automatically After Editing our App
--> A ferramenta de debug do Visual Studio Code oferece a capacidade de analisar e alterar o conteúdo 
de variáveis, assim como executar código no contexto em análise.

--> É possível configurar um debuger profile no Visual Studio Code para fazer uso do Nodemon, e obter 
o recurso de auto-refrash. É necessário instalar o Nodemon globalmente e adicionar o perfil de debug:
```javascript
{
    ...
    "configurations": [
        {
            ...
            "restart": true,
            "runtimeExecutable": "nodemon",
            "console": "integratedTerminal"
        }
    ]
}
```