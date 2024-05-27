import Post from "../models/postModel";
import User from "../models/userModel";
const createPost = async (jwt: any, set: any, auth: any, body: any) => {
  const text: string = body.text;
  const img: string = body.img;
  try {
    const token = await jwt.verify(auth.value);
    let stringValue: string = "";
    for (const key in token) {
      if (Object.prototype.hasOwnProperty.call(token, key) && key !== "exp") {
        stringValue += token[key];
      }
    }
    if (stringValue === "" || !text || text.length === 0 || text === "") {
      set.status = 400;
      return "Please fill all fields";
    }
    const user = await User.findById(stringValue)
      .select("-password")
      .select("-updatedAt");
    if (!user || user === undefined || user === null) {
      set.status = 404;
      return "User not found";
    }
    if (text.length > 500) {
      set.status = 400;
      return "Text must be less than 500 characters";
    }
    const newPost = new Post({
      postedBy: stringValue,
      text,
      img,
    });
    await newPost.save();
    set.status = 201;
    return { message: "Post created successfully", newPost };
  } catch (err: any) {
    set.status = 500;
    return err.message;
  }
};
const getPost = async (params: any, set: any) => {
  const id: string = params.id;
  try {
    const post = await Post.findById(id);
    if (!post || post === undefined || post === null) {
      set.status = 404;
      return "Post not found";
    }
    set.status = 200;
    return post;
  } catch (err: any) {
    set.status = 500;
    console.log(err.message);
    return err.message;
  }
};
const deletePost = async (jwt: any, set: any, auth: any, params: any) => {
  try {
    const id: string = params.id;
    const token = await jwt.verify(auth.value);
    let stringValue: string = "";
    for (const key in token) {
      if (Object.prototype.hasOwnProperty.call(token, key) && key !== "exp") {
        stringValue += token[key];
      }
    }
    const post: any = await Post.findById(id);
    if (!post || post === undefined || post === null) {
      set.status = 404;
      return "Post not found";
    }
    const postedBy: string = post.postedBy.toString();

    if (postedBy !== stringValue) {
      set.status = 400;
      return "You are not the author of this post";
    }
    await Post.findByIdAndDelete(id);
    set.status = 200;
    return "Post deleted successfully";
  } catch (err: any) {
    set.status = 500;
    console.log(err.message);
    return err.message;
  }
};
const likeUnlike = async (jwt: any, set: any, auth: any, params: any) => {
  try {
    const postId: string = params.id;
    const token = await jwt.verify(auth.value);
    let userID: string = "";
    for (const key in token) {
      if (Object.prototype.hasOwnProperty.call(token, key) && key !== "exp") {
        userID += token[key];
      }
    }
    const post: any = await Post.findById(postId);
    if (!post || post === undefined || post === null) {
      set.status = 404;
      return "Post not found";
    }
    const likes: string[] = post.likes;
    const userLikedPost: boolean = likes.includes(userID);
    if (userLikedPost) {
      //unlike post
      await Post.updateOne({ _id: postId }, { $pull: { likes: userID } });
      set.status = 200;
      return "Post unliked successfully";
    } else {
      //like post
      await Post.updateOne({ _id: postId }, { $push: { likes: userID } });
      set.status = 200;
      return "Post liked successfully";
    }
  } catch (err: any) {
    set.status = 500;
    console.log(err.message);
    return err.message;
  }
};
const reply = async (jwt: any, set: any, auth: any, params: any, body: any) => {
  try {
    const postId: string = params.id;
    let userId: string = "";
    const token = await jwt.verify(auth.value);
    for (const key in token) {
      if (Object.prototype.hasOwnProperty.call(token, key) && key !== "exp") {
        userId += token[key];
      }
    }
    const user = await User.findById(userId);
    const post: any = await Post.findById(postId);
    const text = body.text;
    const userProfilePic = user?.profilPic;
    const username = user?.username;

    if (!text || text.length === 0 || text === "") {
      set.status = 400;
      return "Text failed is required";
    }

    if (!post || post === undefined || post === null) {
      set.status = 404;
      return "Post not found";
    }
    console.log(userId, text, userProfilePic, username);

    const reply = { userId, text, userProfilePic, username };
    await post.replies.push(reply);
    post.save();
    set.status = 201;
    return { message: "Reply created successfully", post };
  } catch (err: any) {
    set.status = 500;
    console.log(err.message);
    return err.message;
  }
};
const feedFollowing = async (jwt: any, set: any, auth: any, params: any) => {
  try {
    let userId: string = "";
    const token = await jwt.verify(auth.value);
    for (const key in token) {
      if (Object.prototype.hasOwnProperty.call(token, key) && key !== "exp") {
        userId += token[key];
      }
    }
    const user = await User.findById(userId);
    const following = user?.following;
    if (following?.length === 0) {
      set.status = 404;
      return "You are not following anyone";
    }
    const itemsPerPage = 10;
    const pageNumber = params.id;
    const skipCount = (pageNumber - 1) * itemsPerPage;
    const posts = await Post.find({ postedBy: { $in: following } })
      .skip(skipCount)
      .limit(itemsPerPage)
      .select("-updatedAt");
    // console.log(posts);
    if (posts.length === 0) {
      set.status = 404;
      return "No posts found";
    }
    set.status = 200;
    return posts;
  } catch (err: any) {
    set.status = 500;
    console.log(err.message);
    return err.message;
  }
};
const feedExplore = async (set: any, params: any) => {
  try {
    const itemsPerPage = 10;
    const pageNumber = params.id;
    const skipCount = (pageNumber - 1) * itemsPerPage;
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .skip(skipCount)
      .limit(itemsPerPage)
      .select("-updatedAt");
    if (posts.length === 0) {
      set.status = 404;
      return "No more posts found";
    }
    set.status = 200;
    return posts;
  } catch (err: any) {}
};
const userPosts = async (set: any, params: any) => {
  const userID = params.id;
  const itemsPerPage = 10;
  const pageNumber = params.id;
  const skipCount = (pageNumber - 1) * itemsPerPage;
  const posts = await Post.find({ postedBy: userID })
    .skip(skipCount)
    .limit(itemsPerPage)
    .select("-updatedAt")
    .sort({ createdAt: -1 });
  if (posts.length === 0) {
    set.status = 404;
    return "No posts found";
  }
  if (!posts || posts === undefined || posts === null) {
    set.status = 404;
    return "User not found";
  }
  set.status = 200;
  return posts;
};
export {
  createPost,
  getPost,
  deletePost,
  likeUnlike,
  reply,
  feedFollowing,
  feedExplore,
  userPosts,
};
