import {
  AuthBrandPanel,
  AuthFooter,
  AuthLoginPanel,
} from "@/components/layout";

export default function LoginPage() {
  return (
    <div className="relative min-h-screen bg-background pb-16 text-foreground">
      <div className="grid min-h-screen lg:grid-cols-2">
        <AuthBrandPanel />
        <AuthLoginPanel />
      </div>
      <AuthFooter />
    </div>
  );
}
