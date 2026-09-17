-- Resenha Fut · campos e permissão para a tela "Perfil do jogador" (seção 8 do handoff).
-- Rode este arquivo no SQL Editor do projeto Supabase, depois do 004_criar_jogo.sql.
-- Usa IF NOT EXISTS / verificação de policy existente para poder rodar mais de uma vez sem erro.

alter table public.profiles
  add column if not exists chave_pix text;

-- O jogador escolhe a própria posição preferida (Goleiro/Zaga/Meia/Ataque).
-- Nível, papel e faltas continuam só editáveis por admin, via a policy já existente.
do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'membros' and policyname = 'jogador edita a propria posicao'
  ) then
    create policy "jogador edita a propria posicao" on public.membros
      for update using (usuario_id = auth.uid())
      with check (usuario_id = auth.uid());
  end if;
end $$;
