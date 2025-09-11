  import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
  } from "@radix-ui/react-dropdown-menu";
  import { useDispatch, useSelector } from "react-redux";
  import { AppDispatch } from "../../store"; // Import the AppDispatch type
  import { useEffect } from "react";
  import { getAllBranches, switchBranch } from "store/slices/branchesSlice";
import { getDaily } from "store/slices/dailySlice";
import { getUsers } from "store/slices/usersSlice";
  export function Branches() {
    const dispatch = useDispatch<AppDispatch>();

    useEffect(() => {
      dispatch(getAllBranches({})); 
    }, []);
  const { user } = useSelector((state: any) => state.auth);


    const { branches ,selectedBranch} = useSelector((state: any) => state.branches);
    // useEffect(() => {
    //   console.log("user branchId", user);
    //   if (user.branchId) {
    //     console.log("user branchId2", user.branchId);
    //     dispatch(switchBranch(user.branchId));
    //   }
    // }, [branches, selectedBranch, dispatch]);

    const handleBranchSelect = async (branch: any) => {
     await dispatch(switchBranch(branch.id));
      await dispatch(getDaily());
      await dispatch(getUsers({}));
    };
    return (
  

        <div className=" text-[#111111] mb-[20px] text-center  w-full">
       <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className=" text-xl">
                          {/* <pre>{JSON.stringify(user.permissions, null,2)}</pre>ssssssssss */}

                {selectedBranch ? selectedBranch.name : "اختر فرعًا"}
              </button>
            </DropdownMenuTrigger>

           { (user?.permissions?.includes("branches.switch") || user?.role === "admin") &&    <DropdownMenuContent
              align="start"
              className="   w-[200px] mr-[50px]    rounded-md shadow  bg-white border gap-2  text-right"
            >
              {
                branches.map((branch:any) => (
                  <DropdownMenuItem
                    key={branch.id}
                    onClick={() => handleBranchSelect(branch)}
                    className="cursor-pointer p-2 hover:bg-blue-200"
                  >
                    {branch.name}

                  </DropdownMenuItem>

                ))
              }
            
            </DropdownMenuContent>}
          </DropdownMenu>
        </div>
    );
  }
