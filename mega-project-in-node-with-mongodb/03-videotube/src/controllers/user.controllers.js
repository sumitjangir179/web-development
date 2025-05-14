import { asyncHandler } from '../utiles/asyncHandler.js'
import { ApiError } from '../utiles/ApiError.js'
import { User } from '../models/user.models.js'
import { uploadToCloudinary } from '../utiles/cloudnary.js'
import { ApiResponse } from '../utiles/ApiResponse.js'

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

        if(avatar){
            await deleteFromCloudinary(avatar.public_id)
        }

        if(coverImage){
            await deleteFromCloudinary(coverImage.public_id)
        }

        throw new ApiError(500, 'Something went wrong while registering user and images are deleted')
    }

})

export { registerUser }