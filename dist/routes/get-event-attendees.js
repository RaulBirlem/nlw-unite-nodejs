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

// src/routes/get-event-attendees.ts
var get_event_attendees_exports = {};
__export(get_event_attendees_exports, {
  getEventAttendees: () => getEventAttendees
});
module.exports = __toCommonJS(get_event_attendees_exports);
var import_zod = __toESM(require("zod"));

// src/lib/prisma.ts
var import_client = require("@prisma/client");
var prisma = new import_client.PrismaClient({
  log: ["query"]
  // a cada query retorna um log
});

// src/routes/get-event-attendees.ts
async function getEventAttendees(app) {
  app.withTypeProvider().get("/events/:eventId/attendees", {
    schema: {
      summary: "Get event attendees",
      // swagger ui
      tags: ["events"],
      // swagger ui
      params: import_zod.default.object({
        eventId: import_zod.default.string().uuid()
      }),
      querystring: import_zod.default.object({
        query: import_zod.default.string().nullish(),
        //nullish -> undefined ou null
        //index da página atual
        pageIndex: import_zod.default.string().nullish().default("0").transform(Number)
      }),
      response: {
        //tipagem de rota
        200: import_zod.default.object({
          attendees: import_zod.default.array(
            import_zod.default.object({
              id: import_zod.default.number(),
              name: import_zod.default.string(),
              email: import_zod.default.string().email(),
              createdAt: import_zod.default.date(),
              checkedInAt: import_zod.default.date().nullable()
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getEventAttendees
});
