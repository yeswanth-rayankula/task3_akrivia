const crypto = require('crypto-js');

// Decrypt the request body
function decryptRequestBody(req, res, next) {
  
    if (req.body && req.method=="PUT" ) {
        try {
            const bytes = crypto.AES.decrypt(req.body, "10");
            const decryptedString = bytes.toString(crypto.enc.Utf8);

            if (!decryptedString) {
                throw new Error('Decrypted string is empty or invalid');
            }

            req.body = JSON.parse(decryptedString);
        } catch (err) {
            console.error('Decryption error:', err);
            return res.status(400).json({ error: 'Failed to decrypt data' });
        }
    }
 
    next();
}

// Encrypt the response body
function encryptResponseBody(req, res, next) {
    const send = res.send;
    res.send = function (body) {
        if (body) {
            try {
                const encryptedData = crypto.AES.encrypt(JSON.stringify(body), "10").toString();
                body = { encryptedData };
            } catch (err) {
                console.error('Encryption error:', err);
                return res.status(500).json({ error: 'Failed to encrypt data' });
            }
        }
        send.call(this, body);
    };
    
    next();
}

module.exports = { decryptRequestBody, encryptResponseBody };
