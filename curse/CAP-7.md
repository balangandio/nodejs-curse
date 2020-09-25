# Cap 7

# 094 Adding Controllers
--> O padrão de projeto MVC também se aplica a projetos Node.js. 

--> É comum separar uma pasta `controllers` onde ficam arquivos contendo funções responsáveis por 
receber as requisições e fazer interface com os dados, `models`, do projeto.
```javascript
exports.getProducts = (req, res, next) => {
    res.render('shop', {
        prods: products, pageTitle: 'Shop', path: '/'
    });
};
```
--> Ainda fazendo parte dos controladores da aplicação, é destinado em uma pasta `routes` arquivos 
identificando as rotas e suas respectivas funções de tratamento exportadas dos `controllers`.
```javascript
const { getProducts } = require('../controllers/products');

const router = express.Router();
router.get('/', getProducts);
module.exports = router;
```

# 096 Adding a Product Model
--> Em uma pasta `modules` pode ser definido os modelos do negócio assim como o acesso aos dados.
```javascript
const products = [];

module.exports = class Product {
    constructor(t) {
        this.title = t;
    }

    save() {
        products.push(this);
    }

    static fetchAll() {
        return products;
    }
}
```
