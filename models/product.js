const fs = require('fs');
const path = require('path');

const Cart = require('./cart');


const PRODUCTS_FILE = path.join(
    path.dirname(require.main.filename),
    'data',
    'products.json'
);


class Product {
    constructor(properties) {
        this.id = properties.id;
        this.title = properties.title;
        this.imageUrl = properties.imageUrl;
        this.description = properties.description;
        this.price = properties.price;
    }

    save() {
        if (!this.id) {
            this.id = Math.random().toString();
        }

        getProductsFromFile(productList => {
            productList.add(this);
            productList.save();
        });
    }

    delete() {
        getProductsFromFile(productList => {
            productList.delete(this);
            productList.save();

            Cart.deleteProduct(this.id, this.price);
        });
    }

    static fetchAll() {
        return new Promise((res, rej) => {
            getProductsFromFile(products => res(products.list));
        });
    }

    static findById(id) {
        return new Promise((res, rej) => {
            getProductsFromFile(products => {
                res(products.getById(id));
            });
        });
    }

}

class ProductList {
    constructor(list) {
        this.list = list.map(prod => new Product(prod));
    }

    add(product) {
        if (product.id) {
            const existingOne = this.list.findIndex(p => p.id === product.id);

            if (existingOne != -1) {
                this.list[existingOne] = product;
            } else {
                this.list.push(product);
            }
        } else {
            throw 'Empty id property or non-existing';
        }
    }

    delete(product) {
        if (product.id) {
            const index = this.list.findIndex(p => p.id === product.id);

            if (index != -1) {
                this.list.splice(index, 1);
                return true;
            }
        } else {
            throw 'Empty id property or non-existing';
        }

        return false;
    }

    getById(id) {
        return this.list.find(p => p.id === id);
    }

    save() {
        fs.writeFile(
            PRODUCTS_FILE, 
            JSON.stringify(this.list),
            err => console.log(err)
        );
    }
}

const getProductsFromFile = cb => {
    fs.readFile(PRODUCTS_FILE, (err, fileContent) => {
        let products = [];

        if (!err) {
            products = JSON.parse(fileContent);
        }

        cb(new ProductList(products));
    });
};

module.exports = Product;