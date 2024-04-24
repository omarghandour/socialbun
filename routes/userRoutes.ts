import { Elysia, t } from "elysia";
import {
  follow,
  loginUser,
  signupUser,
  updateUser,
} from "../controllers/userController";
import jwt from "@elysiajs/jwt";
import { protectedRoute } from "../middlewares/protectedRoute";
const tokensec: any = process.env.JWT_SECRET;

export const api = new Elysia().use(
  jwt({
    name: "jwt",
    secret: tokensec,
    exp: "15d",
  })
);

api
  .post(
    "/signup",
    ({ jwt, body, set, cookie: { auth } }: any) =>
      signupUser(body, set, jwt, auth),
    {
      body: t.Object({
        name: t.String(),
        username: t.String(),
        email: t.String(),
        password: t.String(),
      }),
    }
  )
  .post(
    "/login",
    ({ jwt, body, set, cookie: { auth } }: any) =>
      loginUser(jwt, body, set, auth),
    {
      body: t.Object({
        username: t.String(),
        password: t.String(),
      }),
    }
  )
  .post("/logout", ({ cookie: { auth }, set }) => {
    auth.remove();
    set.status = 200;
    return "User logged out successfully";
  });
// follow
api.post(
  "/follow/:id",
  ({ jwt, set, params, cookie: { auth } }) => follow(jwt, set, params, auth),
  {
    beforeHandle({ jwt, set, cookie: { auth } }) {
      return protectedRoute(jwt, set, auth);
    },
  }
);
api.post(
  "/update/:id",
  ({ jwt, set, params, cookie: { auth }, body }) =>
    updateUser(jwt, set, params, auth, body),
  {
    beforeHandle({ jwt, set, cookie: { auth } }) {
      return protectedRoute(jwt, set, auth);
    },
  }
);
api.get("/", ({ cookie: { name } }) => {
  name.httpOnly = true;
  name.value = "ss";
  name.secrets = "hihihi";
  return name;
});
