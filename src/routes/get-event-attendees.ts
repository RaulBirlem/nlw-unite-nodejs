import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../lib/prisma";
import { checkIn } from "./check-in";




export async function getEventAttendees(app: FastifyInstance) {
    app
    .withTypeProvider<ZodTypeProvider>()
    .get('/events/:eventId/attendees', {
        schema: {
            params: z.object({
                eventId: z.string().uuid(),
            }),
            querystring: z.object({
                query: z.string().nullish(),
    //nullish -> undefined ou null
    //index da página atual
                pageIndex: z.string().nullish().default('0').transform(Number),
            }),
            response:{
    //tipagem de rota
               200: z.object({
                attendees: z.array(
                    z.object({
                        id: z.number(),
                        name:z.string(),
                        email:z.string().email(),
                        createdAt:z.date(),
                        checkedInAt: z.date().nullable(),
                    })
                )
               })
            },
        }
    }, async(request, reply) => {
        const { eventId} = request.params
        const {pageIndex, query} = request.query
        
    //buscar todos os participantes do evento
        
        const attendees = await prisma.attendee.findMany({
            select:{
                id:true,
                name:true,
                email:true,
                createdAt:true,
                checkIn: {
                    select: {
                        createdAt: true
                    }
                }
            },
    //se tiver algo no input de busca ele retorna como o name
            where: query ? {
                eventId,
                name:{
                    contains: query,
                }
            } : {
                eventId,
            },
    //retorna 10 itens por página
            take: 10,
            skip: pageIndex * 10,
            orderBy: {
                createdAt: 'desc'
            }
        })

        return reply.send({
            attendees: attendees.map(attendee => {
                return {
                    id: attendee.id,
                    name: attendee.name,
                    email: attendee.email,
                    createdAt: attendee.createdAt,
                    checkedInAt: attendee.checkIn?.createdAt ?? null,
    //acessa o createdAt apenas se o checkIn não for null se não tiver retorna null
                }
            })
        })

    })
}