const db = require('../util/database');


class Product {
    constructor(properties) {
        this.id = properties.id;
        this.title = properties.title;
        this.imageUrl = properties.imageUrl;
        this.description = properties.description;
        this.price = properties.price;
    }

    save() {
        if (this.id == undefined) {
            return db.execute(`
                INSERT INTO products 
                    (title, price, imageUrl, description) 
                VALUES (?,?,?,?)
            `, [this.title, this.price, this.imageUrl, this.description]);
        } else {
            return db.execute(`
                UPDATE products SET
                    title=?, price=?, imageUrl=?, description=? 
                WHERE id = ?
            `, [this.title, this.price, this.imageUrl, this.description, this.id]);
        }
    }

    delete() {
        return db.execute('DELETE FROM products WHERE products.id = ?', [this.id]);
    }

    static fetchAll() {
        return db.execute('SELECT * FROM products')
            .then(([rows, metaData]) => rows.map(row => new Product(row)));
    }

    static findById(id) {
        return db.execute('SELECT * FROM products WHERE products.id = ?', [id])
            .then(([rows, metaData]) => rows.map(row => new Product(row))[0]);
    }

}

module.exports = Product;
