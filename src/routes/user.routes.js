import { Router } from "express"
import { changepassword, getuser, getuserchannal, getwatchhistory, loginuser, logoutuser, refereshaccesstokan, resgesteruser, updateaccdetaill, updateavater, updatecover } from "../controllers/users.comtroller.js"
import { upload } from "../middlewares/multer.middle.js"
import { varifyjwt } from "../middlewares/user.middle.js"

const router = Router()

router.route("/register").post(
    upload.fields([{ name: 'avatar', maxCount:1}, { name: 'cover', maxCount:1}]),
    resgesteruser
)

router.route("/login").post(loginuser)
router.route("/logout").post( varifyjwt, logoutuser)
router.route("/refreshtoken").post(refereshaccesstokan)
router.route("/changepassword").post(varifyjwt, changepassword)
router.route("/getcurrentuser").get(varifyjwt, getuser)
router.route("/update").patch(varifyjwt, updateaccdetaill)

router.route("/updateavatar").patch(varifyjwt, upload.single("avatar"), updateavater)
router.route("/updatecover").patch(varifyjwt, upload.single("cover"), updatecover)

router.route("/channal/:username").get(varifyjwt, getuserchannal)
router.route("/watchistory").get(varifyjwt, getwatchhistory)

export default router