const http = require('http')

const hostname = '127.0.0.1'
const port = 3000

const server = http.createServer((req, res) => {
    if (req.url === '/') {
        res.statusCode = 200
        res.setHeader('Content-Type', 'text/plain')
        res.end('Hello Sumit')
    } else if(req.url === '/login'){
        res.statusCode = 200
        res.setHeader('Content-Type', 'text/plain')
        res.end('login')
    }else{
        res.statusCode = 404
        res.setHeader('Content-Type', 'text/plain')
        res.end('not found')
    }
})

server.listen(port, hostname, () => {
    console.log(`server listen at http://${hostname}:${port}`)
})