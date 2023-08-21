import { Application } from "express";
import { authRoutes } from "./features/auth/routes/authRoutes";



export default (app:Application)=>{
    const router = ()=>{
        app.use('/api/v1',authRoutes.routes())
    }
    router()
}