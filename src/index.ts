import cors from "@elysiajs/cors";
import { Elysia } from "elysia";
import connectDB from "../db/connectDB";
import { api } from "../routes/userRoutes";

const app = new Elysia();

app.get("/", () => "Hello Elysia");
app.use(cors());

connectDB();
// Routes
app.use(api);

app.listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
