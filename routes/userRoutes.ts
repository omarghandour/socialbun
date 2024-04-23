import { Elysia, t } from "elysia";
import { follow, loginUser, signupUser } from "../controllers/userController";
import jwt from "@elysiajs/jwt";
import { protectedRoute } from "../middlewares/protectedRoute";
const tokensec: any = process.env.JWT_SECRET;

export const api = new Elysia()
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
      loginUser(body, set, jwt, auth),
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
  ({ set, params, cookie: { auth } }) => {
    follow(set, params, auth);
  },
  {
    beforeHandle({ set, cookie: { auth } }) {
      protectedRoute(set, auth);
    },
  }
);
api.get("/", ({ cookie: { name } }) => {
  name.httpOnly = true;
  name.value = "ss";
  name.secrets = "hihihi";
  return name;
});
api.use(
  jwt({
    name: "jwt",
    secret: tokensec,
    exp: "15d",
  })
);
