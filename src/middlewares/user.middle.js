import { User } from "../module/user.model.js";
import { apiarr } from "../utiles/apierr.js";
import { promicehan } from "../utiles/promice.js";
import jwt from "jsonwebtoken"

export const varifyjwt = promicehan(async(req, res, next)=>{
try {    
        const accestoken = req.cookies?.accesstoken || req.header("Authorization")?.replace("Bearer ","")
    
        if (!accestoken) {
            throw new apiarr(401, "un authorizaed")
        }
    
        const decoeded = jwt.verify(accestoken, process.env.ACCESS_TOKEN_SECRET)
    
        const user = await User.findById(decoeded._id).select("-password -refreshtokan")
    
        if (!user) {
            throw new apiarr(401, "invalied accestoken")
        }
        
        req.user = user
        next()
} catch (error) {
    throw new apiarr(401, "something went wrong", error)
}
})