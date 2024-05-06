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
      "https://cloud.appwrite.io/v1/storage/buckets/6636a694000915b83b44/files/663827ff0008d5e7f0b1/view?project=66369eda001884780e9e&mode=admin",
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
