import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../lib/prisma";
import { BadRequest } from "./_errors/bad-request";






export async function checkIn(app: FastifyInstance) {
    app
        .withTypeProvider<ZodTypeProvider>()
        .get('/attendees/:attendeeId/check-in', {
            schema:{
                summary:"Check-in an attendee", // swagger ui
                tags:['check-ins'], // swagger ui
                params: z.object({
                    attendeeId: z.coerce.number().int()
                }),
                response:{ 
    // tipagem da resposta
                    201: z.null(),
                }
            }
        }, async (request, reply) =>{
            const {attendeeId} = request.params
    //o participante só pode fazer check in em um evento uma vez
            
            const attendeeCheckIn = await prisma.checkIn.findUnique({
                where:{
                    attendeeId,
                }
            })

            if(attendeeCheckIn !== null) {
    // sejá houver check-in retorna erro
                throw new BadRequest("Você já fez o seu  check-in!")
            }

            await prisma.checkIn.create({
                data:{
                    attendeeId,
                }
            })

            return reply.status(201).send()
        })
}