import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

const app = express()

// common middlewares
app.use(cors({origin : process.env.CORS_ORIGIN, credentials : true}))
app.use(express.json({limit : '50mb'}))
app.use(express.urlencoded({limit : '50mb', extended : true}))
app.use(express.static('public'))
app.use(cookieParser())


//routes
import healthCheckRoute  from './routes/healthcheck.routes.js'
import userRoute from './routes/user.routes.js'
import { errorHandler } from './middlewares/error.middlewares.js'

app.use('/api/v1/healthcheck', healthCheckRoute)
app.use('/api/v1/users', userRoute)


app.use(errorHandler)
export { app }