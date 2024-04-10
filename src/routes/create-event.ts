import {z} from 'zod';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { generateSlug } from '../utills/generate-slug';
import { prisma } from '../lib/prisma';
import { FastifyInstance } from 'fastify';
import { BadRequest } from './_errors/bad-request';



export async function createEvent(app: FastifyInstance) {

    app
        .withTypeProvider<ZodTypeProvider>()
        .post('/events', {
            schema:{
                summary:"Create an event", // swagger ui
                tags:['events'], // swagger ui
        //dessa forma o prórpio fastify faz a validação dos dados
                body:z.object({
                    title: z.string().min(4), 
        //para indicar que o texto precisa ser string : {invalid_type_error:'O título precisa ser um texto '} dentro de string()

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
            throw new BadRequest("Já existe evento com esse título.")
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
