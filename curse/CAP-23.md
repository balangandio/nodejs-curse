# Cap 23

# 349 How Payments Work
--> A implementação de etapas de pagamento em uma aplicação é uma tarefa complexa. Usualmente são 
utilizadas empresas e ferramentas terceiras dedicadas a este trabalho:
* Coletar método de pagamento;
* Verificar método de pagamento;
* Cobrar método de pagamento;
* Gerenciar pagamentos;
* Processar ordems de pagamento.

--> `Stripe` é uma solução que auxília neste processo de integração da aplicação à métodos de pagamento.
* Primeiramente a interface cliente coleta as informações do usuário, como número do cartão de crédito;
* E então solicita ao serviço na núvem da Stripe o token de validação das informações;
* Com o token, o backend da aplicação envia uma solicitação de cobrança novamente para a Stripe.
* E por fim, a aplicação processa a confirmação do pagamento.

# 351 Using Stripe in Your App
--> Após criar uma conta na plataforma Stripe, é possivel obter uma API key para teste. Na interface do 
cliente, um formulário de coleta de dados de cartão de crédito pode ser adicionado com:
```html
<form action="/create-order" method="POST">
    <script
        src="https://checkout.stripe.com/checkout.js" class="stripe-button"
        data-key="pk_test_i6b537msoXqRsJFwQwCm9tR1"
        data-amount="<%= totalSum * 100 %>"
        data-name="Your Order"
        data-description="All the items you ordewred"
        data-image="https://stripe.com/img/documentation/checkout/marketplace.png"
        data-locale="auto"
        data-currency="usd">
    </script>
</form>
```
* `data-key`: API key fornecida na plataforma Stripe;
* `data-currency`: moeda da cobrança;
* `data-amount`: total em centavos da cobrança;
* `action="/create-order"`: rota de retorno da aplicação.

--> O formulário é renderizado como um botão que quando acionado abre um popup de coleta de dados de 
cartão de crédito. Quando confirmado, o popup solicita à Stripe a verificação dos dados, e por fim aciona 
a rota informada por `action=""` passando como parâmetro o token de confirmação. Esta requisição não possui 
o token CSRF, o que faz necessário abrir uma exceção na sua verificação para a rota.

--> No backend, a API da Stripe pode ser utilizada com ajuda do pacote `stripe`:
* Install: `npm install --save stripe`

--> Uso:
```javascript
router.post('/create-order', (req, res, next) => {
    const stripe  = require('stripe')('pk_test_i6b537msoXqRsJFwQwCm9tR1');

    const { stripeToken } = req.body;
    const total = 1000;
    const orderId = '42';

    const chargeRequest = stripe.charges.create({
        amount: totalSum * 100,
        currency: 'usd',
        description: 'Demo Order',
        source: stripeToken,
        metadata: { someTrackInfo: orderId }
    });
});
```
* A importação do módulo retorna uma função que recebe a uma API key fornecida pela plataforma;
* O token de confirmação dos dados do cliente é informado no parâmetro `stripeToken` da requisição;
* `stripe.charges.create()` faz a requisição da cobrança;
* `metadata: { }` pode ser utilizado para anexar metadados à cobrança, que fica registrada na plataforma.
