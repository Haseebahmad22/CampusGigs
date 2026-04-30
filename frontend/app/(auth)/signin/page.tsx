"use client";

import { useState } from "react";
import { motion, type Variants } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthVisualPanel } from "@/components/auth/AuthVisualPanel";

const formVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const rowVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 260, damping: 28 },
  },
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
      const apiBaseUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
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
    <div className="min-h-screen grid lg:grid-cols-[5fr_7fr] bg-background">
      {/* Form panel */}
      <div className="relative flex items-center justify-center px-8 py-12 lg:px-14">
        <Link
          href="/"
          className="absolute top-6 right-6 inline-flex items-center gap-2 px-3 py-1.5 rounded-sm border border-rule font-mono text-[10px] uppercase tracking-[0.16em] text-muted hover:text-foreground hover:border-rule-strong transition-colors"
        >
          <ArrowLeft className="w-3 h-3" />
          Home
        </Link>

        <motion.div
          className="w-full max-w-sm"
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 28 }}
        >
          <Link
            href="/"
            className="inline-block mb-12 font-serif italic text-[22px] leading-none text-foreground"
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
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-subtle">
                Sign in
              </span>
              <h1 className="mt-2 font-serif text-[3rem] leading-[1] tracking-tight text-foreground">
                Welcome <em className="italic text-primary">back.</em>
              </h1>
            </motion.div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <motion.div variants={rowVariants} className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </motion.div>

              <motion.div variants={rowVariants} className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    href="/forgot-password"
                    className="font-mono text-[10px] uppercase tracking-[0.14em] text-subtle hover:text-foreground transition-colors"
                  >
                    Forgot?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pr-10"
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 text-subtle hover:text-foreground transition-colors p-1"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </motion.div>

              <motion.div variants={rowVariants} className="pt-2">
                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  loading={loading}
                >
                  Sign in
                </Button>
              </motion.div>

              {error && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-[13px] text-error"
                >
                  {error}
                </motion.p>
              )}
            </form>

            <motion.p
              variants={rowVariants}
              className="text-center text-[13px] text-muted border-t border-rule pt-6"
            >
              No account?{" "}
              <Link
                href="/signup"
                className="text-primary hover:text-primary-dark transition-colors"
              >
                Create one
              </Link>
            </motion.p>
          </motion.div>
        </motion.div>
      </div>

      {/* Visual panel */}
      <AuthVisualPanel
        kicker="Sign in · CampusGigs"
        headline="Where skills"
        emphasis="meet opportunity."
      />
    </div>
  );
}
