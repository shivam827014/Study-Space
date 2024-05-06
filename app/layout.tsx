import { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Toast from "@/components/Toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "StudySpace - Collaborative Online Learning Platform",
  description: "StudySpace - Collaborative online learning platform for virtual study groups",
  authors: [{ name: "Aditya Marandi", url: "https://github.com/a4aditya7/study-space" }],
  openGraph: {
    type: "website",
    title: "StudySpace - Collaborative Online Learning Platform",
    description: "StudySpace - Collaborative online learning platform for virtual study groups",
    images: [
      "app\groupStudy.jpg",
    ],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Toast />
        {children}
      </body>
    </html>
  );
}
