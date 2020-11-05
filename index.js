const Express = require('express');
const app = Express();
const port = 3000;
const bodyParser = require("body-parser");
const fs = require('fs');
const crypto = require('crypto');
let multer = require('multer');
let upload = multer();
const algorithm = 'aes-192-cbc';
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(upload.any());
app.use(Express.static('public'));

app.post('/crypt', (req, res) => {
    const password = `${req.body.key}`;
    const key = crypto.scryptSync(password, 'salt', 24);
    const cipher = crypto.createCipher(algorithm, key);

    let id = `${Math.floor(Math.random() * 100000)}` + '.sak';

    fs.appendFile(`${id}`, `${password}`, function (err) {
        if (err) throw err;
        console.log('File saved! --- 1');
    })
    let encrypted = '';
    cipher.on('readable', () => {
        let chunk;
        while (null !== (chunk = cipher.read())) {
            encrypted += chunk.toString('hex');
        }
    });

    cipher.on('end', () => {
        res.download(__dirname + `/${id}`, `${id}`);
        console.log('File send! --- 2');
        res.send(encrypted);

        // # - For remove file (Optional)
                // fs.unlink(__dirname + `/${id}`, (err) => {
        //     if (err) {
        //         console.error(err)
        //         return
        //     }
        // })
    });
    cipher.write(`${req.body.message}`);
    setTimeout(function () {cipher.end()}, 1000);
});

app.post('/encript', (req, res) => {
    const password = req.files[0].buffer.toString();
    const key = crypto.scryptSync(password, 'salt', 24);
    const criptedMessage = req.body.message;
    const decipher = crypto.createDecipher(algorithm, key);
    let decrypted = '';
    decipher.on('readable', () => {
        while (null !== (chunk = decipher.read())) {
            decrypted += chunk.toString('utf8');
        }
    });
    decipher.on('end', () => {
        res.send(decrypted);
    });
    const text = criptedMessage.toString('utf8');
    decipher.write(text, 'hex');
    decipher.end();
});

app.listen(port, () => {
    console.log(`app listening on port ${port}`);
});
