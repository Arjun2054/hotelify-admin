import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "sonner";
import { Loader2, Mail } from "lucide-react";

export default function OtpVerificationPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyOtp, loading, error, clearError } = useAuthStore();

  // Get email from navigation state (passed from Register page)
  const email = location.state?.email || "";

  const [otp, setOtp] = useState("");
  const [isResending, setIsResending] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    clearError();
    try {
      await verifyOtp(email, otp);
      navigate("/login");
    } catch (err) {
      // Error is already handled in the store
    }
  };

  const handleResendOtp = async () => {
    // Optional: Add resend OTP logic later
    setIsResending(true);
    toast.info("Resend OTP functionality coming soon");
    setTimeout(() => setIsResending(false), 1500);
  };

  if (!email) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              No email found. Please register again.
            </p>
            <Button
              onClick={() => navigate("/register")}
              className="w-full mt-4"
            >
              Go to Register
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Mail className="h-6 w-6 text-primary" />
          </div>
          <CardTitle>Verify Your Email</CardTitle>
          <CardDescription>
            We sent a 6-digit code to <strong>{email}</strong>
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleVerify} className="space-y-6">
            <div>
              <Input
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                className="text-center text-2xl tracking-[8px] font-mono h-14"
                disabled={loading}
              />
            </div>

            {error && (
              <div className="text-sm text-destructive text-center">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-11 text-base"
              disabled={loading || otp.length !== 6}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Verify Email
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              Didn't receive the code?{" "}
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={isResending}
                className="text-primary hover:underline font-medium"
              >
                {isResending ? "Sending..." : "Resend OTP"}
              </button>
            </div>

            <div className="text-center">
              <Link
                to="/login"
                className="text-sm text-muted-foreground hover:underline"
              >
                Back to Login
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
