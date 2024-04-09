
// fastify - URL microframework
import fastify from "fastify";

// REST -api retorna dados via JSON
//Métodos HTTP ...
//Corpo da requisição (request body, post/put)
//Parâmetros de busca (search params/ query params, get)
//Parâmetros de rota (route params, get,put,delete)
//Cabeçalhos (headers, informmações 'fixas' do backend) 


const app = fastify()


app.get('/',()=>{
    return "Hello NLW Unite"
})


app.get('/users',()=>{
    return "Hello NLW Unite Teste"
})












app.listen({port: 3333}).then(()=>{
    console.log("HTTP server running!")
})
//alguma coisa que pode demorar é uma promise
//then ativa quando a função carregar
