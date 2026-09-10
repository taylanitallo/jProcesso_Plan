import { useState } from 'react'
import { AlertTriangle, Award, ScrollText, ShieldCheck, X } from 'lucide-react'
import { useAuth } from '../../store/auth'
import { useInstituicao } from '../../store/instituicao'
import { useCertificados, UFS, type CadastroCertificado } from '../../store/certificados'

const VAZIO: CadastroCertificado = {
  email: '',
  nome: '',
  cpf: '',
  rg: '',
  nascimento: '',
  pais: '',
  estado: '',
  cidade: '',
}

export function GerenciarCertificadosModal({
  pessoaId,
  pessoaNome,
  pessoaEmail,
  onClose,
}: {
  pessoaId: string
  pessoaNome: string
  pessoaEmail: string
  onClose: () => void
}) {
  const user = useAuth((s) => s.user)
  const instituicao = useInstituicao((s) => s.instituicao)
  const cadastroSalvo = useCertificados((s) => s.cadastros[pessoaId])
  const certificado = useCertificados((s) => s.certificados[pessoaId])
  const salvarCadastro = useCertificados((s) => s.salvarCadastro)
  const gerar = useCertificados((s) => s.gerar)
  const revogar = useCertificados((s) => s.revogar)

  const [aba, setAba] = useState<'cadastro' | 'certificados'>('cadastro')
  const [form, setForm] = useState<CadastroCertificado>(
    cadastroSalvo ?? {
      ...VAZIO,
      nome: pessoaNome,
      email: pessoaEmail,
      pais: 'Brasil',
      estado: instituicao.uf,
      cidade: instituicao.cidade,
    },
  )
  const [revogarOpen, setRevogarOpen] = useState(false)

  const set = (k: keyof CadastroCertificado, v: string) => setForm((f) => ({ ...f, [k]: v }))
  const podeSalvar = form.email.trim() && form.nome.trim() && form.cpf.trim()

  return (
    <div
      className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto bg-[rgba(9,21,44,0.6)] p-3 backdrop-blur-sm sm:p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="relative my-4 w-full max-w-[1320px] rounded-[20px] bg-white p-6 shadow-[var(--shadow-pop)]">
        <button
          onClick={onClose}
          aria-label="Fechar"
          className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-white text-[var(--color-muted)] shadow"
        >
          <X size={16} />
        </button>

        <div className="flex items-start gap-3 pr-8">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[12px] bg-[var(--color-primary-soft)] text-[var(--color-primary-strong)]">
            <ScrollText size={22} />
          </span>
          <div>
            <h3 className="font-display text-base font-bold text-[#183263]">Gerenciar certificados</h3>
            <p className="text-xs text-[var(--color-muted)]">
              Cadastre os dados do responsável e acompanhe os certificados emitidos no contrato.
            </p>
          </div>
        </div>

        <div className="mt-5 flex rounded-[var(--radius-pill)] border border-[var(--color-line)] bg-[#f4f7fc] p-1">
          {(['cadastro', 'certificados'] as const).map((a) => (
            <button
              key={a}
              onClick={() => setAba(a)}
              className={`flex-1 rounded-[var(--radius-pill)] px-4 py-2 text-xs font-semibold capitalize transition ${
                aba === a
                  ? 'bg-[linear-gradient(135deg,#22b8a6_0%,#1f6fd0_100%)] text-white'
                  : 'text-[var(--color-muted)]'
              }`}
            >
              {a === 'cadastro' ? 'Cadastro' : 'Certificados'}
            </button>
          ))}
        </div>

        {aba === 'cadastro' ? (
          <div className="mt-5 rounded-[var(--radius-card)] border border-[var(--color-line)] p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <Campo label="Email" value={form.email} onChange={(v) => set('email', v)} placeholder="Digite o email" />
              <Campo label="Nome" value={form.nome} onChange={(v) => set('nome', v)} placeholder="Digite o nome completo" />
              <Campo label="CPF/CNPJ" value={form.cpf} onChange={(v) => set('cpf', v)} placeholder="Digite o CPF ou CNPJ" />
              <Campo label="RG" value={form.rg} onChange={(v) => set('rg', v)} placeholder="Digite o RG" />
              <label className="flex flex-col gap-1.5 text-xs font-bold uppercase tracking-wide text-[var(--color-muted)]">
                Data de nascimento
                <input
                  type="date"
                  value={form.nascimento}
                  onChange={(e) => set('nascimento', e.target.value)}
                  className="gt-input font-normal normal-case"
                />
              </label>
              <Campo label="País" value={form.pais} onChange={(v) => set('pais', v)} placeholder="Digite o país de residência" />
              <label className="flex flex-col gap-1.5 text-xs font-bold uppercase tracking-wide text-[var(--color-muted)]">
                Estado
                <select
                  value={form.estado}
                  onChange={(e) => set('estado', e.target.value)}
                  className="gt-input font-normal normal-case"
                >
                  <option value="">Selecione o estado</option>
                  {UFS.map((uf) => (
                    <option key={uf} value={uf}>
                      {uf}
                    </option>
                  ))}
                </select>
              </label>
              <Campo label="Cidade" value={form.cidade} onChange={(v) => set('cidade', v)} placeholder="Digite a cidade de residência" />
            </div>
          </div>
        ) : (
          <div className="mt-5 space-y-4">
            <button
              onClick={() => gerar(pessoaId, user?.name ?? pessoaNome)}
              disabled={!cadastroSalvo || Boolean(certificado)}
              className="flex w-full items-center justify-center gap-2 rounded-[var(--radius-control)] bg-[linear-gradient(180deg,#2d68c4_0%,#1f56ad_100%)] py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Award size={16} /> Gerar Certificado
            </button>

            {!cadastroSalvo && (
              <p className="rounded-[var(--radius-control)] border border-[#f0d79a] bg-[#fdf6e3] px-3 py-2 text-xs font-semibold text-[#8a6d1a]">
                Preencha e salve o Cadastro antes de gerar o certificado.
              </p>
            )}

            {certificado ? (
              <div className="max-w-md rounded-[var(--radius-card)] border border-[#bfe6cf] bg-[#f2fbf6] p-4">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] bg-[#d7f5ea] px-2.5 py-1 text-[11px] font-bold text-[var(--color-success)]">
                    <ShieldCheck size={12} /> {certificado.status}
                  </span>
                  <button
                    onClick={() => setRevogarOpen(true)}
                    className="inline-flex items-center gap-1.5 rounded-[var(--radius-control)] bg-[var(--color-danger)] px-3 py-1.5 text-xs font-semibold text-white"
                  >
                    <AlertTriangle size={13} /> Revogar
                  </button>
                </div>
                <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                  <Info rotulo="Nome" valor={certificado.nome} span />
                  <Info rotulo="E-mail" valor={certificado.email} span />
                  <Info rotulo="CPF/CNPJ" valor={certificado.cpf} />
                  <Info rotulo="RG" valor={certificado.rg} />
                  <Info rotulo="Data de nascimento" valor={certificado.nascimento} />
                  <Info rotulo="Estado" valor={certificado.estado} />
                  <Info rotulo="Cidade" valor={certificado.cidade} />
                  <Info rotulo="País" valor={certificado.pais} />
                </dl>
                <div className="mt-3 rounded-[var(--radius-control)] bg-white px-3 py-2">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--color-muted)]">
                    Criado por
                  </p>
                  <p className="text-xs font-semibold text-[var(--color-primary)]">
                    {certificado.criadoPor}
                  </p>
                  <p className="text-[11px] text-[var(--color-muted)]">{certificado.criadoEm}</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-[var(--color-muted)]">
                Nenhum certificado encontrado para esta pessoa.
              </p>
            )}
          </div>
        )}

        {aba === 'cadastro' && (
          <button
            onClick={() => {
              salvarCadastro(pessoaId, form)
              setAba('certificados')
            }}
            disabled={!podeSalvar}
            className="mt-4 w-full rounded-[var(--radius-control)] bg-[linear-gradient(180deg,#2d68c4_0%,#1f56ad_100%)] py-2.5 text-sm font-bold uppercase tracking-wide text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            Salvar
          </button>
        )}
      </div>

      {revogarOpen && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-[rgba(9,21,44,0.5)] p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setRevogarOpen(false)
          }}
        >
          <div className="w-full max-w-md rounded-[16px] bg-white p-6 text-center shadow-[var(--shadow-pop)]">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-full border-2 border-[#f0d79a] text-[var(--color-warning)]">
              <AlertTriangle size={24} />
            </span>
            <p className="mt-3 font-display text-base font-bold text-[#183263]">Revogar certificado?</p>
            <p className="mt-2 text-sm text-[var(--color-muted)]">
              Ao revogar este certificado, <strong>esta pessoa não poderá assinar nenhum documento</strong>{' '}
              até que um novo certificado seja gerado. Deseja continuar?
            </p>
            <div className="mt-5 flex justify-center gap-2">
              <button
                onClick={() => setRevogarOpen(false)}
                className="rounded-[var(--radius-control)] bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  revogar(pessoaId)
                  setRevogarOpen(false)
                }}
                className="rounded-[var(--radius-control)] bg-[var(--color-danger)] px-5 py-2 text-sm font-semibold text-white"
              >
                Sim, revogar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Campo({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder: string
}) {
  return (
    <label className="flex flex-col gap-1.5 text-xs font-bold uppercase tracking-wide text-[var(--color-muted)]">
      {label}
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="gt-input font-normal normal-case"
      />
    </label>
  )
}

function Info({ rotulo, valor, span }: { rotulo: string; valor: string; span?: boolean }) {
  return (
    <div className={span ? 'col-span-2' : ''}>
      <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--color-muted)]">
        {rotulo}
      </p>
      <p className="font-semibold text-[var(--color-ink)]">{valor || '—'}</p>
    </div>
  )
}
