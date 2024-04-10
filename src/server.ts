// ORM  Prisma

// fastify - URL microframework
import fastify from "fastify";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUI from "@fastify/swagger-ui";
import fastifyCors from "@fastify/cors";


import {serializerCompiler, validatorCompiler, jsonSchemaTransform, ZodTypeProvider} from 'fastify-type-provider-zod'
import { createEvent } from "./routes/create-event";
import { registerForEvent } from "./routes/register-for-event";
import { getEvent } from "./routes/get-event";
import { getAttendeeBadge } from "./routes/get-attendee-badge";
import { checkIn } from "./routes/check-in";
import { getEventAttendees } from "./routes/get-event-attendees";
import { json } from "stream/consumers";
import { errorHandler } from "./error-handler";

// REST -api retorna dados via JSON
//Métodos HTTP ...
//Corpo da requisição (request body, post/put)
//Parâmetros de busca (search params/ query params, get)
//Parâmetros de rota (route params, get,put,delete)
//Cabeçalhos (headers, informmações 'fixas' do backend) 

//SQLite é salvo em arquivos físicos

export const app = fastify().withTypeProvider<ZodTypeProvider>()

app.register(fastifyCors, {
    origin: '*', // qualquer URL pode acessar a api
})

app.register(fastifySwagger, {
    swagger: {
    //todos os dados enviados e recebidos pela api serão em json
        consumes: ['application/json'],
        produces:['application/json'],
        info:{
            title:'pass.in',
            description:"Especificações da API para o back-end da aplicação pass.in construída durante o NLW Unite da Rocketseat.",
            version:'1.0.0'
        },
    },
    transform: jsonSchemaTransform,
//transforma em json os dados criados de schema 
})

app.register(fastifySwaggerUI, {
    routePrefix:'/docs',
})

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.register(createEvent)
app.register(registerForEvent)
app.register(getEvent)
app.register(getAttendeeBadge)
app.register(checkIn)
app.register(getEventAttendees)

app.setErrorHandler(errorHandler)



app.listen({port: 3333, host:'0.0.0.0'}).then(()=>{
    console.log("HTTP server running!")
})
//alguma coisa que pode demorar é uma promise
//then ativa quando a função carregar
//db relacional