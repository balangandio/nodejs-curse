# Cap 26 - Understanding Async Await in Node.js

# 393 What is Async Await All About
--> A linguagem Javascript possui algumas funcionalidades para manipular código assíncrono. Como Node é 
uma plataforma javascript, é possível fazer uso das mesmas.

# 394 Transforming Then Catch to Async Await
--> Funções assinadas como a keyword `async` tem a capacidade de utilizar a keyword `await` em objetos 
`Promise`, tornando o código visualmente mais exuto. No Express as funções de tratamento de requisição podem 
ser escritas utilizando essas funcionalidades:
```javascript

const handler = async (req, res, next) => {
    const { postId } = req.params;

    try {
        const post = await = Post.findById(postId);

        if (!post) {
            const error = new Error('Post not found!');
            error.statusCode = 404;
            throw error;
        }

        res.status(200).json({ message: 'Post fetched', post });
    } catch(err) {
        next(err);
    }
};

app.post('/post', isAuth, handler);
```
* O tratamento de erros é feito com `try-catch`;
* Na prática, o código `async-await` é traduzido código tradicional de promises, não há execução síncrona.
* `Post.findById(postId)`: Mongoose na verdade retorna um objeto próprio que não é uma `Promise`, mas na 
prática apresenta o mesmo comportamento.