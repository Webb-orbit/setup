import dotenv from "dotenv"
import conectdb from "./db/index.js";
import { app } from "./app.js";

dotenv.config({path:"./env"})

conectdb()
.then(()=>{
    app.listen(process.env.PORT || 3000, ()=>{
        console.log("app started");
    })
})
.catch((e)=>{
    console.log(e);
})