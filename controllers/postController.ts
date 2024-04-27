import Post from "../models/postModel";
const createPost = async (jwt: any, set: any, auth: any, body: any) => {
  try {
    const token = await jwt.verify(auth.value);
    let stringValue: string = "";
    for (const key in token) {
      if (Object.prototype.hasOwnProperty.call(token, key) && key !== "exp") {
        stringValue += token[key];
      }
    }
    if (stringValue === "") {
      set.status = 401;
      return "UnAuthorized";
    }
  } catch (err: any) {
    set.status = 500;
    return err.message;
  }
};
export { createPost };
