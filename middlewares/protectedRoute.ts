const protectedRoute = async (set: any, auth: any) => {
  try {
    const token = auth.value;
    if (!token) {
      set.status = 401;
      return "Unauthorized";
    }
  } catch (error: any) {
    set.status = 500;
    return error.message;
  }
};
export { protectedRoute };
