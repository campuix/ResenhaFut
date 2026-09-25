-- Permite que dono/admin corrijam o nome de um membro do mesmo grupo
-- (ex.: quem entrou por link mágico e ficou com o início do e-mail como nome).

drop policy if exists "admin edita nome de membro" on public.profiles;
create policy "admin edita nome de membro" on public.profiles
  for update using (
    exists (
      select 1 from public.membros m
      where m.usuario_id = profiles.id
        and public.e_admin(m.grupo_id)
    )
  )
  with check (
    exists (
      select 1 from public.membros m
      where m.usuario_id = profiles.id
        and public.e_admin(m.grupo_id)
    )
  );
