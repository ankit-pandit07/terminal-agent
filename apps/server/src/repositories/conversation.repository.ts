import { prisma } from "../../db/prisma.js";

export class ConversationRepository{
    async create(message:string, response:string){
        return prisma.conversation.create({
            data:{
                message,
                response,
            }
        })
    }

    async findAll(){
        return prisma.conversation.findMany({
            orderBy:{
                createdAt:"desc",
            }
        });
    }
    async findById(id:string){
        return prisma.conversation.findUnique({
            where:{
                id,
            }
        })
    }
    async findRecent(limit=10){
        return prisma.conversation.findMany({
            take:limit,
            orderBy:{
                createdAt:"desc"
            }
        })
    }
}