import { BACKEND_URL } from "../lib/const";

class UserActions {
  fetchUser = async () => {
    const res = await fetch(`${BACKEND_URL}/api/user`);
    return res.json();
  };
  createUser = async (user: { email: string; password: string }) => {
    const res = await fetch(`${BACKEND_URL}/api/user`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(user),
    });
    return res.json();
  };
  deleteUser = async () => {};
  updateUser = async () => {};
}

export const useractions = new UserActions();
