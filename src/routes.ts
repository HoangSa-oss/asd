import { Application } from "express";
import { authRoutes } from "./features/auth/routes/authRoutes";
import { serverAdapter } from "./shared/service/queue/base.queue";
import { currentUserRoutes } from "./features/auth/routes/currentRoutes";



export default (app:Application)=>{
    const router = ()=>{
        app.use('/queues',serverAdapter.getRouter())
        app.use('/api/v1',authRoutes.routes())
        app.use('/api/v1', authRoutes.signoutRoute());
        app.use('/api/v1', currentUserRoutes.routes());

    }
    router()
}