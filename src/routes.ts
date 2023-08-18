import { Application } from "express";
<<<<<<< HEAD

export default (app:Application)=>{
    const router = ()=>{}
=======
import { authRoutes } from "./features/auth/routes/authRoutes";

export default (app:Application)=>{
    const router = ()=>{
        app.use('/api/v1',authRoutes.routes())
    }
>>>>>>> a5fc5ff (hihi)
    router()
}