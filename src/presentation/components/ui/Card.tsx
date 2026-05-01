import React from "react";

export default function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white shadow rounded-lg p-4 hover:shadow-md transition">
      {children}
    </div>
  );
}
