// express is a fast, unopinionated, minimalist web framework for node js
import express from 'express'

const app = express()
const port = 3000
app.use(express.json())

const todos = []
let id = 1
app.post('/create-todo', (req,res) => {
    const {title} = req.body
    todos.push({id : id++, title : title, isComplete : false})
    res.status(201).json({status: "success", message : "todos send successfully", data : {}})

})

app.get('/get-all-todos', (req,res) => {
    res.status(201).json({status: "success", message : "todos send successfully", data : todos})
})


app.listen(port, () => {
    console.log(`server listen at port ${port}`)
})

