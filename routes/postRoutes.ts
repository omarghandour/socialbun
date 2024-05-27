import { Elysia, t } from "elysia";
import { protectedRoute } from "../middlewares/protectedRoute";
import jwt from "@elysiajs/jwt";
import {
  createPost,
  deletePost,
  feedExplore,
  feedFollowing,
  getPost,
  likeUnlike,
  reply,
  userPosts,
} from "../controllers/postController";
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
    posts
      .get("/feed/following/:id", ({ jwt, set, cookie: { auth }, params }) =>
        feedFollowing(jwt, set, auth, params)
      )
      .get("/feed/explore/:id", ({ set, params }) => feedExplore(set, params))
      .get("/user/posts/:id/:pg", ({ set, params }) => userPosts(set, params))
      .post(
        "/create",
        ({ jwt, set, cookie: { auth }, body }) =>
          createPost(jwt, set, auth, body),
        {
          body: t.Object({
            text: t.String(),
            img: t.String(),
          }),
        }
      )
      .post("/like/:id", ({ jwt, set, cookie: { auth }, params }) =>
        likeUnlike(jwt, set, auth, params)
      )
      .post(
        "/reply/:id",
        ({ jwt, set, cookie: { auth }, params, body }) =>
          reply(jwt, set, auth, params, body),
        {
          body: t.Object({
            text: t.String(),
          }),
        }
      )

      .delete("/:id", ({ jwt, set, cookie: { auth }, params }) =>
        deletePost(jwt, set, auth, params)
      )
);
posts.get("/:id", ({ params, set }) => getPost(params, set));
