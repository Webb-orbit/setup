import { v2 } from "cloudinary"
import fs from "fs"

v2.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
})

const uploadoncloue = async (fileurl) => {
    try {
        if (!fileurl) return null
        const res = await v2.uploader.upload(fileurl, {
            resource_type: "auto",
            media_metadata: true
        })
        fs.unlinkSync(fileurl)
        return res
    } catch (error) {
        fs.unlinkSync(fileurl)
        return null
    }
}

const deleteoncloud = async(fileid)=>{
    try {
        if (!fileid) return null
        const res = await v2.uploader.destroy(fileid, {
            resource_type: "raw"
        })
        return res
    } catch (error) {
        return null
    }
}

export {uploadoncloue, deleteoncloud}