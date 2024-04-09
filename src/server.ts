
// fastify - URL microframework
import fastify from "fastify";



const app = fastify()
//alguma coisa que pode demorar é uma promise
//then ativa quando a função carregar
















app.listen({port: 3333}).then(()=>{
    console.log("HTTP server running!")
})