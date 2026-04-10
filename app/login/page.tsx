"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro("");
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setErro("Email ou senha inválidos.");
        setLoading(false);
        return;
      }

      router.replace("/admin");
      router.refresh();
    } catch {
      setErro("Erro ao tentar entrar.");
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      {/* Fundo */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/sequoia-bg.jpeg')" }}
      />

      <div className="absolute inset-0 bg-black/70" />
      <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/65 to-black/80" />

      <form
        onSubmit={handleLogin}
        className="relative z-10 w-full max-w-md rounded-2xl border border-white/10 bg-white/95 p-8 shadow-2xl backdrop-blur-sm"
      >
        <div className="mb-6 text-center">
          <p className="mb-2 text-sm font-medium uppercase tracking-[0.25em] text-red-600">
            Sequóia
          </p>
          <h1 className="text-3xl font-bold text-zinc-900">Entrar no sistema</h1>
          <p className="mt-2 text-sm text-zinc-600">
            Acesse sua conta para gerenciar pedidos e ordens de serviço.
          </p>
        </div>

        {/* EMAIL */}
        <div className="mb-4">
          <label className="mb-2 block text-sm font-semibold text-zinc-800">
            Email
          </label>
          <input
            type="email"
            placeholder="Digite seu Email"
            className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-black outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-200"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </div>

        {/* SENHA */}
        <div className="mb-4">
          <label className="mb-2 block text-sm font-semibold text-zinc-800">
            Senha
          </label>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Digite sua senha"
              className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 pr-12 text-black outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-200"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />

            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-red-600 transition"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        {erro ? (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {erro}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-black px-4 py-3 font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}