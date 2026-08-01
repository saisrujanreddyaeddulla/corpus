import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-ink">
      <SignIn appearance={{ variables: { colorPrimary: "#D4A24C" } }} />
    </div>
  );
}
