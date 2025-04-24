// express is a fast, unopinionated, minimalist web framework for node js
import express from 'express'

const app = express()
const port = 3005

app.get('/', (req,res) => {
    res.send('Hello world!')
})

app.get('/ice-tea', (req,res) => {
    res.send('Hello Ice Tea!')
})


app.listen(port, () => {
    console.log(`server listen at port ${port}`)
})

