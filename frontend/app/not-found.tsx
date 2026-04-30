"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Stamp } from "@/components/ui/stamp";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <div className="mx-auto w-full max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 28 }}
          className="grid grid-cols-12 gap-6 items-end"
        >
          <div className="col-span-12 md:col-span-9">
            <Link
              href="/"
              className="font-serif italic text-[20px] leading-none text-foreground"
            >
              CampusGigs
            </Link>
            <span className="mt-10 block font-mono text-[11px] uppercase tracking-[0.2em] text-subtle">
              Error · 404
            </span>
            <h1 className="mt-3 font-serif text-[3rem] sm:text-[4.5rem] leading-[1] tracking-tight text-foreground">
              The page you requested
              <br />
              <em className="italic text-primary">is no longer here.</em>
            </h1>
            <p className="mt-6 text-[15px] text-muted max-w-md leading-relaxed">
              Home is just a click away. Let&apos;s go back and continue.
            </p>
          </div>
          <div className="col-span-12 md:col-span-3 flex md:justify-end">
            <Stamp variant="seal" tone="terracotta" size={120} rotation={-8} />
          </div>
        </motion.div>

        <div className="mt-12 border-t border-rule pt-6 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[14px] text-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-subtle">
            Code #404
          </span>
        </div>
      </div>
    </div>
  );
}
