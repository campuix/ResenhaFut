-- Resenha Fut · campo para a tela "Acessos" (seção 9 do handoff).
-- Rode este arquivo no SQL Editor do projeto Supabase, depois do 005_perfil_jogador.sql.

alter table public.membros
  add column if not exists entrou_como_admin_em timestamptz;

-- membros_publicos precisa expor a nova coluna (não é sensível como faltas,
-- então não precisa de máscara por papel). A coluna nova vai no final do select:
-- create or replace view exige que colunas já existentes mantenham a mesma posição.
create or replace view public.membros_publicos
with (security_invoker = true) as
  select grupo_id, usuario_id, papel, nivel, posicao, entrou_em,
         case when public.e_admin(grupo_id) then faltas else null end as faltas,
         entrou_como_admin_em
  from public.membros;
