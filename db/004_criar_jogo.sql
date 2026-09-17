-- Resenha Fut · campos para a tela "Criar/editar jogo" (seção 7 do handoff).
-- Rode este arquivo no SQL Editor do projeto Supabase, depois do 003_convite_publico.sql.

alter table public.jogos
  add column recorrencia text not null default 'unica'
    check (recorrencia in ('unica', 'mensal', 'semanal'));

alter table public.jogos
  add column chave_pix text;

alter table public.jogos
  add column recado text;

-- Não está na lista de migrações do README, mas o formulário desenhado (seção 7,
-- grupo "Onde") pede Quadra e Tipo como campos separados lado a lado.
alter table public.jogos
  add column tipo text;
