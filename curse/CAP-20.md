# Cap 20 - File Upload - Download

# 315 Handling Multipart Form Data
--> O pacote `body-parser` somente lida com conteúdos `application/x-www-form-urlencoded`, 
pares de chave valor.

--> Para realizar o parse de formulários incluíndo o upload de arquivos, `multipart/form-data`, 
o pacote `multer` pode ser utilizado.
* Install: `npm install --save multer`

# 316 Handling File Uploads with Multer
--> Multer é utilizado registrando seu middleware com a propriedade `name` do input destinado ao upload 
de arquivo:
```javascript
const multer = require('multer');

app.use(multer().single('imageFile'));
```
* `imageFile` seria o name do html input:
```html
<input type="file" name="imageFile">
```
* É possível destinar um diretório de destino para os arquivos:
```javascript
app.use(multer({ dest: 'uploaded-images' }).single('imageFile'));
```

--> O arquivo enviado é por padrão armazenado em memória e fica disponibilizado no objeto `req.file`:
```javascript
app.post('/upload', (req, res, next) => {
    const { originalname, mimetype, buffer } = req.file;
});
```

# 317 Configuring Multer to Adjust Filename - Filepath
--> O armazenamento dos envios no sistema de arquivos pode ser configurado de maneira mais específica:
```javascript
const multer = require('multer');

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploaded-images'),
    filename: (req, file, cb) => cb(null, `${new Date().toISOString()}-${file.originalname}`)
});

app.use(multer({ storage: fileStorage }).single('imageFile'));
```
* `destination`: callback que define o diretório no sistema de arquivos;
* `filename`: callback que define o nome dos arquivos;
* No objeto `req.file` a propriedade `path` corresponde ao filename atribuido pelo callback.

# 318 Filtering Files by Mimetype
--> O parse de arquivos pode ser restringido com filters:
```javascript
const multer = require('multer');

const mimetypeFilter = (req, file, cb) => {
    const isAccepted = file.mimetype === 'image/png';
    cb(null, isAccepted);
};

app.use(multer({ fileFilter: mimetypeFilter }).single('imageFile'));
```
* Quando um arquivo não é aceito no filter, o objeto `req.file` fica indefinido.

# 321 Serving Images Statically
--> Um diretório de upload pode ser configurado como acessível publicamente em um path:
```javascript
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'uploaded-images')));
```
* `/images` corresponde ao path na URL que identifica o diretório;
* `uploaded-images` corresponde ao diretório onde estão os arquivos;
* Na propriedade `src`:
```html
<img src="/images/<%= product.fileName %>">
```

# 322 Downloading Files with Authentication
--> Arquivos podem ser disponibilizados para download com:
```javascript
app.post('/orders', (req, res, next) => {
    const { orderId } = req.params;
    const fileName = `ìnvoice-${orderId}.pdf`;
    const filePath = path.join('data', 'invoices', fileName);

    fs.readFile(filePath, (err, data) => {
        if (err) {
            return next(err);
        }

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.send(data);
    });
});
```
* A abertura do arquivo pelo próprio browser pode ser autorizada com `inline` disposition:
```javascript
res.setHeader('Content-Disposition', `inline; filename="${fileName}"`);
```
* `fs.readFile` irá copiar todo o conteúdo do arquivo para a memória, o que não é interessante ao 
lidar com arquivos grandes.

# 325 Streaming Data vs Preloading Data
--> `fs.createReadStream()` permite criar uma stream de leitura. Essa stream pode ser 
utilizada para ler o conteúdo de um arquivo e imediatamente escrever a resposta à requisição, não 
sobrecarregando a memória com o mesmo:
```javascript
app.post('/orders', (req, res, next) => {
    const { orderId } = req.params;
    const fileName = `ìnvoice-${orderId}.pdf`;
    const filePath = path.join('data', 'invoices', fileName);

    const file = fs.createReadStream(filePath);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    file.pipe(res);
});
```
* A stream oferece a função `pipe()` que realiza a sua leitura e escrita do dado em outra outra stream;
* Objeto `res` é também uma stream de escrita.

# 326 Using PDFKit for .pdf Generation
--> `PDFkit` é um pacote bastante popular na plataforma Node, que permite gerar arquivos pdf:
* Install: `npm install --save pdfkit`

--> Uso:
```javascript
const PDFDocument = require('pdfkit');

const file = fs.createReadStream(filePath);

const pdfDoc = new PDFDocument();
pdfDoc.pipe(file);
pdfDoc.text('Hello human!');
pdfDoc.end();
```
* `PDFDocument` é também uma stream de leitura;
* `pdfDoc.end()` sinaliza que a stream foi encerrada, completando a execução de `pipe()`.

# 328 Deleting Files
--> Arquivos pode ser deletados com `fs.unlink()`:
```javascript
const fs = require('fs');

fs.unlink(filePath, err => {
    if (err) {
        throw err;
    }
    console.log('done');
});
```