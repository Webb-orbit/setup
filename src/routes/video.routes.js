import { upload } from "../middlewares/multer.middle.js";
import { Router } from "express";
import { varifyjwt } from "../middlewares/user.middle.js";
import { uploadvideo } from "../controllers/video.controller.js";

const router = Router()
router.use(varifyjwt)

router.route("/uploadvideo").post(
    upload.fields([
        {name: 'videofile', maxCount:1},
        {name:'thumnail', maxCount:1},
    ]),
    uploadvideo
)

export default router