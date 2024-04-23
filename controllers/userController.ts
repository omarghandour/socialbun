import Elysia from "elysia";
import User from "../models/userModel";
const signupUser = async (body: any, set: any, jwt: any, auth: any) => {
  console.log(body.name);
  const name = body.name;
  const username = body.username;
  const email = body.email;
  const password = body.password;
  // use bcrypt
  const hashedPassword = await Bun.password.hash(password, {
    algorithm: "bcrypt",
    cost: 10, // number between 4-31
  });
  try {
    const user = await User.findOne({
      $or: [{ email: email }, { username: username }],
    });
    if (user) {
      set.status = 400;
      return "User already exists";
    }
    const createUser = await User.create({
      name: name,
      username: username,
      email: email,
      password: hashedPassword,
    });
    await createUser.save();
    set.status = 201;
    if (createUser) {
      auth.secrets = jwt;
      auth.value = createUser.id;
      auth.httpOnly = true;

      auth.maxAge = 15 * 24 * 60 * 60;
      auth.sameSite = "strict";
      return {
        id: createUser._id,
        name: createUser.name,
        username: createUser.username,
        email: createUser.email,
        cookie: auth,
      };
    } else {
      set.status = 400;
      return "Invalid user data";
    }
  } catch (err: any) {
    set.status = 500;
    return err.message;
  }
};
const loginUser = async (body: any, set: any, jwt: any, auth: any) => {
  const username = body.username;
  const password = body.password;
  try {
    const user = await User.findOne({ username });
    const hash: any = user?.password;
    const isMatch = await Bun.password.verify(password, hash || "");

    if (!user || !isMatch) {
      set.status = 400;
      return "Invalid username or password";
    }

    auth.secrets = jwt;
    auth.value = user.id;
    auth.httpOnly = true;
    auth.maxAge = 15 * 24 * 60 * 60;
    auth.sameSite = "strict";

    set.status = 200;
    return {
      cookie: auth.value,
      id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
    };
  } catch (err: any) {
    set.status = 500;
    return err.message;
  }
};

// follow
const follow = async (set: any, params: any, auth: any) => {
  try {
    const user = await User.findById(params.id);
    const id = auth.value;
    const currentUser = await User.findById(id);
    console.log(currentUser);

    if (!user) {
      set.status = 404;
      return "User not found";
    }
  } catch (err: any) {
    set.status = 500;
    return err.message;
  }
};

export { signupUser, loginUser, follow };
