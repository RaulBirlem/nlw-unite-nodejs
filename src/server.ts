// ORM  Prisma
// fastify - URL microframework
import fastify from "fastify";
import {serializerCompiler, validatorCompiler, ZodTypeProvider} from 'fastify-type-provider-zod'
import {z} from 'zod';
//criar evento:
import { PrismaClient } from "@prisma/client";
import {generateSlug} from "../utills/generate-slug"
// REST -api retorna dados via JSON
//Métodos HTTP ...
//Corpo da requisição (request body, post/put)
//Parâmetros de busca (search params/ query params, get)
//Parâmetros de rota (route params, get,put,delete)
//Cabeçalhos (headers, informmações 'fixas' do backend) 

//SQLite é salvo em arquivos físicos

const app = fastify()

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

const prisma = new PrismaClient({
    log:['query'], // a cada query retorna um log
})

    app.withTypeProvider<ZodTypeProvider>()
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











app.listen({port: 3333}).then(()=>{
    console.log("HTTP server running!")
})
//alguma coisa que pode demorar é uma promise
//then ativa quando a função carregar
//db relacional