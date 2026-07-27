import { Router } from "express";

const router=Router();

router.get("/",(_,res)=>{
    res.status(200).json({
        success:true,
        message:"Terminal Agent Backend Running",
         version: "1.0.0",
    })
})
export default router;