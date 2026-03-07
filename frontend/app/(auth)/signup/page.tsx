"use client";

import { useState } from "react";
import { motion, type Variants } from "framer-motion";
import Link from "next/link";
import { Eye, EyeOff, ArrowLeft, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthVisualPanel } from "@/components/auth/AuthVisualPanel";

type Role = "client" | "freelancer";

const formVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

const rowVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

const SIGNUP_IMAGE = "https://images.unsplash.com/photo-1571171637578-41bc2dd41cd2?w=1400&auto=format&fit=crop&q=80";

export default function SignUpPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<Role>("freelancer");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (password !== confirmPassword) { setError("Passwords do not match."); return; }
    setLoading(true);
    // TODO: POST /api/auth/signup  { full_name, email, password, role } → session → /dashboard
    await new Promise((r) => setTimeout(r, 900));
    setLoading(false);
    setSuccess(true);
  };

  if (success) {
    return (
      <div className="min-h-screen grid lg:grid-cols-2 bg-background">
        <div className="flex items-center justify-center p-8 lg:p-14">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-[380px] text-center space-y-5"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, delay: 0.1 }}
              className="w-14 h-14 rounded-full bg-success/10 border border-success/20 flex items-center justify-center mx-auto"
            >
              <CheckCircle className="w-7 h-7 text-success" />
            </motion.div>
            <div>
              <h2 className="text-3xl text-foreground" style={{ fontFamily: "var(--font-display)" }}>
                You&apos;re in.
              </h2>
              <p className="text-muted text-sm mt-2">
                Auth will be fully connected once the backend is ready.
              </p>
            </div>
            <Link href="/signin">
              <Button variant="outline" size="lg" className="w-full">Back to Sign In</Button>
            </Link>
          </motion.div>
        </div>
        <AuthVisualPanel imageSrc={SIGNUP_IMAGE} />
      </div>
    );
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">

      {/* ── Form panel ── */}
      <div className="relative flex items-center justify-center p-8 lg:p-14 overflow-y-auto">

        {/* Back to home */}
        <Link
          href="/"
          className="absolute top-6 right-6 flex items-center gap-2 text-xs text-white/60 hover:text-white/90 transition-colors px-3.5 py-2 rounded-full"
          style={{
            background: "rgba(255,255,255,0.06)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <ArrowLeft className="w-3 h-3" />
          Home
        </Link>

        <motion.div
          className="w-full max-w-[380px] py-4"
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
            className="space-y-6"
          >
            <motion.div variants={rowVariants}>
              <h1
                className="text-[2.6rem] leading-[1.1] text-foreground"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Create account.
              </h1>
              <p className="text-muted text-sm mt-2">Join thousands of campus students</p>
            </motion.div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <motion.div variants={rowVariants}>
                <Input
                  type="text"
                  placeholder="Full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  autoComplete="name"
                  required
                />
              </motion.div>

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
                  placeholder="Password (min. 8 chars)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-12"
                  autoComplete="new-password"
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

              <motion.div variants={rowVariants}>
                <Input
                  type="password"
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                />
              </motion.div>

              {/* Role selector */}
              <motion.div variants={rowVariants} className="grid grid-cols-2 gap-2 pt-1">
                {(
                  [
                    { value: "client", title: "Client", desc: "I want to hire talent" },
                    { value: "freelancer", title: "Freelancer", desc: "I want to find work" },
                  ] as { value: Role; title: string; desc: string }[]
                ).map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setRole(opt.value)}
                    className={`flex flex-col items-start gap-0.5 px-4 py-3.5 rounded-xl border text-left transition-all duration-200 ${
                      role === opt.value
                        ? "border-primary/50 bg-primary/10"
                        : "border-border bg-surface hover:bg-surface-elevated"
                    }`}
                  >
                    <span className={`text-sm font-semibold ${role === opt.value ? "text-primary" : "text-foreground"}`}>
                      {opt.title}
                    </span>
                    <span className="text-[11px] text-muted leading-tight">{opt.desc}</span>
                  </button>
                ))}
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

              <motion.div variants={rowVariants} className="pt-1">
                <Button type="submit" size="lg" className="w-full" loading={loading}>
                  Create Account
                </Button>
              </motion.div>
            </form>

            <motion.p variants={rowVariants} className="text-center text-sm text-muted">
              Already have an account?{" "}
              <Link href="/signin" className="text-primary hover:text-primary-light font-medium transition-colors">
                Sign in
              </Link>
            </motion.p>
          </motion.div>
        </motion.div>
      </div>

      {/* ── Visual panel — dark code setup ── */}
      <AuthVisualPanel imageSrc={SIGNUP_IMAGE} />
    </div>
  );
}
