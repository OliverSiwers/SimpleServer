const http = require('http');
const fs = require('fs/promises');
const path = require('path');

const mimeTypes = [
    // Text types
    { type: "text/css", ext: [".css"] },
    { type: "text/html", ext: [".html", ".htm"] },
    { type: "text/javascript", ext: [".js", ".mjs"] },

    // Image types
    { type: "image/apng", ext: [".apng"] },
    { type: "image/avif", ext: [".avif"] },
    { type: "image/gif", ext: [".gif"] },
    { type: "image/jpeg", ext: [".jpeg", "jpg", "jfif", "pjpeg", "pjp"] },
    { type: "image/png", ext: [".png"] },
    { type: "image/svg", ext: [".svg+xml"] },
    { type: "image/webp", ext: [".webp"] },

    // Application types
    { type: "application/wasm", ext: [".wasm", ".wasm.gz", ".wasm.br"] },
];

const encodings = [
    { encoding: "gzip", ext: [".wasm.gz"] },
    { encoding: "br", ext: [".wasm.br"] },
];

const allowURIEncoding = process.env.ALLOW_URI_ENCODING ?? true;
const rootPath = process.env.ROOT ?? '.';
const port = process.env.PORT ?? 80;
const hostname = process.env.HOSTNAME ?? 'localhost';

function greeting() {
    console.log('\n+------------------------------------------------+');
    console.log('|         Simple Server by Oliver Siwers         |');
    console.log('+------------------------------------------------+');
    console.log(`| ALLOW_URI_ENCODING   :   ${allowURIEncoding}`.padEnd(49, ' ') + '|');
    console.log(`| ROOT                 :   ${rootPath}`.padEnd(49, ' ') + '|');
    console.log(`| PORT                 :   ${port}`.padEnd(49, ' ') + '|');
    console.log(`| HOSTNAME             :   ${hostname}`.padEnd(49, ' ') + '|');
    console.log('+------------------------------------------------+\n');
}

function res404(res) {
    res.writeHead(404);
    res.end('404');
};

function log(msg) {
    console.log(`\x1b[36m[${new Date().toLocaleString()}]\x1b[39m ${msg}`);
}

function startServer() {
    console.log("Server Status: Starting");
    http.createServer(async (req, res) => {
        // --- Path cleaning---
        const decodedPath = allowURIEncoding ? decodeURI(req.url) : req.url;

        if (decodedPath.indexOf('\0') !== -1) return res404();

        const safePath = path.normalize(decodedPath).replace(/\.{2,}/g, '');
        let finalPath = rootPath + safePath;

        if (finalPath.match(/(\/|\\)[^\.]*$/)) finalPath += 'index.html';

        log(`GET ${finalPath}`);

        // --- Content-Type --- 
        mimeTypes.every((type) => {
            if (type.ext.some(fileExtension => finalPath.endsWith(fileExtension))) {
                res.appendHeader('Content-Type', `${type.type}; charset=utf-8`);
                return false;
            }
            return true;
        });

        // --- Content-Encoding ---
        encodings.every((type) => {
            if (type.ext.some(fileExtension => finalPath.endsWith(fileExtension))) {
                res.appendHeader('Content-Encoding', `${type.encoding}`);
                return false;
            }
            return true;
        });

        // --- Response ---
        try {
            res.end(await fs.readFile(finalPath));
        } catch (e) {
            res404(res);
            console.log(e);
            log(`\x1b[31mFile not found: ${finalPath}`);
        }
    }).listen(port, hostname, () => {
        console.log("\x1b[F\x1b[2KServer Status: Running\n");
    });
}

(function main() {
    greeting();
    startServer();
})();

