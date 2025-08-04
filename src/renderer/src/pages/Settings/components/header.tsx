"use client";
import * as React from "react";
import ProductHeader from "./product.header";
import DailyHeader from "./daily.header";

interface HeaderItem {
  title: string;
  component: React.ReactElement;
}

export default function SettingsHeader() {
  const [currentTab, setCurrentTab] = React.useState<number>(0);
  const headers: HeaderItem[] = [
    {
      title: "المنتجات",
      component: <ProductHeader />,
    },
    {
      title: "اليومية",
      component: <DailyHeader />,
    },
  ];
  return (
    <div className=" flex flex-col gap-4">
      <div className=" flex gap-4">
        {headers.map((header, idx) => (
          <button
            key={header.title}
            className={`hover:text-blue-500 ${currentTab === idx ? "text-blue-500 underline" : "text-gray-800"} hover:underline duration-75 ease-in-out  dark:text-gray-200 text-2xl cursor-pointer w-fit`}
            onClick={() => setCurrentTab(idx)}
          >
            {header.title}
          </button>
        ))}
      </div>

      <div>{headers[currentTab] && headers[currentTab].component}</div>
    </div>
  );
}

