import cors from "@elysiajs/cors";
import { Elysia } from "elysia";
import connectDB from "../db/connectDB";
import { users } from "../routes/userRoutes";
import { posts } from "../routes/postRoutes";

const app = new Elysia({ prefix: "/api" });

app.get("/", () => "Hello Elysia");
app.use(cors());

connectDB();
// Routes
app.use(users);
app.use(posts);
app.listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
