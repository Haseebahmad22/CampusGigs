"use client";

import { useState } from "react";
import { motion, type Variants } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthVisualPanel } from "@/components/auth/AuthVisualPanel";

const formVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.09, delayChildren: 0.1 } },
};

const rowVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      const response = await fetch(`${apiBaseUrl}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        setError(payload?.error || "Login failed. Please try again.");
        return;
      }

      if (payload?.token) {
        localStorage.setItem("campusgigs_token", payload.token);
      }

      if (payload?.user) {
        localStorage.setItem("campusgigs_user", JSON.stringify(payload.user));
        if (payload.user.role) {
          localStorage.setItem("campusgigs_role", payload.user.role);
        }
      }

      router.push("/dashboard");
    } catch {
      setError("Unable to connect to server. Check backend and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">

      {/* ── Form panel ── */}
      <div className="relative flex items-center justify-center p-8 lg:p-14 min-h-screen lg:min-h-0">

        {/* Back to home */}
        <Link
          href="/"
          className="absolute top-6 right-6 flex items-center gap-2 text-xs text-muted hover:text-foreground transition-colors px-3.5 py-2 rounded-md"
          style={{
            background: "rgba(38,48,68,0.86)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <ArrowLeft className="w-3 h-3" />
          Home
        </Link>

        <motion.div
          className="w-full max-w-95"
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
        >
          {/* Logo */}
          <Link
            href="/"
            className="inline-block mb-12 text-xl text-foreground italic"
            style={{ fontFamily: "var(--font-logo)" }}
          >
            CampusGigs
          </Link>

          <motion.div
            variants={formVariants}
            initial="hidden"
            animate="visible"
            className="space-y-7"
          >
            <motion.div variants={rowVariants}>
              <h1
                className="text-[2.6rem] leading-[1.1] text-foreground"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Welcome back.
              </h1>
              <p className="text-muted text-sm mt-2">Sign in to continue</p>
            </motion.div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <motion.div variants={rowVariants}>
                <Input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </motion.div>

              <motion.div variants={rowVariants} className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-12"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-subtle hover:text-muted transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </motion.div>

              <motion.div variants={rowVariants} className="flex justify-end">
                <Link
                  href="/forgot-password"
                  className="text-xs text-muted hover:text-primary transition-colors"
                >
                  Forgot password?
                </Link>
              </motion.div>

              <motion.div variants={rowVariants} className="pt-1">
                <Button type="submit" size="lg" className="w-full" loading={loading}>
                  Sign In
                </Button>
              </motion.div>

              {error && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs text-error px-1"
                >
                  {error}
                </motion.p>
              )}
            </form>

            <motion.p variants={rowVariants} className="text-center text-sm text-muted">
              No account?{" "}
              <Link href="/signup" className="text-primary hover:text-primary-light font-medium transition-colors">
                Create one
              </Link>
            </motion.p>
          </motion.div>
        </motion.div>
      </div>

      {/* ── Visual panel — library with Edison bulbs ── */}
      <AuthVisualPanel imageSrc="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1400&auto=format&fit=crop&q=80" />
    </div>
  );
}
