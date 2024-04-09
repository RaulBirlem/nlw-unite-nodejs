import {z} from 'zod';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { generateSlug } from '../utills/generate-slug';
import { prisma } from '../lib/prisma';
import { FastifyInstance } from 'fastify';



export async function createEvent(app: FastifyInstance) {

    app
        .withTypeProvider<ZodTypeProvider>()
        .post('/events', {
            schema:{
        //dessa forma o prórpio fastify faz a validação dos dados
                body:z.object({
                    title: z.string().min(4),
                    details: z.string().nullable(),
                    maximumAttendees: z.number().int().positive().nullable(),
                }),
                //podemos validar a resposta :
                response: {
                    201: z.object({
                        eventId: z.string().uuid(),
                    })
                },
            }
        }, async (request, reply) =>{
        
        
        // validação no body com zod
        const {
            title,
            details,
            maximumAttendees
        } = request.body
        //verifica se o conteúdo em body segue a estrutura de
        //createEventSchema com o title, details e maximumAttendees
        
        
        const slug = generateSlug(title)
        
        
        
        const eventWithSameSlug = await prisma.event.findUnique({
            where:{
                slug,
            }
        })
        
        if(eventWithSameSlug !== null){
            throw new Error("Já existe evento com esse título.")
        }
        
        const event = await prisma.event.create({
            data: {
                // criar as colunas do db
                title,
                details,
                maximumAttendees,
                slug,
            },
        })
        
        return reply.status(201).send({eventId: event.id})
        })
        
        
        
        
        
        
    }
