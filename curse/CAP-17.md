# Cap 17

# 273 Implementing the Token Logic
--> `crypto` é um core module do Node que permite gerar valores randômicos:
```javascript
const crypto = require('crypto');

crypto.randomBytes(32, (err, buffer) => {
    console.log('Random token: ' + buffer.toString('hex'));
});
```

# 275 Creating the Reset Password Form
--> Moogose permite comparar campos Date:
```javascript
User.findOne({ resetTokenExpiration: { $gt: Date.now() } })
    .then(user => {
        console.log(user);
    });
```
