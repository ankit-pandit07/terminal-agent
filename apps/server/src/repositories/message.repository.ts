import { prisma } from "../../db/prisma.js";
import { Role } from "@prisma/client";

export class MessageRepository{
    async create(
        conversationId:string,
        role:Role,
        content:string,
    ) {
        return prisma.message.create({
            data:{
                conversationId,
                role,
                content,
            }
        })
    }

    async findByConversation(conversationId:string){
        return prisma.message.findMany({
            where:{
                conversationId,
            },
            orderBy:{
                createdAt:"asc"
            }
        })
    }

    async findRecent(
        conversationId:string,
        limit=10,
    ){
        return prisma.message.findMany({
            where:{
                conversationId
            },
            orderBy:{
                createdAt:"desc"
            },
            take:limit,
        })
    }

    async deleteByConversation(conversationId:string){
        return prisma.message.deleteMany({
            where:{
                conversationId,
            }
        })
    }
}