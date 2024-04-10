import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../lib/prisma";

export async function registerForEvent(app: FastifyInstance) {
    app
        .withTypeProvider<ZodTypeProvider>()
        .post('/events/:eventId/attendees', {
            schema: {
                body: z.object({
                    name: z.string().min(4),
                    email: z.string().email(),
                }),

                params: z.object({
                    eventId: z.string().uuid(),
                }),
                response: {
                    201: z.object({
                        attendeeId: z.number(),
                    })
                }
            }
        }, async (request, reply) => {
            const { eventId } = request.params
            const {name, email} = request.body

    //verifica se o email já esta cadastrado em um evento
            const attendeeFromEmail = await prisma.attendee.findUnique({
                where: {
                    eventId_email: {
                        email,
                        eventId
                    }
                }
            })
    //retorna os registros onde eventId e email são iguais

    //se o email já tiver cadastro no evento retorna um alerta

            if(attendeeFromEmail !== null) {
                throw new Error("Este email já está cadastrado!")
            }





    //  limitar os participantes em um evento


    // colocar as duas promisses(event e amountOfAttendeesForEvent) para rodar ao mesmo tempo:
            const [event,amountOfAttendeesForEvent] = await Promise.all([
                prisma.event.findUnique({
                    where: {
                        id: eventId,
                    }
                }),
                prisma.attendee.count({
                    where: {
                        eventId,
                    }
                })
            ])            
            
            if(event?.maximumAttendees && amountOfAttendeesForEvent >= event?.maximumAttendees) {
    //se o evento tiver limite de participantes e ele ultrapassar o limite retorna um alerta
                throw new Error("O número máximo de participantes já foi atendido!")
            }


            const attendee = await prisma.attendee.create({
                data: {
                    name,
                    email,
                    eventId
                }
            })

            return reply.status(201).send({attendeeId: attendee.id})
        })
}