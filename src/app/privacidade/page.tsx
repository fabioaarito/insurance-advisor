import Link from "next/link";
import { Shield, ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Política de Privacidade e Proteção de Dados",
  description:
    "Descobre como o Insurance Advisor protege os teus dados pessoais e de seguro.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center px-4 md:px-6">
          <Link
            href="/"
            className="flex items-center gap-2.5"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-brand">
              <Shield className="h-4.5 w-4.5 text-white" />
            </div>
            <span className="text-lg font-semibold text-gradient-brand">
              Insurance Advisor
            </span>
          </Link>
        </div>
      </header>

      <main className="container mx-auto max-w-3xl px-4 py-12 md:px-6 md:py-16">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar ao início
        </Link>

        <h1 className="text-3xl font-bold tracking-tight mb-2">
          Política de Privacidade e Proteção de Dados
        </h1>
        <p className="text-sm text-muted-foreground mb-10">
          Última atualização: Julho 2026
        </p>

        <div className="space-y-10 text-sm leading-relaxed text-muted-foreground">
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">
              1. Quem somos
            </h2>
            <p>
              O Insurance Advisor é uma aplicação que te ajuda a entender e gerir
              os teus seguros de forma simples. Esta política explica como
              tratamos os teus dados pessoais, de acordo com o Regulamento Geral
              de Proteção de Dados (RGPD) e a legislação portuguesa.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">
              2. Que dados recolhemos
            </h2>
            <p>Recolhemos apenas o estritamente necessário para o funcionamento da aplicação:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>
                <strong>Dados de conta:</strong> nome, email e foto de perfil,
                obtidos através do login com Google. Estes dados são fornecidos
                pelo próprio Google e não são recolhidos diretamente por nós.
              </li>
              <li>
                <strong>Documentos de seguro:</strong> ficheiros PDF que carregas
                voluntariamente (apólices, FINs, condições gerais, etc.).
              </li>
              <li>
                <strong>Dados extraídos dos documentos:</strong> informações
                estruturadas como nome da seguradora, tipo de seguro, coberturas,
                exclusões e valores de prémio.
              </li>
              <li>
                <strong>Histórico de conversas:</strong> mensagens trocadas com
                o assistente de IA dentro da aplicação.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">
              3. Como usamos os teus dados
            </h2>
            <p>Os teus dados são usados exclusivamente para:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Permitir-te aceder à aplicação e gerir a tua conta.</li>
              <li>Extrair automaticamente informações dos teus documentos de seguro.</li>
              <li>Permitir-te fazer perguntas sobre os teus seguros através do assistente de IA.</li>
              <li>Guardar o teu histórico de conversas para que possas continuar de onde paraste.</li>
            </ul>
            <p>
              <strong>Nunca</strong> usamos os teus dados para fins de
              publicidade, marketing ou qualquer outro fim além do descrito acima.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">
              4. Como protegemos os teus dados
            </h2>
            <p>Adotamos várias medidas para garantir a segurança dos teus dados:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>
                Os dados são armazenados em servidores seguros com encriptação em
                trânsito (HTTPS) e em repouso.
              </li>
              <li>
                Cada utilizador só tem acesso aos seus próprios dados. Não é
                possível ver ou aceder aos seguros de outro utilizador.
              </li>
              <li>
                Utilizamos os serviços de autenticação do Google, que seguem
                padrões de segurança de nível industrial.
              </li>
              <li>
                Não temos acesso às tuas senhas — a autenticação é tratada
                inteiramente pelo Google.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">
              5. Com quem partilhamos os teus dados
            </h2>
            <p>
              <strong>Não partilhamos os teus dados com ninguém.</strong> Os teus
              documentos e informações pessoais são usados exclusivamente dentro
              da aplicação para te fornecer o serviço.
            </p>
            <p>
              Os únicos serviços técnicos que utilizamos são:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>
                <strong>Firebase (Google):</strong> para autenticação, armazenamento
                de dados e ficheiros. Os dados ficam na tua conta e são protegidos
                pelas políticas de segurança do Google.
              </li>
              <li>
                <strong>Google Gemini:</strong> para processar os documentos de
                seguro e gerar respostas no assistente de IA. Os dados são enviados
                apenas para processamento e não são armazenados pelo Google para
                treino de modelos.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">
              6. Quanto tempo guardamos os teus dados
            </h2>
            <p>
              Os teus dados são mantidos enquanto tiveres uma conta ativa. Se
              eliminares a tua conta, todos os teus dados (documentos, dados
              extraídos e histórico de conversas) são eliminados de forma
              permanente.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">
              7. Os teus direitos
            </h2>
            <p>
              De acordo com o RGPD, tens direito a:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>
                <strong>Aceder</strong> aos teus dados pessoais e saber quais
                informações temos sobre ti.
              </li>
              <li>
                <strong>Corrigir</strong> dados incorretos ou incompletos.
              </li>
              <li>
                <strong>Eliminar</strong> os teus dados pessoais (direito ao
                esquecimento).
              </li>
              <li>
                <strong>Solicitar a portabilidade</strong> dos teus dados para
                outro serviço.
              </li>
              <li>
                <strong>Opor-se</strong> ao tratamento dos teus dados para certos
                fins.
              </li>
            </ul>
            <p>
              Para exercer estes direitos, podes eliminar a tua conta diretamente
              na aplicação ou contactar-nos através do email indicado abaixo.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">
              8. Cookies e tecnologias semelhantes
            </h2>
            <p>
              Utilizamos apenas cookies estritamente necessários ao funcionamento
              da aplicação (por exemplo, para manter a sessão de login ativa). Não
              utilizamos cookies de rastreamento ou publicitários.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">
              9. Menores de idade
            </h2>
            <p>
              O Insurance Advisor não é direcionado a menores de 16 anos. Se
              detetarmos que um utilizador é menor de 16 anos, a sua conta e
              dados serão eliminados.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">
              10. Alterações a esta política
            </h2>
            <p>
              Podemos atualizar esta política periodicamente. Qualquer alteração
              será publicada nesta página com a data de atualização. Recomendamos
              que revejas esta política de tempos a tempos.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">
              11. Contacto
            </h2>
            <p>
              Se tiveres dúvidas sobre esta política ou sobre como tratamos os
              teus dados, podes contactar-nos através do email:
            </p>
            <p className="font-medium text-foreground">
              privacidade@insuranceadvisor.pt
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
