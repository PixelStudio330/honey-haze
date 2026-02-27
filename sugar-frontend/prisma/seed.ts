import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const foodData = [{"name":"Strawberry Donuts","description":"Sweet, fluffy, and topped with love 🍓","image":"/images/foods/strawberry-donuts.jpg","type":"sweet","price":5},{"name":"Pudding Magic","description":"Delicate, colorful bites of happiness 🍮","image":"/images/foods/pudding.jpg","type":"sweet","price":6},{"name":"Hot Dog","description":"Spicy drama in every bite 🌭","image":"/images/foods/hot-dog.jpg","type":"spicy","price":8},{"name":"Strawberry Milk Latte","description":"Creamy, floamy and a definition of aesthetic ☕","image":"/images/foods/coffee.jpg","type":"sweet","price":7},{"name":"Heart Bread","description":"Sweet, soft piece of bread that melts in your mouth like a cloud ☁️","image":"/images/foods/bread-jam.jpg","type":"sweet","price":4},{"name":"Chocolate Donuts","description":"Sweet, rich, chocolaty little treats 🍩","image":"/images/foods/donuts.jpg","type":"sweet","price":5},{"name":"Rose Tea","description":"Fresh, luxurious sip of heaven 🌹","image":"/images/foods/rose-tea.jpg","type":"sweet","price":6},{"name":"Cinnamon Bun","description":"Every bite of it feels like autumn and memories 🍂","image":"/images/foods/cinnamon-bun.jpg","type":"sweet","price":5},{"name":"Strawberry Cake","description":"Fluffy, soft bites that feel like royalty 🍰","image":"/images/foods/strawberry.cake.jpg","type":"sweet","price":12},{"name":"Ramen","description":"Creamy and a touch of tradition 🍜","image":"/images/foods/rsmrn.jpg","type":"spicy","price":15},{"name":"Raspberry Torte","description":"Cream-filled buns that take you to your childhood 🥐","image":"/images/foods/raspberry-torte.jpg","type":"sweet","price":9},{"name":"Strawberry Pie","description":"Sweet bites made with love 🥧","image":"/images/foods/strawberry-pie.jpg","type":"sweet","price":10},{"name":"Blueberry Waffle","description":"Rich, creamy and sweet waffles 🧇","image":"/images/foods/blueberry-waffle.jpg","type":"sweet","price":11},{"name":"Peach Cream Bun","description":"Sweet, peach buns that smell like love and care 🍑","image":"/images/foods/cream-bun.jpg","type":"sweet","price":6},{"name":"Fruit Bites","description":"Our special dish with a sprinkle of authenticity ✨","image":"/images/foods/blueberry-cupcake.jpg","type":"sweet","price":7},{"name":"Strawberry Jelly Sandwich","description":"Fluffy and light bread sandwich 🥪","image":"/images/foods/sandwitch.jpg","type":"sweet","price":5}]

async function main() {
  console.log(`Start seeding ...`)
  for (const f of foodData) {
    const food = await prisma.food.create({
      data: f,
    })
    console.log(`Created food with id: ${food.id}`)
  }
  console.log(`Seeding finished.`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })