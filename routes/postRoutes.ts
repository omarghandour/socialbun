import { Elysia, t } from "elysia";
import { protectedRoute } from "../middlewares/protectedRoute";
import jwt from "@elysiajs/jwt";
import { createPost } from "../controllers/postController";
const tokensec: any = process.env.JWT_SECRET;

export const posts = new Elysia({ prefix: "posts" }).use(
  jwt({
    name: "jwt",
    secret: tokensec,
    exp: "15d",
  })
);
posts.guard(
  {
    beforeHandle({ jwt, set, cookie: { auth } }) {
      return protectedRoute(jwt, set, auth);
    },
  },
  (posts) =>
    posts.post(
      "/create",
      ({ jwt, set, cookie: { auth }, body }) =>
        createPost(jwt, set, auth, body),
      {
        body: t.Object({
          title: t.String(),
        }),
      }
    )
);
