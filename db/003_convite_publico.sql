-- Resenha Fut · permite que quem recebeu o link de convite veja o nome do grupo
-- antes de entrar, sem expor a tabela grupos inteira (RLS de grupos continua exigindo
-- ser membro para leitura direta). Só devolve id/nome/cidade, e só de quem sabe o slug.
-- Rode este arquivo no SQL Editor do projeto Supabase, depois do 002_pix_responsavel.sql.

create function public.grupo_publico(p_slug text)
returns table(id uuid, nome text, cidade text)
language sql security definer stable set search_path = '' as $$
  select id, nome, cidade from public.grupos where convite_slug = p_slug
$$;
