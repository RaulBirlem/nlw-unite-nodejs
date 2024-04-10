// ORM  Prisma
// fastify - URL microframework
import fastify from "fastify";
import {serializerCompiler, validatorCompiler, ZodTypeProvider} from 'fastify-type-provider-zod'
import { createEvent } from "./routes/create-event";
import { registerForEvent } from "./routes/register-for-event";

// REST -api retorna dados via JSON
//Métodos HTTP ...
//Corpo da requisição (request body, post/put)
//Parâmetros de busca (search params/ query params, get)
//Parâmetros de rota (route params, get,put,delete)
//Cabeçalhos (headers, informmações 'fixas' do backend) 

//SQLite é salvo em arquivos físicos

export const app = fastify()

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.register(createEvent)
app.register(registerForEvent)






app.listen({port: 3333}).then(()=>{
    console.log("HTTP server running!")
})
//alguma coisa que pode demorar é uma promise
//then ativa quando a função carregar
//db relacional