import React, { ReactNode, useContext } from "react";
import Header from "./Header";
import Footer from "./Footer";
import { ThemeContext } from "@/components/context/ThemeContext";

interface LayoutProps {
  children: ReactNode;
}

const UserLayout = ({ children }: LayoutProps) => {
  const { theme } = useContext(ThemeContext)!;

  return (
    <div
      className={`flex flex-col min-h-screen ${
        theme === "dark"
          ? "bg-gray-900 text-gray-100"
          : "bg-gray-50 text-gray-900"
      }`}
    >
      <Header />
      <main className="flex-grow overflow-auto">{children}</main>
      <Footer />
    </div>
  );
};

export default UserLayout;
