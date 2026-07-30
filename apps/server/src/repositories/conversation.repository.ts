import { prisma } from "../../db/prisma.js";

export class ConversationRepository{
    async create(title:string){
        return prisma.conversation.create({
            data:{
                title,
            }
        })
    }

    async findAll(){
        return prisma.conversation.findMany({
            orderBy:{
                updatedAt:"desc",
            }
        });
    }
    async findById(id:string){
        return prisma.conversation.findUnique({
            where:{
                id,
            },
            include: {
                messages:{
                    orderBy:{
                        createdAt:"asc"
                    }
                },
                executions:{
                    orderBy:{
                        startedAt:"desc"
                    }
                }
            }
        })
    }

    async delete(id:string){
        return prisma.conversation.delete({
            where:{id},
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