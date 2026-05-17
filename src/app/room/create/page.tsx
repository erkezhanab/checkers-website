"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Check, Copy, Loader2, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const generateCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();

export default function CreateRoomPage() {
  const router = useRouter();
  const supabase = createClient();

  const [roomCode, setRoomCode] = useState("");
  const [status, setStatus] = useState<"loading" | "waiting" | "error">("loading");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    const setup = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        router.push("/auth/login?from=/room/create");
        return;
      }

      const code = generateCode();
      setRoomCode(code);

      const { error: insertError } = await supabase.from("rooms").insert({
        code,
        host_id: session.user.id,
        status: "waiting",
        created_at: new Date().toISOString(),
      });

      if (insertError) {
        setError(`Could not create room: ${insertError.message}`);
        setStatus("error");
        return;
      }

      setStatus("waiting");

      // Subscribe — when a guest sets guest_id, go to the game page
      const channel = supabase
        .channel(`room-create-${code}`)
        .on(
          "postgres_changes",
          { event: "UPDATE", schema: "public", table: "rooms", filter: `code=eq.${code}` },
          (payload) => {
            const updated = payload.new as { guest_id?: string; status?: string };
            if (updated.guest_id) {
              router.push(`/room/${code}`);
            }
          }
        )
        .subscribe();

      channelRef.current = channel;
    };

    setup();

    return () => {
      channelRef.current?.unsubscribe();
    };
  }, []);

  const copyCode = async () => {
    await navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 flex flex-col gap-6 text-center">
          <div>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Users className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Online Room</h1>
          </div>

          {status === "loading" && (
            <div className="flex items-center justify-center gap-2 text-gray-500">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Creating room…</span>
            </div>
          )}

          {status === "error" && (
            <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}

          {status === "waiting" && (
            <>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Your room code</p>
                <div className="text-5xl font-mono font-bold tracking-widest text-gray-900 dark:text-gray-100 mb-4">
                  {roomCode}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Share this code with your friend
                </p>
              </div>

              <button
                onClick={copyCode}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-bold transition-colors"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? "Copied!" : "Copy Code"}
              </button>

              <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
                <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                Waiting for opponent…
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
