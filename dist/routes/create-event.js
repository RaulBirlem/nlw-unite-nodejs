"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
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
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/routes/create-event.ts
var create_event_exports = {};
__export(create_event_exports, {
  createEvent: () => createEvent
});
module.exports = __toCommonJS(create_event_exports);
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
async function createEvent(app) {
  app.withTypeProvider().post("/events", {
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  createEvent
});
