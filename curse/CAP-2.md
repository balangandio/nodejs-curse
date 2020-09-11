# Cap 2

# 018 Destructuring
--> Elementos de um array podem ser atribuídos diretamente a variáveis através do destructuring:
```javascript
const [host, port] = ['127.0.0.1', 4242];
```

# 019 Async Code - Promises
--> Promises podem ser utilizadas para evitarem encadeamentos que degradam o entendimento do código:
```javascript
const fetchData = (callback) => {
    setTimeout(() => callback('done!'), 1500);
};

fetchData(result => {
    console.log(`1: ${result}`);

    fetchData(result => {
        console.log(`2: ${result}`);
    });
});
```

--> Com promise:
```javascript
const fetchData = () => {
    return new Promise((res, rej) => setTimeout(() => res('done!'), 1500));
};

fetchData().then(result => {
    console.log(`1: ${result}`);
    return fetchData();
}).then(result => {
    console.log(`2: ${result}`);
});
```
