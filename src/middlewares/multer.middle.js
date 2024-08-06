import multer from "multer"

const storage = multer.diskStorage({
    destination: function (req, file, cd) {
        cd(null, "./public/temt")
    },
    filename: function (req, file, cd) {
        cd(null, file.originalname)
    }
})

export const upload = multer({
 storage
})