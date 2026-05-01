"use client";

import { useState } from "react";
import { loginAdmin } from "@/domain/admin/actions";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);

    try {
      const result = await loginAdmin({ email, passcode: password });

      if (!result.success) {
        const errorMsg = 'error' in result ? result.error : ('message' in result ? result.message : 'Unknown error');
        throw new Error(errorMsg);
      }

      toast.success("Identity Verified. Accessing Vault...");
      
      // Force a full router refresh and move to admin
      router.push("/admin");
      setTimeout(() => {
        window.location.href = "/admin"; // Fallback to ensure middleware sees the new cookie
      }, 100);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Authentication error";
      toast.error("Auth Failure: " + message);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div style={{ padding: '40px', color: 'white', maxWidth: '400px', margin: 'auto' }}>
      <h1 style={{ fontSize: '24px', marginBottom: '20px' }}>Secure Entry</h1>
      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <input 
          required
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Admin ID (Email)"
          style={{ padding: '10px', borderRadius: '8px', background: '#1e293b', border: '1px solid #334155', color: 'white' }}
        />
        <input 
          required
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Passcode"
          style={{ padding: '10px', borderRadius: '8px', background: '#1e293b', border: '1px solid #334155', color: 'white' }}
        />
        <button 
          disabled={isPending}
          type="submit"
          style={{ padding: '12px', borderRadius: '8px', background: '#0891b2', color: 'white', border: 'none', cursor: 'pointer' }}
        >
          {isPending ? "VERIFYING..." : "VERIFY IDENTITY"}
        </button>
      </form>
    </div>
  );
}
