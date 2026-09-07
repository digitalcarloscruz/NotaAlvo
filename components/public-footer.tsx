import Link from "next/link";
import { Brand } from "@/components/brand";

export function PublicFooter() {
  return <footer className="enem-footer public-footer">
    <div><Brand /><p>Nota Alvo é uma plataforma de preparação para o ENEM operada por<br /><strong>INFORMATUS TECNOLOGIA E PROCESSOS</strong><br />CNPJ: 32.453.696/0001-06</p></div>
    <nav aria-label="Informações institucionais"><Link href="/contato">Empresa e contato</Link><Link href="/privacidade">Política de privacidade</Link><Link href="/termos">Termos de uso</Link><Link href="/cancelamento">Cancelamento e reembolso</Link></nav>
    <div><a href="mailto:contato@notafacil.com.br">contato@notafacil.com.br</a><p><a href="https://www.3cinova.com.br" target="_blank" rel="noopener noreferrer">Site institucional: www.3cinova.com.br</a></p><Link href="https://app.notaalvo.com.br/entrar">Acesso do aluno</Link></div>
    <p className="public-footer-note">Plataforma independente, sem vínculo com o MEC ou o Inep. O quiz é uma amostra de conhecimentos e não prevê nota nem garante aprovação.</p>
  </footer>;
}
