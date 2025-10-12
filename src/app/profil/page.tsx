import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { UserProfileClient } from "./components/UserProfileClient";

export default async function UserProfilePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return <UserProfileClient user={session.user} />;
}

export const metadata = {
  title: "Felhasználói Profil | Lovas Zoltán",
  description: "Tekintse meg aktivitását, kvíz eredményeit, szavazásait és petíció aláírásait",
};