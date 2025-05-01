import express from 'express'
import cors from 'cors'

const app = express()

// common middlewares
app.use(cors({origin : process.env.CORS_ORIGIN, credentials : true}))
app.use(express.json({limit : '50mb'}))
app.use(express.urlencoded({limit : '50mb', extended : true}))
app.use(express.static('public'))

//routes
import healthCheckRoute  from './routes/healthcheck.routes.js'

app.use('/api/v1/healthcheck', healthCheckRoute)

export { app }