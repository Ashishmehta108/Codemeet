import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { useractions } from "../actions/user.actions";
export default function Meet() {
  const { id } = useParams<{ id: string }>();

  const userInfo = useQuery({
    queryKey: ["userinfo"],
    queryFn: () => {
      useractions.fetchUser;
    },
  });
  return (
    <div>
      hello
      <div></div>
    </div>
  );
}
