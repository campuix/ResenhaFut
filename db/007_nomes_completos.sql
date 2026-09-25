-- Nome completo dos jogadores: usa full_name/name do Google no primeiro login,
-- e corrige quem já ficou com o início do e-mail como nome.
-- Idempotente: só re-escreve o trigger (CREATE OR REPLACE) e só atualiza quem
-- ainda precisa — pode rodar de novo sem problema.

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, nome, telefone)
  values (new.id,
          coalesce(
            nullif(new.raw_user_meta_data->>'full_name', ''),
            nullif(new.raw_user_meta_data->>'name', ''),
            split_part(new.email, '@', 1),
            'Jogador'
          ),
          new.phone);
  return new;
end $$;

-- Corrige quem já tem conta e ainda está com o início do e-mail (ou nome vazio)
-- como nome, usando o nome do Google quando disponível.
update public.profiles p
set nome = coalesce(
  nullif(u.raw_user_meta_data->>'full_name', ''),
  nullif(u.raw_user_meta_data->>'name', ''),
  p.nome
)
from auth.users u
where u.id = p.id
  and (p.nome is null or p.nome = '' or p.nome = split_part(u.email, '@', 1))
  and coalesce(nullif(u.raw_user_meta_data->>'full_name', ''), nullif(u.raw_user_meta_data->>'name', '')) is not null;
