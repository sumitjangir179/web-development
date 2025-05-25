import { asyncHandler } from '../utiles/asyncHandler.js'
import { ApiError } from '../utiles/ApiError.js'
import { User } from '../models/user.models.js'
import { uploadToCloudinary } from '../utiles/cloudnary.js'
import { ApiResponse } from '../utiles/ApiResponse.js'
import jwt from 'jsonwebtoken'

const generateAccessAndRefreshToken = async (userId) => {

    try {
        const user = await User.findById(userId)

        if (!user) {
            throw new ApiError(404, 'User not found')
        }

        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }
    } catch (error) {
        throw new ApiError(500, 'Something went wrong while generating refresh and access tokens')
    }


}

const registerUser = asyncHandler(async (req, res) => {
    const { fullName, email, username, password } = req.body

    if ([fullName, email, username, password].some((field) => field?.trim() === '')) {
        throw new ApiError(400, 'All fields are required')
    }

    const existingUser = await User.findOne({ $or: [{ username }, { email }] })

    if (existingUser) {
        throw new ApiError(409, 'User with this email or username already exists')
    }

    console.log("files", req.files)

    const avatarLocalPath = req.files?.avatar?.[0]?.path
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path

    if (!avatarLocalPath) {
        throw new ApiError(400, 'Avatar file is missing')
    }

    // const avatar = await uploadToCloudinary(avatarLocalPath)
    // console.log("avatar", avatar)

    // let coverImage = ""
    // if(coverImageLocalPath){
    //     coverImage = await uploadToCloudinary(coverImageLocalPath)
    // }

    let avatar;

    try {
        avatar = await uploadToCloudinary(avatarLocalPath)
        console.log("uploaded avatar", avatar)
    } catch (error) {
        console.log("Error uploading avatar", error)
        throw new ApiError(500, 'Failed to upload avatar')

    }

    let coverImage;

    try {
        coverImage = await uploadToCloudinary(coverImageLocalPath)
        console.log("uploaded coverImage", coverImage)
    } catch (error) {
        console.log("Error uploading coverImage", error)
        throw new ApiError(500, 'Failed to upload coverImage')

    }

    try {
        const user = await User.create({ fullName, email, username: username.toLowerCase(), password, avatar: avatar?.url, coverImage: coverImage?.url || "" })

        const createdUser = await User.findById(user._id).select('-password -refreshToken')

        if (!createdUser) {
            throw new ApiError(500, 'Something went wrong while registering user')
        }

        return res.status(200).json(new ApiResponse(201, createdUser, 'User created successfully'))
    } catch (error) {
        console.log("Error creating user", error)

        if (avatar) {
            await deleteFromCloudinary(avatar.public_id)
        }

        if (coverImage) {
            await deleteFromCloudinary(coverImage.public_id)
        }

        throw new ApiError(500, 'Something went wrong while registering user and images are deleted')
    }

})

const loginUser = asyncHandler(async (req, res) => {
    const { email, username, password } = req.body

    if ([email, username, password].some((field) => field?.trim() === '')) {
        throw new ApiError(400, 'All fields are required')
    }

    const user = await User.findOne({ $or: [{ username: username.toLowerCase() }, { email }] })

    if (!user) {
        throw new ApiError(404, 'User not found')
    }

    const isPasswordCorrect = await user.isPasswordCorrect(password)

    if (!isPasswordCorrect) {
        throw new ApiError(401, 'Invalid credentials')
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    if (!loggedInUser) {
        throw new ApiError(500, 'Something went wrong while logging in user')
    }

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
    }


    //since mobile doest not have considered cookies we are sending them as headers in response
    return res.status(200).cookie('refreshToken', refreshToken, options).cookie('accessToken', accessToken, options).json(new ApiResponse(201, { user: loggedInUser, accessToken, refreshToken }, 'User logged in successfully'))

})

const refreshAccesToken = asyncHandler(async (req, res) => {
    const incomeingRefreshToken = req.cookies.refreshToken || req.body.refreshAccesToken

    if (!incomeingRefreshToken) {
        throw new ApiError(401, 'Refresh token is required')
    }

    try {
        const decodedToken = jwt.verify(incomeingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
        const user = await User.findById(decodedToken?._id)

        if (!user) {
            throw new ApiError(401, 'Invalid refresh token')
        }

        if (incomeingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, 'Invalid refresh token')
        }

        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
        }

        const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshToken(user?._id)

        return res.status(200).cookie('accessToken', accessToken, options).cookie('refreshToken', newRefreshToken, options).json(new ApiResponse(200, { accessToken, refreshToken: newRefreshToken }, "Refresh token updated"))


    } catch (error) {
        throw new ApiError(500, 'Something went wrong while refreshing access token')
    }

})

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(req.user._id, { $set: { refreshToken: undefined } }, { new: true })

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
    }

    return res.status(200)
        .clearCookie('accessToken', options)
        .clearCookie('refreshToken', options)
        .json(new ApiResponse(200, {}, 'User logged out successfully'))
})

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body

    if ([currentPassword, newPassword].some((field) => field?.trim() === '')) {
        throw new ApiError(400, 'All fields are required')
    }

    const user = await User.findById(req.user._id)

    const isPasswordValid = await user.isPasswordCorrect(currentPassword)

    if (!isPasswordValid) {
        throw new ApiError(401, 'Invalid current password')
    }

    user.password = newPassword
    await user.save({ validateBeforeSave: false })
    
    return res.status(200)
    .json(new ApiResponse(200, {}, 'Password changed successfully'))

})

const getCurrentUser = asyncHandler(async (req, res) => {
    return res.status(200).json(new ApiResponse(200, res.user, 'User found successfully'))
})




export { registerUser, loginUser, refreshAccesToken, logoutUser, changeCurrentPassword }