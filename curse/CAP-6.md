# Cap 6

# 077 Sharing Data Across Requests - Users
--> Quando armazenamos valores proveniente de requisições em uma variável ou estrutura de dados, 
estamos fazendo uso de um escopo global da aplicação.
```javascript
var cards = [];

router.post('/card', (req, res, next) => {
    cards.push(req.body);

    res.send('Your card: ' + cards[cards.lenght - 1]);
});
```
--> Isso implica que potencialmente dados sensíveis possam ser compartilhado entre diferentes acessos.

# 078 Templating Engines - An Overview
--> Um template engine é uma ferramenta que permite produzir conteúdos dinâmicos a partir da definição 
de um template e utilização de uma síntaxe que delimita onde dados são nele introduzidos.

--> Existe uma oferta grande de template engines para utilização com Node.js: EJS, Pug, Handlebars, etc.

# 079 Installing - Implementing Pug
--> Install: `npm install --save pug`

--> Definição de um arquivo template: `views/shop.pug`
```pug
<!DOCTYPE html>
html(lang="en")
    head
        meta(charset="UTF-8")
        meta(name="viewport", content="width=device-width, initial-scale=1.0")
        meta(http-equiv="X-UA-Compatible", content="ie=edge")
        title My Shop
        link(rel="stylesheet", href="/css/main.css")
        link(rel="stylesheet", href="/css/product.css")
    body
        header.main-header
            nav.main-header__nav
                ul.main-header__item-list
                    li.main-header__item
                        a.active(href="/") Shop
                    li.main-header__item
                        a(href="/admin/add-product") Add Product

```
--> Express.js oferece um maneira padronizada para utilização de template engines. É necessário primeiro 
definir a utilização com o método `app.set()`:
```javascript
app.set('view engine', 'pug');
app.set('views', 'views');
```
* `app.set('views', <dir>)` define o diretório onde o Pug ira procurar os templates de extensão `.pug`. 
Por padrão `./views` já é pré-definido.

--> O uso do template é feito com o método `res.render()` do objeto que encapsula a responsta.
```javascript
router.post('/card', (req, res, next) => {
    res.render('shop');
});
```

# 080 Outputting Dynamic Content
--> O conteúdo acessível ao contexto do template é informado como parâmetroem `res.render()`:
```javascript
router.post('/card', (req, res, next) => {
    res.render('shop', {prods: products, title: 'test'});
});
```
--> A utilização no template:
```pug
html
    body
        main
            if prods.length > 0
                .grid
                    each product in prods
                        article.card.product-item
                            header.card__header
                                h1.product__title #{product.title}
                            div.card__image
                                img(src="...", alt="A Book")
                            div.card__content
                                h2.product__price $19.99
                                p.product__description A very interesting book about...
                            .card__actions
                                button.btn Add to Cart
            else
                h1 No Products
```
* O nível de identação indica a hierarquia dos elementos HTML.
* Um elemento é descrito pela sua tag, attrs, classNames e innerText. Quando a tag não é informada: div
* A escrita de um valor é feita com a síntaxe: `#{ <js expression> }`
* Condicionais: `if prods.length > 0` e `else`
* Iteração: `each product in prods`

# 083 Adding a Layout
--> Pug oferece uma síntaxe para extensão entre template files. Em um arquivo `views/layouts/main-layout.pug` 
podemos definir:
```pug
<!DOCTYPE html>
html(lang="en")
    head
        meta(charset="UTF-8")
        meta(name="viewport", content="width=device-width, initial-scale=1.0")
        meta(http-equiv="X-UA-Compatible", content="ie=edge")
        title #{pageTitle}
        link(rel="stylesheet", href="/css/main.css")
        block styles
    body   
        header.main-header
            nav.main-header__nav
                ul.main-header__item-list
                    li.main-header__item
                        a(href="/", class=(path === '/' ? 'active' : '')) Shop
                    li.main-header__item
                        a(href="...", class=(path === '/admin/add-product' ? 'active' : '')) Add Product
        block content
```
* `block <name>` identifica uma regiões que potencialmente são substituidas por conteúdo de outro arquivo.
* O escopo do arquivo será o mesmo do arquivo que fará a sua extensão.

--> Em um arquivo `views/404.pug`:
```pug
extends layouts/main-layout.pug

block content
    h1 Page Not Found!
```
* `extends <template location>` identifica o arquivo que será extendido.
* `block <name>` identifica o conteúdo que será introduzido no layout extendido.

# 085 Working with Handlebars
--> Handlebars é um template engine que se difere de Pug por utilizar síntaxe do próprio HTML. Install:
```
npm install --save express-handlebars
```

--> Configuração:
```javascript
const expressHbs = require('express-handlebars');

const app = express();

app.engine('hbs', expressHbs());
app.set('view engine', 'hbs');
```
* O nome da extensão dos arquivos manipulados pela engine é o mesmo nome definido em `app.engine()`.

# 086 Converting our Project to Handlebars
--> Handlebars utiliza uma extensão do HTML:
```html
<main>
    {{#if hasProducts }}
    <div class="grid">
        {{#each prods}}
        <article class="card product-item">
            <header class="card__header">
                <h1 class="product__title">{{ this.title }}</h1>
            </header>
            <div class="card__image">
                <img src="..."
                    alt="A Book">
            </div>
            <div class="card__content">
                <h2 class="product__price">$19.99</h2>
                <p class="product__description">A very interesting book about so many even more interesting things!</p>
            </div>
            <div class="card__actions">
                <button class="btn">Add to Cart</button>
            </div>
        </article>
        {{/each}}
    </div>
    {{ else }}
    <h1>No Products Found!</h1>
    {{/if}}
</main>
```
* Valores são escritos com: `{{ <js expression> }}`
* Condicionais não realizam avaliação booleana, apenas recebem true/false: `{{#if hasProducts }}`, `{{ else }}`, `{{/if}}`
* Iterações: `{{#each prods}}`, `{{/each}}`
* A variável de iteração é this: `{{ this.title }}`

# 087 Adding the Layout to Handlebars
--> Handlebars ofere um recurso de extensão entre diferentes arquivos. É necessário primeiro definir qual o diferetório 
onde os arquivos de layout residem, e o arquivo padrão:
```javascript
const expressHbs = require('express-handlebars');

app.engine('hbs', expressHbs({ layoutDir: 'views/layouts/', defaultLayout: 'main-layout', extname: 'hbs' }));
app.set('view engine', 'hbs');
```
* `extname` identifica a extensão que os arquivos de layout têm.

--> Um arquivo de layout apresenta somente uma região que poderá ter conteúdo introduzido por outros arquivos:
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>{{ pageTitle }}</title>
    <link rel="stylesheet" href="/css/main.css">
    {{#if formsCSS}}
        <link rel="stylesheet" href="/css/forms.css">
    {{/if}}
</head>
    <body>
        <header class="main-header">
            <nav class="main-header__nav">
                <ul class="main-header__item-list">
                    <li class="main-header__item"><a class="{{#if activeShop }}active{{/if}}" href="/">Shop</a></li>
                </ul>
            </nav>
        </header>
        {{{ body }}}
    </body>
</html>
```
* `{{{ body }}}` identifica a região de introdução de conteúdo.

--> Nos arquivos correspondentes às views, consta apenas o conteúdo que será incluído no layout:
```html
<main>
    <form class="product-form" action="/admin/add-product" method="POST">
        <div class="form-control">
            <label for="title">Title</label>
            <input type="text" name="title" id="title">
        </div>

        <button class="btn" type="submit">Add Product</button>
    </form>
</main>
```

# 088 Working with EJS
--> EJS é a template engine. Install:
```
npm install --save ejs
```
--> Para utilizá-lo é necessário:
```javascript
app.set('view engine', 'ejs');
```
--> EJS utiliza uma extensão do HTML:
```html
<html>
    <head>...</head>
    <body>
        <% if (prods.length > 0) { %>
            <div class="grid">
                <% for (let product of prods) { %>
                    <article class="card product-item">
                        <header class="card__header">
                            <h1 class="product__title"><%= product.title %></h1>
                        </header>
                        <div class="card__image">
                            <img src="..."
                                alt="A Book">
                        </div>
                        <div class="card__content">
                            <h2 class="product__price">$19.99</h2>
                            <p class="product__description">A very interesting book...</p>
                        </div>
                        <div class="card__actions">
                            <button class="btn">Add to Cart</button>
                        </div>
                    </article>
                <% } %>
            </div>
        <% } else { %>
            <h1>No Products Found!</h1>
        <% } %>
    </body>
</html>
```
* Síntaxe para excrita de texto: `<%= <value> %>`
* A Síntaxe `<%=` realiza o code escape para previnir a execução de indevida de scripts.
* Síntaxe para condicionais e iterações é: `<% <js expression> %>`
* Diferentemente de outras engine, com EJS a própria linguagem javascript é utilizada entre o texto HTML.

# 089 Working on the Layout with Partials
--> EJS não utiliza um mecanismo de extensão de arquivo de layouts. Todavia oferece um recurso de inclusão 
de partials. Em um arquivo `views/includes/head.ejs` podemos ter:
```html
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title><%= pageTitle %></title>
    <link rel="stylesheet" href="/css/main.css">
```
--> No arquivo de inclusão `views/404.ejs`:
```html
<%- include('includes/head.ejs') %>
</head>
<body>
    <h1>Page Not Found!</h1>
</body>
</html>
```
* `include('includes/head.ejs')` realiza a inclusão do partial definindo a localização do arquivo.
* A síntaxe `<%-` sinaliza que o conteúdo não deve sofre code escape (diferentemente de ``<%=`).