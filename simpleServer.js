const http = require('http');
const fs = require('fs/promises');

const server = http.createServer(async (req, res) => {
    console.log(req.url);
    let path = req.url;
    if (path.endsWith('/')) path += 'index.html';
    try {
        res.end(await fs.readFile('.' + path));
    } catch {
        res.writeHead(404);
        res.end('404');
    }
}).listen(80, 'localhost', () => {
    console.log(server.address());
});