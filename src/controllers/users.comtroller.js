import { promicehan } from "../utiles/promice.js";
import { apiarr } from "../utiles/apierr.js";
import { User } from "../module/user.model.js";
import { deleteoncloud, uploadoncloue } from "../utiles/cloud.js";
import { apires } from "../utiles/apires.js";
import jwt from "jsonwebtoken"
import mongoose from "mongoose";

const options = {
    httpOnly: true,
}

const extractFileName = (url) => {
    const parts = url.split('/');
    const filename = parts[parts.length - 1];
    const fileId = filename.split('.')[0];
    return fileId;
};

const generateaccandrestokan = async (userid) => {
    try {
        const client = await User.findById(userid)
        const accesstoken = client.generaeasstokan()
        const refereshtoken = client.generaterefrashtokan()

        client.refreshtokan = refereshtoken
        await client.save({ validateBeforeSave: false })

        return { accesstoken, refereshtoken }
    } catch (error) {
        throw new apiarr(500, "something went wrong", error)
    }
}


const resgesteruser = promicehan(async (req, res) => {
    const { username, email, fullname, password } = req.body
    if ([username, email, fullname, password].some((e) => e?.trim() === "")) {
        throw new apiarr(400, "all filds are required")
    }

    const exuser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (exuser) {
        throw new apiarr(409, "same username and email is exsited")
    }
    console.log(req.files);

    const avatarfilepath = req.files?.avatar[0]?.path
    //    const coverfilepath = req.files?.cover[0]?.path
    const coverfilepath = ""

    if (!avatarfilepath) {
        throw new apiarr(400, "avatar is required")
    }

    const avatarres = await uploadoncloue(avatarfilepath)
    const coverres = await uploadoncloue(coverfilepath)

    if (!avatarres) {
        throw new apiarr(400, "avatar is required")
    }

    const createduser = await User.create({
        fullname,
        avatar: avatarres.url,
        cover: coverres?.url || "",
        username,
        email,
        password,
    })

    const finaluser = await User.findById(createduser._id).select(
        "-password -refreshtokan"
    )

    if (!finaluser) {
        throw new apiarr(500, "server is crashed :: user not register")
    }

    res.status(400).json(new apires(200, finaluser, "user is created"))

})

const loginuser = promicehan(async (req, res) => {
    const { username, email, password } = req.body

    if (!username && !email) {
        throw new apiarr(400, "username and email is required")
    }

    const user = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (!user) {
        throw new apiarr(404, "user not found")
    }

    const passwordchack = await user.isPasswordCorrect(password)

    if (!passwordchack) {
        throw new apiarr(401, "passwored is in correct")
    }

    const { accesstoken, refereshtoken } = await generateaccandrestokan(user._id)
    console.log("accesstoken, refereshtoken= ", accesstoken, refereshtoken);


    const currentuser = await User.findById(user._id).select("-password -refreshtokan");

    return res
        .status(200)
        .cookie("accesstoken", accesstoken, options)
        .cookie("refereshtoken", refereshtoken, options)
        .json(new apires(200, { user: currentuser, refereshtoken, accesstoken }, "user login sussesfully"))
})

const logoutuser = promicehan(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshtokan: 1
            }
        },
        {
            new: true
        }
    )

    res.status(400)
        .clearCookie("accesstoken", options)
        .clearCookie("refereshtoken", options)
        .json(new apires(200, {}, "user log outed"))

})

const refereshaccesstokan = promicehan(async (req, res) => {
    const RFtokan = req.cookies.refereshtoken || req.body.refereshtoken

    if (!RFtokan) {
        throw new apiarr(401, "user not sign id")
    }

    const decodedtokan = jwt.verify(RFtokan, process.env.REFERISH_TOKEN_SECRET)

    const user = await User.findById(decodedtokan._id)

    if (!user) {
        throw new apiarr(401, "invalid RF tokan")
    }

    if (RFtokan !== user.refreshtokan) {
        throw new apiarr(401, "RF tokan is expired")
    }

    const { accesstoken, refereshtoken } = await generateaccandrestokan(user._id)
    return res.status(200)
        .cookie("accesstoken", accesstoken, options)
        .cookie("refereshtoken", refereshtoken, options)
        .json(new apires(200, { tokens: accesstoken, refereshtoken }, "regenerated refreshed token"))
})

const changepassword = promicehan(async (req, res) => {
    const { oldpassword, newpassword } = req.body
    console.log(oldpassword, newpassword);
    

    const client = await User.findById(req.user._id)
    const passwordcorrected = await client.isPasswordCorrect(oldpassword)

    if (!passwordcorrected) {
        throw new apiarr(401, "passwored is incorrect")
    }

    client.password = newpassword
    await client.save({ validateBeforeSave: false })

    return res.status(200)
        .json(new apires(200, {}, "password was changed"))
})

const getuser = promicehan(async (req, res) => {
    return res
    .status(200)
    .json(new apires(200, {user: req.user}, "your corrent user"))
})

const updateaccdetaill = promicehan(async (req, res) => {
    const { email, fullname } = req.body

    if (!email && !fullname) {
        throw apiarr(400, "all fildes are required")
    }

    const updater = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                email,
                fullname
            }
        },
        { new: true }
    ).select("-password")

    if (!updater) {
        throw apiarr(400, "something is wirnge")
    }

    res.status(200)
        .json(new apires(200, { updater }, "user acc is updated"))
})

const updateavater = promicehan(async (req, res) => {

    const fileidfordelete = extractFileName(req.user.avatar)
    const newavater = req.file?.path

    if (!newavater) {
        throw new apiarr(400, "avatar file is not found")
    }

    const uploadavater = await uploadoncloue(newavater)

    if (!uploadavater.url) {
        throw new apiarr(400, "err on uploading file")
    }

    const updateavatar = await User.findByIdAndUpdate(
        req.user._id,
        {
            avatar: uploadavater.url
        },
        { new: true }
    ).select("-password")

   await deleteoncloud(fileidfordelete)

    return res.status(200)
        .json(new apires(200, { updateavatar }, "update avatar photo"))
})

const updatecover = promicehan(async (req, res) => {
    const newcover = req.file?.path
    if (!newcover) {
        throw new apiarr(400, "avatar file is not found")
    }

    const uploadcover = await uploadoncloue(newcover)

    if (!uploadcover.url) {
        throw new apiarr(400, "err on uploading file")
    }

    const updateedcover = await User.findByIdAndUpdate(
        req.user._id,
        {
            cover: uploadcover.url
        },
        { new: true }
    ).select("-password")

    return res.status(200)
    .json(new apires(200, { updateedcover }, "update avatar photo"))
})

const getuserchannal = promicehan(async (req, res)=>{
    const {username} = req.params
    if (!username?.trim()) {
        throw new apiarr(404,"username is missing")
    }

    const channal = await User.aggregate([
        {
            $match:{
                username: username
            }
        },
        {
            $lookup:{
                from: "Subscription",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup:{
                from:"Subscription",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribed"
            }
        },
        {
            $addFields:{
                subscribercount:{
                    $size: "$subscribers"
                },
                channalcount:{
                    $size: "$subscribed"
                },
                issubscribed:{
                    $cond:{
                        if:{$in: [req.user?._id, "$subscribers.subscriber"]},
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project:{
                username: 1,
                fullname: 1,
                subscribercount: 1,
                channalcount: 1,
                issubscribed: 1,
                avatar: 1,
                cover: 1,
                email: 1,
            }
        }
    ])

    if (!channal?.length) {
        throw new apiarr(404,"channal is not found")
    }

    return res.status(200)
    .json( new apires(200, channal[0], "user channal fetched"))
})

const getwatchhistory = promicehan(async (req, res)=>{
    const user = await User.aggregate([
        {
            $match:{
                _id: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup:{
                from : "videos",
                localField: "watchistory",
                foreignField: "_id",
                as: "watchistory",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project:{
                                        fullname: 1,
                                        username: 1,
                                        avatar: 1,
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields: {
                            owner:{
                                $first: "$owner"
                            }
                        }
                    }
                ]
            }
        }
    ])

    return res.status(200)
    .json(new apires(200, user[0].watchistory, "watch history"))
})

export {
    resgesteruser,
    loginuser,
    logoutuser,
    refereshaccesstokan,
    changepassword,
    getuser,
    updateaccdetaill,
    updateavater,
    updatecover,
    getuserchannal,
    getwatchhistory
}