const mongodb = require('mongodb');

const { getDb } = require('../util/database');


const ObjectId = mongodb.ObjectID;

class User {

    constructor(username, email, cart, id) {
        this.name = username
        this.email = email;
        this.cart = cart;
        this._id = id;
    }

    save() {
        const db = getDb();
        return db.collection('users')
            .insertOne(this);
    }

    addToCart(product) {
        const cartProductIndex = this.cart.items.findIndex(cp => {
            return cp.productId.toString() === product._id.toString();
        });

        let newQuantity = 1;
        const updatedCartItems = [...this.cart.items];

        if (cartProductIndex >= 0) {
            newQuantity = this.cart.items[cartProductIndex].quantity + 1;
            updatedCartItems[cartProductIndex].quantity = newQuantity;
        } else {
            updatedCartItems.push({
                productId: ObjectId(product._id),
                quantity: newQuantity
            });
        }

        const updatedCart = { items: updatedCartItems };
        
        const db = getDb();
        return db.collection('users')
            .updateOne({ _id: ObjectId(this._id) }, {
                $set: {
                    cart: updatedCart
                }
            });
    }

    getCart() {
        const db = getDb();
        const productIds = this.cart.items.map(item => item.productId);
        return db.collection('products')
            .find({ _id: {$in: productIds} })
            .toArray()
            .then(products => {
                return products.map(p => {
                    return {
                        ...p,
                        quantity: this.cart.items
                            .find(i => i.productId.toString() === p._id.toString())
                            .quantity
                    };
                });
            }).then(products => {
                if (products.length < this.cart.items.length) {
                    const existingSet = new Set(products.map(p => p._id.toString()));
                    
                    this.cart = {
                        items: this.cart.items.filter(i => existingSet.has(i.productId.toString()))
                    };

                    return db.collection('users')
                        .updateOne({ _id: ObjectId(this._id) }, { $set: { cart: this.cart } })
                        .then(() => products);
                }

                return products;
            });
    }

    deleteItemFromCart(prodId) {
        const updatedCartItems = this.cart.items.filter(item => {
            return item.productId.toString() !== prodId.toString();
        });

        const db = getDb();
        return db.collection('users')
            .updateOne({ _id: ObjectId(this._id) }, {
                $set: {
                    cart: { items: updatedCartItems }
                }
            });
    }

    addOrder() {
        const db = getDb();
        return this.getCart()
            .then(products => {
                const order = {
                    items: products,
                    user: { _id: ObjectId(this._id), name: this.name }
                };

                return db.collection('orders').insertOne(order);
            }).then(() => {
                const newCart = { items: [] };
                this.cart = newCart;

                return db.collection('users')
                    .updateOne({ _id: ObjectId(this._id) }, {
                        $set: { cart: newCart }
                    });
            });
    }

    getOrders() {
        const db = getDb();
        return db.collection('orders')
            .find({ 'user._id': ObjectId(this._id) })
            .toArray();
    }

    static findById(userId) {
        const db = getDb();
        return db.collection('users')
            .findOne({ _id: ObjectId(userId) })
            .then(props => new User(props.name, props.email, props.cart, props._id));
    }

}

module.exports = User;
