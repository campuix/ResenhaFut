-- Resenha Fut · chave Pix de quem administra o rateio de cada jogo.
-- A chave pertence ao jogador responsável (não à quadra) e pode variar a cada jogo.
-- Rode este arquivo no SQL Editor do projeto Supabase, depois do schema.sql original.

alter table public.jogos
  add column responsavel_pagamento uuid references public.profiles;

alter table public.membros
  add column chave_pix text;

-- Um jogador pode editar a própria chave Pix. Os demais campos de membros
-- (papel, nivel, faltas) continuam só editáveis por admin, via a policy já existente.
create policy "jogador edita a propria chave pix" on public.membros
  for update using (usuario_id = auth.uid())
  with check (usuario_id = auth.uid());
