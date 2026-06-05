import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import * as z from "zod";
import { Boxes, Eye, EyeOff, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/useAuthStore";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loading, error, clearError } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);

  const from = (location.state as any)?.from?.pathname || "/overallanalytics";

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    clearError();
    try {
      await login(data);
      toast.success("Login successful");

      const { getActiveOrganization } = useAuthStore.getState();
      const activeOrg = getActiveOrganization();

      switch (activeOrg?.type) {
        case "HOTEL":
          navigate("/overallanalytics", { replace: true });
          break;
        case "STORE":
          navigate("/dashboard", { replace: true });
          break;
        case "CLOTHING":
          navigate("/clothing-dashboard", { replace: true });
          break;
        default:
          navigate(from, { replace: true });
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Login failed. Please try again.",
      );
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left — Branding panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-foreground text-background relative overflow-hidden">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-white/5" />
        <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-white/5" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <Boxes className="w-6 h-6 text-white" />
            </div>
            <span className="font-display text-xl font-semibold">
              InventoryOS
            </span>
          </div>

          <h1 className="font-display text-5xl font-bold leading-tight mb-6">
            Multi-tenant inventory,{" "}
            <span className="text-white/60">precisely managed.</span>
          </h1>

          <p className="text-white/60 text-lg leading-relaxed max-w-md">
            Purpose-built inventory management for Hotels, Stores, and Clothing
            brands — each with features tailored to their workflow.
          </p>
        </div>

        <div className="relative z-10 grid grid-cols-3 gap-4">
          {[
            { emoji: "🏨", label: "Hotel / Resort" },
            { emoji: "🏪", label: "Store / Warehouse" },
            { emoji: "👗", label: "Clothing / Fashion" },
          ].map((t) => (
            <div
              key={t.label}
              className="p-4 rounded-xl bg-white/5 border border-white/10"
            >
              <div className="text-2xl mb-2">{t.emoji}</div>
              <p className="text-white/70 text-xs font-medium">{t.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right — Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-10 lg:hidden">
            <Boxes className="w-6 h-6 text-primary" />
            <span className="font-display text-lg font-semibold">
              InventoryOS
            </span>
          </div>

          <h2 className="font-display text-3xl font-bold mb-2">Welcome back</h2>
          <p className="text-muted-foreground mb-8">
            Sign in to your organization account
          </p>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="you@example.com"
                        {...field}
                        disabled={loading}
                      />
                    </FormControl>
                    {/* ✅ Bug fix #5: FormMessage was missing on email field */}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      {/* ✅ Bug fix #6: showPassword toggle button was rendered but
                          never wired — now includes the toggle button in the UI */}
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          {...field}
                          disabled={loading}
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((prev) => !prev)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          tabIndex={-1}
                          aria-label={
                            showPassword ? "Hide password" : "Show password"
                          }
                        >
                          {showPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {error && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sign In
              </Button>
            </form>
          </Form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don't have an organization?{" "}
            <Link
              to="/register"
              className="text-primary font-medium hover:underline"
            >
              Register now
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
