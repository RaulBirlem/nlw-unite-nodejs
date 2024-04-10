"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/server.ts
var server_exports = {};
__export(server_exports, {
  app: () => app
});
module.exports = __toCommonJS(server_exports);
var import_fastify = __toESM(require("fastify"));
var import_swagger = __toESM(require("@fastify/swagger"));
var import_swagger_ui = __toESM(require("@fastify/swagger-ui"));
var import_cors = __toESM(require("@fastify/cors"));
var import_fastify_type_provider_zod = require("fastify-type-provider-zod");

// src/routes/create-event.ts
var import_zod = require("zod");

// src/utills/generate-slug.ts
function generateSlug(text) {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");
}

// src/lib/prisma.ts
var import_client = require("@prisma/client");
var prisma = new import_client.PrismaClient({
  log: ["query"]
  // a cada query retorna um log
});

// src/routes/_errors/bad-request.ts
var BadRequest = class extends Error {
};

// src/routes/create-event.ts
async function createEvent(app2) {
  app2.withTypeProvider().post("/events", {
    schema: {
      summary: "Create an event",
      // swagger ui
      tags: ["events"],
      // swagger ui
      //dessa forma o prórpio fastify faz a validação dos dados
      body: import_zod.z.object({
        title: import_zod.z.string().min(4),
        //para indicar que o texto precisa ser string : {invalid_type_error:'O título precisa ser um texto '} dentro de string()
        details: import_zod.z.string().nullable(),
        maximumAttendees: import_zod.z.number().int().positive().nullable()
      }),
      //podemos validar a resposta :
      response: {
        201: import_zod.z.object({
          eventId: import_zod.z.string().uuid()
        })
      }
    }
  }, async (request, reply) => {
    const {
      title,
      details,
      maximumAttendees
    } = request.body;
    const slug = generateSlug(title);
    const eventWithSameSlug = await prisma.event.findUnique({
      where: {
        slug
      }
    });
    if (eventWithSameSlug !== null) {
      throw new BadRequest("J\xE1 existe evento com esse t\xEDtulo.");
    }
    const event = await prisma.event.create({
      data: {
        // criar as colunas do db
        title,
        details,
        maximumAttendees,
        slug
      }
    });
    return reply.status(201).send({ eventId: event.id });
  });
}

// src/routes/register-for-event.ts
var import_zod2 = __toESM(require("zod"));
async function registerForEvent(app2) {
  app2.withTypeProvider().post("/events/:eventId/attendees", {
    schema: {
      summary: "Register an attendee",
      // swagger ui
      tags: ["attendees"],
      // swagger ui
      body: import_zod2.default.object({
        name: import_zod2.default.string().min(4),
        email: import_zod2.default.string().email()
      }),
      params: import_zod2.default.object({
        eventId: import_zod2.default.string().uuid()
      }),
      response: {
        201: import_zod2.default.object({
          attendeeId: import_zod2.default.number()
        })
      }
    }
  }, async (request, reply) => {
    const { eventId } = request.params;
    const { name, email } = request.body;
    const attendeeFromEmail = await prisma.attendee.findUnique({
      where: {
        eventId_email: {
          email,
          eventId
        }
      }
    });
    if (attendeeFromEmail !== null) {
      throw new BadRequest("Este email j\xE1 est\xE1 cadastrado!");
    }
    const [event, amountOfAttendeesForEvent] = await Promise.all([
      prisma.event.findUnique({
        where: {
          id: eventId
        }
      }),
      prisma.attendee.count({
        where: {
          eventId
        }
      })
    ]);
    if (event?.maximumAttendees && amountOfAttendeesForEvent >= event?.maximumAttendees) {
      throw new BadRequest("O n\xFAmero m\xE1ximo de participantes j\xE1 foi atendido!");
    }
    const attendee = await prisma.attendee.create({
      data: {
        name,
        email,
        eventId
      }
    });
    return reply.status(201).send({ attendeeId: attendee.id });
  });
}

// src/routes/get-event.ts
var import_zod3 = __toESM(require("zod"));
async function getEvent(app2) {
  app2.withTypeProvider().get("/events/:eventId", {
    schema: {
      summary: "Get an event",
      // swagger ui
      tags: ["events"],
      // swagger ui
      params: import_zod3.default.object({
        eventId: import_zod3.default.string().uuid()
      }),
      response: {
        //tipagem de rota
        200: import_zod3.default.object({
          event: import_zod3.default.object({
            id: import_zod3.default.string().uuid(),
            title: import_zod3.default.string(),
            slug: import_zod3.default.string(),
            details: import_zod3.default.string().nullable(),
            maximumAttendees: import_zod3.default.number().int().nullable(),
            attendeesAmount: import_zod3.default.number().int()
          })
        })
      }
    }
  }, async (request, reply) => {
    const { eventId } = request.params;
    const event = await prisma.event.findUnique({
      select: {
        id: true,
        title: true,
        slug: true,
        details: true,
        maximumAttendees: true,
        _count: {
          select: {
            attendees: true
          }
        }
      },
      where: {
        id: eventId
      }
    });
    if (event === null) {
      throw new BadRequest("Evento n\xE3o encontrado!");
    }
    return reply.status(200).send({
      event: {
        id: event.id,
        title: event.title,
        slug: event.slug,
        details: event.details,
        maximumAttendees: event.maximumAttendees,
        attendeesAmount: event._count.attendees
      }
    });
  });
}

// src/routes/get-attendee-badge.ts
var import_zod4 = require("zod");
async function getAttendeeBadge(app2) {
  app2.withTypeProvider().get("/attendees/:attendeeId/badge", {
    schema: {
      summary: "Get an attendee badge",
      // swagger ui
      tags: ["attendees"],
      // swagger ui
      params: import_zod4.z.object({
        attendeeId: import_zod4.z.coerce.number().int()
      }),
      response: {
        200: import_zod4.z.object({
          badge: import_zod4.z.object({
            name: import_zod4.z.string(),
            email: import_zod4.z.string().email(),
            eventTitle: import_zod4.z.string(),
            checkInURL: import_zod4.z.string().url()
          })
        })
      }
    }
  }, async (request, reply) => {
    const { attendeeId } = request.params;
    const attendee = await prisma.attendee.findUnique({
      select: {
        name: true,
        email: true,
        event: {
          select: {
            title: true
          }
        }
      },
      where: {
        id: attendeeId
      }
    });
    if (attendee === null) {
      throw new BadRequest("Participante n\xE3o encontrado.");
    }
    const baseURL = `${request.protocol}://${request.hostname}`;
    const checkInURL = new URL(`/attendees/${attendeeId}/check-in`, baseURL);
    return reply.send({
      badge: {
        name: attendee.name,
        email: attendee.email,
        eventTitle: attendee.event.title,
        checkInURL: checkInURL.toString()
      }
    });
  });
}

// src/routes/check-in.ts
var import_zod5 = __toESM(require("zod"));
async function checkIn(app2) {
  app2.withTypeProvider().get("/attendees/:attendeeId/check-in", {
    schema: {
      summary: "Check-in an attendee",
      // swagger ui
      tags: ["check-ins"],
      // swagger ui
      params: import_zod5.default.object({
        attendeeId: import_zod5.default.coerce.number().int()
      }),
      response: {
        // tipagem da resposta
        201: import_zod5.default.null()
      }
    }
  }, async (request, reply) => {
    const { attendeeId } = request.params;
    const attendeeCheckIn = await prisma.checkIn.findUnique({
      where: {
        attendeeId
      }
    });
    if (attendeeCheckIn !== null) {
      throw new BadRequest("Voc\xEA j\xE1 fez o seu  check-in!");
    }
    await prisma.checkIn.create({
      data: {
        attendeeId
      }
    });
    return reply.status(201).send();
  });
}

// src/routes/get-event-attendees.ts
var import_zod6 = __toESM(require("zod"));
async function getEventAttendees(app2) {
  app2.withTypeProvider().get("/events/:eventId/attendees", {
    schema: {
      summary: "Get event attendees",
      // swagger ui
      tags: ["events"],
      // swagger ui
      params: import_zod6.default.object({
        eventId: import_zod6.default.string().uuid()
      }),
      querystring: import_zod6.default.object({
        query: import_zod6.default.string().nullish(),
        //nullish -> undefined ou null
        //index da página atual
        pageIndex: import_zod6.default.string().nullish().default("0").transform(Number)
      }),
      response: {
        //tipagem de rota
        200: import_zod6.default.object({
          attendees: import_zod6.default.array(
            import_zod6.default.object({
              id: import_zod6.default.number(),
              name: import_zod6.default.string(),
              email: import_zod6.default.string().email(),
              createdAt: import_zod6.default.date(),
              checkedInAt: import_zod6.default.date().nullable()
            })
          )
        })
      }
    }
  }, async (request, reply) => {
    const { eventId } = request.params;
    const { pageIndex, query } = request.query;
    const attendees = await prisma.attendee.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        checkIn: {
          select: {
            createdAt: true
          }
        }
      },
      //se tiver algo no input de busca ele retorna como o name
      where: query ? {
        eventId,
        name: {
          contains: query
        }
      } : {
        eventId
      },
      //retorna 10 itens por página
      take: 10,
      skip: pageIndex * 10,
      orderBy: {
        createdAt: "desc"
      }
    });
    return reply.send({
      attendees: attendees.map((attendee) => {
        return {
          id: attendee.id,
          name: attendee.name,
          email: attendee.email,
          createdAt: attendee.createdAt,
          checkedInAt: attendee.checkIn?.createdAt ?? null
          //acessa o createdAt apenas se o checkIn não for null se não tiver retorna null
        };
      })
    });
  });
}

// src/error-handler.ts
var import_zod7 = require("zod");
var errorHandler = (error, request, reply) => {
  if (error instanceof import_zod7.ZodError) {
    return reply.status(400).send({
      message: "Error during validation",
      errors: error.flatten().fieldErrors
    });
  }
  if (error instanceof BadRequest) {
    return reply.status(400).send({ message: error.message });
  }
  return reply.status(500).send({ message: "Internal server error" });
};

// src/server.ts
var app = (0, import_fastify.default)().withTypeProvider();
app.register(import_cors.default, {
  origin: "*"
  // qualquer URL pode acessar a api
});
app.register(import_swagger.default, {
  swagger: {
    //todos os dados enviados e recebidos pela api serão em json
    consumes: ["application/json"],
    produces: ["application/json"],
    info: {
      title: "pass.in",
      description: "Especifica\xE7\xF5es da API para o back-end da aplica\xE7\xE3o pass.in constru\xEDda durante o NLW Unite da Rocketseat.",
      version: "1.0.0"
    }
  },
  transform: import_fastify_type_provider_zod.jsonSchemaTransform
  //transforma em json os dados criados de schema 
});
app.register(import_swagger_ui.default, {
  routePrefix: "/docs"
});
app.setValidatorCompiler(import_fastify_type_provider_zod.validatorCompiler);
app.setSerializerCompiler(import_fastify_type_provider_zod.serializerCompiler);
app.register(createEvent);
app.register(registerForEvent);
app.register(getEvent);
app.register(getAttendeeBadge);
app.register(checkIn);
app.register(getEventAttendees);
app.setErrorHandler(errorHandler);
app.listen({ port: 3333, host: "0.0.0.0" }).then(() => {
  console.log("HTTP server running!");
});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  app
});
