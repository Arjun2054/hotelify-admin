import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { CheckCircle2, Loader2, Package } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "sonner";
import { ORG_CONFIGS } from "@/lib/Orgconfig";
import type { OrganizationType } from "@/lib/types";
import { cn } from "@/lib/utils";

const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    organizationName: z
      .string()
      .min(2, "Organization name must be at least 2 characters")
      .max(100, "Organization name must be less than 100 characters"),
    type: z.string({
      error: "Please select a business template",
    }),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register: registerUser, loading, error, clearError } = useAuthStore();

  const standardDefaultType =
    (Object.values(ORG_CONFIGS)[0]?.type as OrganizationType) || "";

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      organizationName: "",
      type: standardDefaultType,
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    clearError();
    try {
      await registerUser({
        name: data.name,
        email: data.email,
        organizationName: data.organizationName,
        type: data.type as OrganizationType,
        password: data.password,
      });
      toast.success("Account created! Please verify your email.");
      navigate("/verify-otp", { state: { email: data.email } });
    } catch (err: any) {
      toast("Registration Failed");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4 md:p-8 lg:p-12">
      <Card className="w-full max-w-6xl shadow-2xl border-muted/60 bg-card/95 backdrop-blur-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
          {/* Header span across all columns on mobile, but integrated nicely */}
          <div className="col-span-1 lg:col-span-12 p-6 md:p-8 pb-4 lg:pb-6 border-b border-muted/50">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-primary/10 rounded-xl text-primary shadow-sm">
                  <Package className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold tracking-tight">
                    Create Your Account
                  </CardTitle>
                  <CardDescription className="text-sm text-muted-foreground mt-0.5">
                    Set up your details and customize your multi-tenant
                    workspace
                  </CardDescription>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-primary font-semibold hover:underline transition-colors"
                >
                  Sign in
                </Link>
              </div>
            </div>
          </div>

          {/* Form container */}
          <div className="col-span-1 lg:col-span-12 p-6 md:p-8 lg:p-10 pt-4 lg:pt-6">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-8"
              >
                {/* 2-Column Responsive Split Content */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                  {/* Left Column: Personal & Organization Details */}
                  <div className="lg:col-span-5 space-y-5">
                    <div className="border-b border-muted/40 pb-2 mb-4">
                      <h2 className="text-lg font-semibold tracking-tight text-foreground">
                        Account Details
                      </h2>
                      <p className="text-xs text-muted-foreground">
                        Enter your identity and workspace credentials.
                      </p>
                    </div>

                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="John Doe"
                              {...field}
                              disabled={loading}
                              className="h-10 bg-background/50 focus:bg-background"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="you@example.com"
                              {...field}
                              disabled={loading}
                              className="h-10 bg-background/50 focus:bg-background"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="organizationName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Organization Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Acme Corporation"
                              {...field}
                              disabled={loading}
                              className="h-10 bg-background/50 focus:bg-background"
                            />
                          </FormControl>
                          <FormMessage />
                          <p className="text-xs text-muted-foreground mt-1">
                            You'll be configured as the root owner of this
                            workspace.
                          </p>
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="••••••••"
                                {...field}
                                disabled={loading}
                                className="h-10 bg-background/50 focus:bg-background"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirm Password</FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="••••••••"
                                {...field}
                                disabled={loading}
                                className="h-10 bg-background/50 focus:bg-background"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Right Column: Business Template Selection */}
                  <div className="lg:col-span-7 space-y-5">
                    <div className="border-b border-muted/40 pb-2 mb-4">
                      <h2 className="text-lg font-semibold tracking-tight text-foreground">
                        Business Template
                      </h2>
                      <p className="text-xs text-muted-foreground">
                        Select a template to configure pre-installed roles and
                        features.
                      </p>
                    </div>

                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem className="space-y-4">
                          <FormControl>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {Object.values(ORG_CONFIGS).map((config) => {
                                const Icon = config.icon;
                                const isSelected = field.value === config.type;
                                return (
                                  <button
                                    key={config.type}
                                    type="button"
                                    onClick={() =>
                                      form.setValue("type", config.type, {
                                        shouldValidate: true,
                                      })
                                    }
                                    className={cn(
                                      "relative flex flex-col p-5 rounded-xl border-2 text-left transition-all duration-300 outline-none focus:ring-2 focus:ring-primary/20",
                                      isSelected
                                        ? "border-primary bg-primary/5 shadow-md"
                                        : "border-border hover:border-primary/30 hover:bg-muted/10",
                                    )}
                                  >
                                    {isSelected && (
                                      <CheckCircle2 className="absolute top-4 right-4 h-5.5 w-5.5 text-primary" />
                                    )}
                                    <div
                                      className={cn(
                                        "inline-flex p-3 rounded-xl mb-4 w-fit shadow-sm",
                                        config.bgColor || "bg-muted",
                                      )}
                                    >
                                      <Icon
                                        className={cn(
                                          "h-6 w-6",
                                          config.color || "text-foreground",
                                        )}
                                      />
                                    </div>
                                    <h3 className="font-bold text-sm text-foreground mb-1">
                                      {config.label}
                                    </h3>
                                    <p className="text-xs text-muted-foreground leading-relaxed grow line-clamp-2">
                                      {config.templateDescription}
                                    </p>
                                    {config.features &&
                                      config.features.length > 0 && (
                                        <div className="mt-4 flex flex-wrap gap-1.5 pt-2 border-t border-muted/30">
                                          {config.features
                                            .slice(0, 3)
                                            .map((f) => (
                                              <span
                                                key={f}
                                                className="text-[10px] font-semibold bg-muted text-muted-foreground px-2 py-0.5 rounded-full tracking-wide"
                                              >
                                                {f}
                                              </span>
                                            ))}
                                        </div>
                                      )}
                                  </button>
                                );
                              })}
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Footer Section: Error & Submission */}
                <div className="border-t border-muted/50 pt-6 flex flex-col space-y-4">
                  {error && (
                    <div className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive font-medium border border-destructive/20 max-w-xl mx-auto w-full text-center">
                      {error}
                    </div>
                  )}

                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      className="w-full lg:w-fit lg:px-12 h-11 text-base font-semibold transition-all shadow-md hover:shadow-lg"
                      disabled={loading}
                    >
                      {loading && (
                        <Loader2 className="mr-2.5 h-5 w-5 animate-spin" />
                      )}
                      Complete Registration
                    </Button>
                  </div>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </Card>
    </div>
  );
}
