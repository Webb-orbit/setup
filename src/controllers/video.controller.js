import { Video } from "../module/video.model.js";
import { apiarr } from "../utiles/apierr.js";
import { apires } from "../utiles/apires.js";
import { uploadoncloue } from "../utiles/cloud.js";
import { promicehan } from "../utiles/promice.js";

const uploadvideo = promicehan(async (req, res)=>{
    const {title, description} = req.body
    console.log(req.files);
    
    
    if ([title, description].some((e)=> e?.trim() === "")) {
        throw new apiarr(400, "all field are required")
    }

    const localvideofile = req.files?.videofile[0].path
    const localthumnailfile = ""
    if (!localvideofile && !localthumnailfile) {
        throw new apiarr(400, "all files are required")
    }

    const videores = await uploadoncloue(localvideofile)
    console.log(videores);
    
    const thumnailres = await uploadoncloue(localthumnailfile)

    if (!videores && !thumnailres) {
        throw new apiarr(400, "all files are required")
    }

    const createvider = await Video.create({
        title,
        description,
        videofile: videores.url,
        thumnail: thumnailres?.url || "helllo",
        duration: videores?.duration
    })

    if (!createvider) {
        throw new apiarr(500, "server error")
    }

    return res.status(200)
    .json(new apires(200, {data:createvider}, "video uploaded"))
})

export {uploadvideo}