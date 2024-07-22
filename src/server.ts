import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client';
import { cors } from 'hono/cors'

type Bindings = {
  [key in keyof CloudflareBindings]: CloudflareBindings[key]
}

const app = new Hono<{ Bindings: Bindings }>()

app.use(cors())
const prisma = new PrismaClient();


app.get('/', (c) => {
  return c.json('server is running!')
})

app.get('/users', async (c) => {
  try {
    const users = await prisma.user.findMany();
    return c.json(users);
  } catch (err) {
    return c.text(err instanceof Error ? err.message : String(err));
  }
});

app.post('/users', async (c) => {
  const { name, email } = await c.req.json();
  const user = await prisma.user.create({
    data: {
      name,
      email,
    },
  });
  return c.json(user);
});

app.delete('/users/:id', async (c) => {
  const { id } = c.req.param();
  const user = await prisma.user.delete({
    where: {
      id: parseInt(id),
    },
  });
  return c.json(user);
});

export default app