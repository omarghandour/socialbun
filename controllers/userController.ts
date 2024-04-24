import Elysia from "elysia";
import User from "../models/userModel";
import { jwt } from "@elysiajs/jwt";
const signupUser = async (body: any, set: any, jwt: any, auth: any) => {
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
const loginUser = async (jwt: any, body: any, set: any, auth: any) => {
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

    auth.set({
      value: await jwt.sign(user.id),
      httpOnly: true,
      maxAge: 15 * 24 * 60 * 60,
      sameSite: "strict",
    });

    set.status = 200;
    return {
      message: "Logged in successfully",
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
// update user
const updateUser = async (
  jwt: any,
  set: any,
  params: any,
  auth: any,
  body: any
) => {
  const name = body.name;
  const username = body.username;
  const email = body.email;
  const password = body.password;
  const profilepic = body.profilPic;
  const bio = body.bio;

  try {
    const currentUser = params.id;
    const token = await jwt.verify(auth.value);
    let stringValue = "";
    for (const key in token) {
      if (Object.prototype.hasOwnProperty.call(token, key) && key !== "exp") {
        stringValue += token[key];
      }
    }
    const user: any = await User.findById(params.id);
    if (password) {
      const hashedPassword = await Bun.password.hash(password, {
        algorithm: "bcrypt",
        cost: 10, // number between 4-31
      });
      user.password = hashedPassword || user.password;
    }

    if (!user) {
      set.status = 404;
      return "User not found";
    } else if (currentUser != stringValue) {
      set.status = 500;
      return "You are not allowed to update this user or maybe it doesn't exist";
    }
    user.name = name || user.name;
    user.username = username || user.username;
    user.email = email || user.email;
    user.profilPic = profilepic || user.profilPic;
    user.bio = bio || user.bio;
    const updatedUser = await user.save();
    set.status = 200;
    return {
      message: "User successfully updated",
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        username: updatedUser.username,
        email: updatedUser.email,
        profilPic: updatedUser.profilPic,
        bio: updatedUser.bio,
      },
    };
  } catch (err: any) {
    set.status = 500;
    return err.message;
  }
};
// follow
const follow = async (jwt: any, set: any, params: any, auth: any) => {
  const token = await jwt.verify(auth.value);
  let stringValue = "";
  for (const key in token) {
    if (Object.prototype.hasOwnProperty.call(token, key) && key !== "exp") {
      stringValue += token[key];
    }
  }

  try {
    const user = await User.findById(params?.id);
    // console.log(user);
    const id = stringValue;
    const currentUser = await User.findById(id);

    if (auth === undefined || auth === null) {
      set.status = 401;
      return "Unauthorized";
    }
    if (!user || !currentUser) {
      set.status = 404;
      return "User not found";
    }
    if (id === params.id) {
      set.status = 400;
      return "You can't follow/unfollow yourself";
    }
    const isfollowing = currentUser.following.includes(params.id);
    if (isfollowing === true) {
      await User.findByIdAndUpdate(id, { $pull: { following: params.id } });
      await User.findByIdAndUpdate(params.id, { $pull: { followers: id } });
      set.status = 200;
      return "User unfollowed successfully";
    } else {
      await User.findByIdAndUpdate(id, { $push: { following: params.id } });
      await User.findByIdAndUpdate(params.id, { $push: { followers: id } });

      set.status = 200;
      return "User followed successfully";
    }
    // console.log(currentUser);
  } catch (err: any) {
    set.status = 500;
    return err.message;
  }
};

export { signupUser, loginUser, follow, updateUser };
