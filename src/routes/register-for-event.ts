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
                    //retorna os registros onde eventId e email são iguais
                }
            })


            if(attendeeFromEmail !== null) {
                throw new Error("Este email já está cadastrado!")
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