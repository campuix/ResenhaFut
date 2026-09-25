-- Resenha Fut · encurta o código do link de convite: 6 caracteres em vez do
-- hex de 12 (ex.: "resenha-fut.vercel.app/j/k7m2pq" em vez de "…/j/7a9f7d007d6d").
-- Sem 0/O/1/I/l no alfabeto, pra não confundir quem digitar à mão.
-- Idempotente: a atualização só troca quem ainda está no formato hex antigo.
-- Rode este arquivo no SQL Editor do projeto Supabase.

create or replace function public.gerar_codigo_convite() returns text
language sql volatile set search_path = '' as $$
  select string_agg(substr('abcdefghjkmnpqrstuvwxyz23456789', ceil(random() * 31)::int, 1), '')
  from generate_series(1, 6)
$$;

alter table public.grupos
  alter column convite_slug set default public.gerar_codigo_convite();

update public.grupos
set convite_slug = public.gerar_codigo_convite()
where convite_slug ~ '^[0-9a-f]{12}$';
