import mongoose from "mongoose";
import { DB_NAME } from "../constents.js";

const conectdb = async () => {
    try {
      let intance =  await mongoose.connect(`${process.env.MONGODB}/${DB_NAME}`)
      console.log("mongo is connected");
    } catch (error) {
        console.log("connect db err = ",error);
        process.exit(1)
    }
}

export default conectdb