const mongoose=require("mongoose");
require("dotenv").config();  

const connectData=async()=>{
    try {
        await mongoose.connect(process.env.URL)
        console.log("connect succesfully");
    } catch (error) {
        console.log("Can not connect");
       
    }
}

module.exports=connectData