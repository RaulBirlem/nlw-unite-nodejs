import { prisma } from "../src/lib/prisma"

async function seed() {
    await prisma.event.create({
        data: {
            id:'d6a17b81-3bf7-4575-b981-443e04ebf3c9',
            title: 'Unite Summit',
            slug: 'unite-summit',
            details: 'Um evento para devs!',
            maximumAttendees:120
        }
    })
}

seed().then(()=>{
    console.log("Dados inseridos ao banco de dados.")
    prisma.$disconnect()
})