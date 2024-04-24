const protectedRoute = async (jwt: any, set: any, auth: any) => {
  try {
    const token = await jwt.verify(auth.value);
    if (token === false) {
      set.status = 401;
      return "Unauthorized";
    }
  } catch (error: any) {
    set.status = 500;
    return error.message;
  }
};
export { protectedRoute };
