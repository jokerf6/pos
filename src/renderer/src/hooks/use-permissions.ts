import { useSelector } from "react-redux";
import { RootState } from "store";

export const usePermission = (permission: string): boolean => {
  const user = useSelector((state: RootState) => state.auth.user);
  console.log("here", user)
  return user?.permissions?.includes(permission) ?? false;
};