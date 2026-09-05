import type { Metadata } from "next";
import { RotaProvider } from "@/components/providers/rota-provider";
import { AuthProvider } from "@/components/providers/auth-provider";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const metadataBase = new URL("https://www.notaalvo.com.br");
  const title = "Nota Alvo — Seu próximo acerto começa aqui";
  const description = "Preparação para o ENEM com diagnóstico, plano autoajustável e recomendações explicáveis.";
  return {
    metadataBase,
    title: { default: title, template: "%s | Nota Alvo" },
    description,
    openGraph: {
      title,
      description,
      type: "website",
      siteName: "Nota Alvo",
      locale: "pt_BR",
      images: [{ url: new URL("/og.png", metadataBase).toString(), width: 1200, height: 630, alt: "Nota Alvo — Saiba o que estudar. Agora." }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [new URL("/og.png", metadataBase).toString()],
    },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>
        <AuthProvider>
          <RotaProvider>{children}</RotaProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
