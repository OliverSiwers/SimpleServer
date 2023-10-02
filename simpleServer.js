const http = require('http');
const fs = require('fs/promises');
const path = require('path');

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

function startServer() {
    console.log('Starting the server...');
    http.createServer(async (req, res) => {
        const decodedPath = allowURIEncoding ? decodeURI(req.url) : req.url;

        if (decodedPath.indexOf('\0') !== -1) return res404();

        const safePath = path.normalize(decodedPath).replace(/\.{2,}/g, '');
        let finalPath = rootPath + safePath;


        if (finalPath.match(/(\/|\\)[^\.]*$/)) finalPath += 'index.html';

        console.log(`[${new Date()}] ${finalPath}`);
   
        try {
            if(finalPath.endsWith('.gz')) res.appendHeader('Content-Encoding', 'gzip');
            if(finalPath.endsWith('.wasm.gz')) res.appendHeader('Content-Type', 'application/wasm');

            res.end(await fs.readFile(finalPath));
        } catch {
            res404(res);
        }
    }).listen(port, hostname, () => {
        console.log('\x1b[F\x1b[2KServer is running');
    });
}

(function main() {
    greeting();
    startServer();
})();

