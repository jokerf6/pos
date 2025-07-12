const HomePage = () => {
  // const dispatch = useDispatch();
  // const { user, loading } = useSelector((state) => state.auth);

  // const handleLogout = () => {
  //   dispatch(logoutUser());
  // };

  return (
    <div className="">
      <span>ss</span>
    </div>
    // <div className="min-h-screen bg-gray-50">
    //   {/* Header */}
    //   <header className="bg-white shadow">
    //     <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    //       <div className="flex justify-between items-center py-6">
    //         <div className="flex items-center">
    //           <h1 className="text-3xl font-bold text-gray-900">
    //             Casher Desktop
    //           </h1>
    //         </div>
    //         <div className="flex items-center space-x-4">
    //           <div className="text-sm text-gray-700">
    //             Welcome, <span className="font-semibold">{user?.username}</span>
    //           </div>
    //           <button
    //             onClick={handleLogout}
    //             disabled={loading}
    //             className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 disabled:opacity-50"
    //           >
    //             {loading ? "Logging out..." : "Logout"}
    //           </button>
    //         </div>
    //       </div>
    //     </div>
    //   </header>

    //   {/* Main Content */}
    //   <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
    //     <div className="px-4 py-6 sm:px-0">
    //       <div className="border-4 border-dashed border-gray-200 rounded-lg p-8">
    //         <div className="text-center">
    //           <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
    //             <svg
    //               className="h-6 w-6 text-green-600"
    //               fill="none"
    //               viewBox="0 0 24 24"
    //               stroke="currentColor"
    //             >
    //               <path
    //                 strokeLinecap="round"
    //                 strokeLinejoin="round"
    //                 strokeWidth={2}
    //                 d="M5 13l4 4L19 7"
    //               />
    //             </svg>
    //           </div>
    //           <h3 className="mt-2 text-sm font-medium text-gray-900">
    //             Successfully Logged In
    //           </h3>
    //           <p className="mt-1 text-sm text-gray-500">
    //             You are now logged in to the Casher Desktop application.
    //           </p>
    //         </div>

    //         {/* User Information Card */}
    //         <div className="mt-8 bg-white overflow-hidden shadow rounded-lg">
    //           <div className="px-4 py-5 sm:p-6">
    //             <h3 className="text-lg leading-6 font-medium text-gray-900">
    //               User Information
    //             </h3>
    //             <div className="mt-5 border-t border-gray-200">
    //               <dl className="divide-y divide-gray-200">
    //                 <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4">
    //                   <dt className="text-sm font-medium text-gray-500">
    //                     Username
    //                   </dt>
    //                   <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
    //                     {user?.username}
    //                   </dd>
    //                 </div>
    //                 <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4">
    //                   <dt className="text-sm font-medium text-gray-500">
    //                     Email
    //                   </dt>
    //                   <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
    //                     {user?.email}
    //                   </dd>
    //                 </div>
    //                 <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4">
    //                   <dt className="text-sm font-medium text-gray-500">
    //                     Role
    //                   </dt>
    //                   <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
    //                     <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
    //                       {user?.role}
    //                     </span>
    //                   </dd>
    //                 </div>
    //                 <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4">
    //                   <dt className="text-sm font-medium text-gray-500">
    //                     User ID
    //                   </dt>
    //                   <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
    //                     {user?.id}
    //                   </dd>
    //                 </div>
    //               </dl>
    //             </div>
    //           </div>
    //         </div>

    //         {/* Application Status */}
    //         <div className="mt-8 bg-blue-50 border border-blue-200 rounded-md p-4">
    //           <div className="flex">
    //             <div className="flex-shrink-0">
    //               <svg
    //                 className="h-5 w-5 text-blue-400"
    //                 fill="currentColor"
    //                 viewBox="0 0 20 20"
    //               >
    //                 <path
    //                   fillRule="evenodd"
    //                   d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
    //                   clipRule="evenodd"
    //                 />
    //               </svg>
    //             </div>
    //             <div className="ml-3">
    //               <h3 className="text-sm font-medium text-blue-800">
    //                 Application Status
    //               </h3>
    //               <div className="mt-2 text-sm text-blue-700">
    //                 <p>
    //                   The Casher Desktop application is running successfully.
    //                   This is a basic implementation with authentication
    //                   functionality.
    //                 </p>
    //               </div>
    //             </div>
    //           </div>
    //         </div>
    //       </div>
    //     </div>
    //   </main>
    // </div>
  );
};

export default HomePage;
