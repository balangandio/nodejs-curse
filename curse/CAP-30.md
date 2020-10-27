# Cap 30

# 457 npm - Node.js
--> A plataforma Node basicamente oferece duas grandes ferramentas:
* `node` usado para executar o código javascript e interagir com arquivos;
* `npm` usado para gerenciar pacotes e lançar scripts.

# 458 Using npm
--> A principal funcionalidade do Npm consiste em permitir que funcionalidades isoladas em pacotes sejam 
compartilhadas em um repositório (privado, ou o repositório público da ferramenta) de maneira que outros 
possam integrar aos seus projetos.

--> Ao instalar um pacote, a versão mais recente disponível é utilizada. Para escolher uma versão específica, 
utiliza-se o caracter `@`:
* `npm install package@4.16.3`

--> Pacotes podem depender de outros. Assim, a instalação de um pacote não só consiste na sua própria como 
também na instalação de suas dependências.

# 460 What is a Build Tool
--> A plataforma Node com Npm não só são utilizados para desenvolver aplicações como também para construir 
ferramentas que axiliem o processo de desenvolvimento.

--> As build tools são pacotes que contém programas muitas vezes executados a partir do comando `npm run`, 
que, entre outras coisas, realizam transformações sobre o código a fim de produzir versões retrocompatíveis 
de linguagem ou otimizações de tamanho e performace. Tarefas estas mais associadas a projetos frontend que 
possuem código destinado a execução em browsers.

--> Pacotes de build tools usualmente possuem uma pasta `bin` com arquivos destinados a execução. O comando 
`npm run <script-name>` procura nos pacote da `node-modules` justamente esta pasta e por um arquivo cujo nome 
corresponde ao informado.