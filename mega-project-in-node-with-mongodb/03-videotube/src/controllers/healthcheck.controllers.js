import {asyncHandler} from '../utiles/asyncHandler.js'
import {ApiResponse} from '../utiles/ApiResponse.js'


const healthCheck = asyncHandler(async (req, res) => {
    return res.status(200).json(new ApiResponse(200, 'OK', "Health check passed"))
})

export {healthCheck}