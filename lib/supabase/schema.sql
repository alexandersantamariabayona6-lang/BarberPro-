-- ============ BarberPro · Fase 1: tablas base ============

create type public.user_role as enum ('root', 'admin', 'barbero', 'cliente');
create type public.appointment_status as enum ('pendiente', 'confirmada', 'cancelada');

create table public.barbershops (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  city text not null,
  address text not null,
  description text not null default '',
  open_hours text not null default '',
  rating numeric(2,1) not null default 5.0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Un perfil por cada usuario de Supabase Auth (el correo vive en auth.users)
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  role public.user_role not null default 'cliente',
  barbershop_id uuid references public.barbershops (id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.services (
  id uuid primary key default gen_random_uuid(),
  barbershop_id uuid not null references public.barbershops (id) on delete cascade,
  name text not null,
  description text not null default '',
  price integer not null check (price > 0),
  duration_min integer not null check (duration_min > 0),
  created_at timestamptz not null default now()
);

create table public.barbers (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references public.profiles (id) on delete cascade,
  barbershop_id uuid not null references public.barbershops (id) on delete cascade,
  name text not null,
  specialty text not null default '',
  rating numeric(2,1) not null default 5.0,
  created_at timestamptz not null default now()
);

create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  barbershop_id uuid not null references public.barbershops (id) on delete cascade,
  barber_id uuid not null references public.barbers (id) on delete restrict,
  service_id uuid not null references public.services (id) on delete restrict,
  client_id uuid not null references public.profiles (id) on delete cascade,
  appt_date date not null,
  appt_time time not null,
  status public.appointment_status not null default 'pendiente',
  created_at timestamptz not null default now()
);

-- Códigos de invitación para admins y barberos
create table public.invitations (
  code text primary key,
  role public.user_role not null check (role in ('admin', 'barbero')),
  barbershop_id uuid references public.barbershops (id) on delete cascade,
  created_by uuid not null references public.profiles (id) on delete cascade,
  expires_at timestamptz not null,
  used_by uuid references public.profiles (id) on delete set null,
  used_at timestamptz,
  created_at timestamptz not null default now(),
  check (role <> 'barbero' or barbershop_id is not null)
);

-- Un barbero no puede tener dos citas activas a la misma hora
create unique index appointments_no_double_booking
  on public.appointments (barber_id, appt_date, appt_time)
  where status <> 'cancelada';

create index on public.services (barbershop_id);
create index on public.barbers (barbershop_id);
create index on public.appointments (barbershop_id, appt_date);
create index on public.appointments (client_id);

-- ============ Seguridad (RLS) ============
alter table public.barbershops enable row level security;
alter table public.profiles enable row level security;
alter table public.services enable row level security;
alter table public.barbers enable row level security;
alter table public.appointments enable row level security;
alter table public.invitations enable row level security;

-- Datos públicos: cualquiera puede ver barberías, servicios y barberos
create policy "Barberías activas visibles para todos"
  on public.barbershops for select using (active = true);
create policy "Servicios visibles para todos"
  on public.services for select using (true);
create policy "Barberos visibles para todos"
  on public.barbers for select using (true);

grant usage on schema public to anon, authenticated;

grant select on public.barbershops, public.services, public.barbers
  to anon, authenticated;

-- profiles, appointments e invitations quedan sin acceso desde el navegador
-- hasta que agreguemos sus políticas en las fases siguientes.

-- ============ Datos de ejemplo ============
insert into public.barbershops (slug, name, city, address, description, open_hours, rating) values
  ('golden-blade', 'Golden Blade', 'Bucaramanga', 'Cra. 27 #36-20', 'Barbería clásica con ambiente de club privado.', 'Lun–Sáb · 9:00 a 19:00', 4.9),
  ('the-gentlemans-cut', 'The Gentleman''s Cut', 'Medellín', 'Cl. 10 #40-15', 'Cortes modernos y afeitado tradicional.', 'Lun–Dom · 10:00 a 20:00', 4.7);

insert into public.services (barbershop_id, name, description, price, duration_min)
select b.id, v.name, v.description, v.price, v.duration_min
from (values
  ('golden-blade', 'Corte clásico', 'Corte a tijera o máquina, lavado y peinado.', 35000, 40),
  ('golden-blade', 'Arreglo de barba', 'Perfilado con navaja y toalla caliente.', 25000, 30),
  ('golden-blade', 'Combo premium', 'Corte + barba + mascarilla facial.', 55000, 75),
  ('the-gentlemans-cut', 'Corte moderno', 'Fade, diseños y acabado con producto.', 40000, 45),
  ('the-gentlemans-cut', 'Afeitado tradicional', 'Afeitado con navaja y toalla caliente.', 30000, 35)
) as v(slug, name, description, price, duration_min)
join public.barbershops b on b.slug = v.slug;


-- ============ Fase 2A: perfiles, roles e invitaciones ============

-- Cada usuario nuevo recibe un perfil. SIEMPRE como cliente:
-- el rol nunca lo decide el navegador.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data ->> 'full_name', ''), split_part(new.email, '@', 1)),
    'cliente'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Perfiles: cada usuario lee el suyo y solo puede editar su nombre
grant select on public.profiles to authenticated;
grant update (full_name) on public.profiles to authenticated;

create policy "Cada usuario ve su propio perfil"
  on public.profiles for select to authenticated
  using (id = (select auth.uid()));

create policy "Cada usuario edita su propio perfil"
  on public.profiles for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- Ayudas para saber el rol y la barbería de quien está conectado
create or replace function public.my_role()
returns public.user_role
language sql stable security definer
set search_path = ''
as $$ select role from public.profiles where id = (select auth.uid()) $$;

create or replace function public.my_barbershop()
returns uuid
language sql stable security definer
set search_path = ''
as $$ select barbershop_id from public.profiles where id = (select auth.uid()) $$;

-- Crear invitación: el root crea de admin, el admin crea de barbero
create or replace function public.create_invitation(p_role public.user_role)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_role public.user_role := public.my_role();
  v_shop uuid;
  v_code text := 'BP-';
  v_alphabet constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
begin
  if v_role = 'root' and p_role = 'admin' then
    v_shop := null;
  elsif v_role = 'admin' and p_role = 'barbero' then
    v_shop := public.my_barbershop();
    if v_shop is null then
      raise exception 'Primero debes crear tu barbería';
    end if;
  else
    raise exception 'No tienes permiso para crear esta invitación';
  end if;

  for i in 1..8 loop
    v_code := v_code || substr(v_alphabet, 1 + floor(random() * length(v_alphabet))::int, 1);
  end loop;

  insert into public.invitations (code, role, barbershop_id, created_by, expires_at)
  values (v_code, p_role, v_shop, auth.uid(), now() + interval '7 days');

  return v_code;
end;
$$;

-- Revisar un código antes de registrarse (devuelve el rol o nada)
create or replace function public.check_invitation(p_code text)
returns public.user_role
language sql stable security definer
set search_path = ''
as $$
  select role from public.invitations
  where code = upper(trim(p_code)) and used_at is null and expires_at > now();
$$;

-- Canjear el código: asigna el rol (y crea el barbero si corresponde)
create or replace function public.redeem_invitation(p_code text)
returns public.user_role
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_inv public.invitations%rowtype;
  v_profile public.profiles%rowtype;
begin
  if v_uid is null then
    raise exception 'Debes iniciar sesión';
  end if;

  select * into v_profile from public.profiles where id = v_uid;
  if not found or v_profile.role <> 'cliente' then
    raise exception 'Esta cuenta ya tiene un rol asignado';
  end if;

  select * into v_inv from public.invitations
  where code = upper(trim(p_code)) and used_at is null and expires_at > now()
  for update;
  if not found then
    raise exception 'Código inválido o vencido';
  end if;

  update public.profiles
  set role = v_inv.role, barbershop_id = v_inv.barbershop_id
  where id = v_uid;

  if v_inv.role = 'barbero' then
    insert into public.barbers (profile_id, barbershop_id, name, specialty)
    values (v_uid, v_inv.barbershop_id, v_profile.full_name, 'Barbero');
  end if;

  update public.invitations set used_by = v_uid, used_at = now()
  where code = v_inv.code;

  return v_inv.role;
end;
$$;

-- Permisos de las funciones
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.my_role() from public, anon;
revoke execute on function public.my_barbershop() from public, anon;
revoke execute on function public.create_invitation(public.user_role) from public, anon;
revoke execute on function public.redeem_invitation(text) from public, anon;
revoke execute on function public.check_invitation(text) from public;

grant execute on function public.my_role() to authenticated;
grant execute on function public.my_barbershop() to authenticated;
grant execute on function public.create_invitation(public.user_role) to authenticated;
grant execute on function public.redeem_invitation(text) to authenticated;
grant execute on function public.check_invitation(text) to anon, authenticated;


-- ============ Fase 3.2: citas ============

grant select on public.appointments to authenticated;

-- Quién ve cada cita: el cliente la suya, el barbero las suyas, el admin las de su barbería
create policy "Citas visibles según el rol"
  on public.appointments for select to authenticated
  using (
    client_id = (select auth.uid())
    or barber_id in (
      select b.id from public.barbers b where b.profile_id = (select auth.uid())
    )
    or (public.my_role() = 'admin' and barbershop_id = public.my_barbershop())
  );

-- Quien puede ver una cita puede ver el nombre del cliente
create policy "Ver perfiles de clientes con citas visibles"
  on public.profiles for select to authenticated
  using (
    exists (select 1 from public.appointments a where a.client_id = profiles.id)
  );

-- Horarios ocupados de un barbero (solo hora y duración, sin datos personales)
create or replace function public.busy_slots(p_barber uuid, p_date date)
returns table (start_time time, duration_min integer)
language sql stable security definer
set search_path = ''
as $$
  select a.appt_time, s.duration_min
  from public.appointments a
  join public.services s on s.id = a.service_id
  where a.barber_id = p_barber
    and a.appt_date = p_date
    and a.status <> 'cancelada';
$$;

-- Crear una cita (todas las validaciones en el servidor)
create or replace function public.create_appointment(
  p_service uuid, p_barber uuid, p_date date, p_time time
)
returns uuid
language plpgsql security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_shop uuid;
  v_duration integer;
  v_barber_shop uuid;
  v_id uuid;
begin
  if v_uid is null then
    raise exception 'Debes iniciar sesión';
  end if;
  if public.my_role() <> 'cliente' then
    raise exception 'Solo los clientes pueden reservar';
  end if;

  select barbershop_id, duration_min into v_shop, v_duration
  from public.services where id = p_service;
  if not found then
    raise exception 'Servicio no encontrado';
  end if;

  select barbershop_id into v_barber_shop from public.barbers where id = p_barber;
  if not found or v_barber_shop <> v_shop then
    raise exception 'Ese barbero no pertenece a esta barbería';
  end if;

  if (p_date + p_time) <= (now() at time zone 'America/Bogota') then
    raise exception 'Esa hora ya pasó';
  end if;

  if exists (
    select 1
    from public.appointments a
    join public.services s on s.id = a.service_id
    where a.barber_id = p_barber
      and a.appt_date = p_date
      and a.status <> 'cancelada'
      and p_time < a.appt_time + make_interval(mins => s.duration_min)
      and a.appt_time < p_time + make_interval(mins => v_duration)
  ) then
    raise exception 'Ese horario ya no está disponible';
  end if;

  insert into public.appointments
    (barbershop_id, barber_id, service_id, client_id, appt_date, appt_time, status)
  values
    (v_shop, p_barber, p_service, v_uid, p_date, p_time, 'pendiente')
  returning id into v_id;

  return v_id;
end;
$$;

-- Cancelar: el cliente su cita, o el admin las de su barbería
create or replace function public.cancel_appointment(p_id uuid)
returns void
language plpgsql security definer
set search_path = ''
as $$
declare
  v_appt public.appointments%rowtype;
begin
  select * into v_appt from public.appointments where id = p_id;
  if not found then
    raise exception 'Cita no encontrada';
  end if;

  if not (
    v_appt.client_id = auth.uid()
    or (public.my_role() = 'admin' and v_appt.barbershop_id = public.my_barbershop())
  ) then
    raise exception 'No puedes cancelar esta cita';
  end if;

  update public.appointments set status = 'cancelada' where id = p_id;
end;
$$;

-- Permisos
revoke execute on function public.busy_slots(uuid, date) from public;
revoke execute on function public.create_appointment(uuid, uuid, date, time) from public, anon;
revoke execute on function public.cancel_appointment(uuid) from public, anon;

grant execute on function public.busy_slots(uuid, date) to anon, authenticated;
grant execute on function public.create_appointment(uuid, uuid, date, time) to authenticated;
grant execute on function public.cancel_appointment(uuid) to authenticated;


-- ============ Fase 3.3: barbería del admin y servicios ============

-- El admin gestiona solo los servicios de su barbería
grant insert, update, delete on public.services to authenticated;

create policy "Admin crea servicios de su barbería"
  on public.services for insert to authenticated
  with check (public.my_role() = 'admin' and barbershop_id = public.my_barbershop());

create policy "Admin edita servicios de su barbería"
  on public.services for update to authenticated
  using (public.my_role() = 'admin' and barbershop_id = public.my_barbershop())
  with check (public.my_role() = 'admin' and barbershop_id = public.my_barbershop());

create policy "Admin elimina servicios de su barbería"
  on public.services for delete to authenticated
  using (public.my_role() = 'admin' and barbershop_id = public.my_barbershop());

-- Crear la barbería del admin (una sola vez) y vincularla a su perfil
create or replace function public.create_barbershop(
  p_name text, p_city text, p_address text, p_description text, p_open_hours text
)
returns text
language plpgsql security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_base text;
  v_slug text;
  v_n integer := 1;
  v_id uuid;
begin
  if public.my_role() <> 'admin' then
    raise exception 'Solo los administradores pueden crear una barbería';
  end if;
  if public.my_barbershop() is not null then
    raise exception 'Ya tienes una barbería';
  end if;
  if length(trim(coalesce(p_name, ''))) < 2
     or length(trim(coalesce(p_city, ''))) < 2
     or length(trim(coalesce(p_address, ''))) < 2 then
    raise exception 'Nombre, ciudad y dirección son obligatorios';
  end if;

  -- Dirección web amigable: "La Navaja Dorada" -> "la-navaja-dorada"
  v_base := regexp_replace(
    lower(translate(trim(p_name), 'áéíóúüñÁÉÍÓÚÜÑ', 'aeiouunaeiouun')),
    '[^a-z0-9]+', '-', 'g'
  );
  v_base := trim(both '-' from v_base);
  if v_base = '' then
    v_base := 'barberia';
  end if;

  v_slug := v_base;
  while exists (select 1 from public.barbershops where slug = v_slug) loop
    v_n := v_n + 1;
    v_slug := v_base || '-' || v_n;
  end loop;

  insert into public.barbershops (slug, name, city, address, description, open_hours)
  values (
    v_slug, trim(p_name), trim(p_city), trim(p_address),
    trim(coalesce(p_description, '')), trim(coalesce(p_open_hours, ''))
  )
  returning id into v_id;

  update public.profiles set barbershop_id = v_id where id = v_uid;

  return v_slug;
end;
$$;

revoke execute on function public.create_barbershop(text, text, text, text, text) from public, anon;
grant execute on function public.create_barbershop(text, text, text, text, text) to authenticated;

-- ============ Fase 3.4: barberos y citas del admin ============

-- El admin ve las invitaciones de barbero de su barbería
grant select on public.invitations to authenticated;

create policy "Admin ve las invitaciones de su barbería"
  on public.invitations for select to authenticated
  using (
    public.my_role() = 'admin'
    and role = 'barbero'
    and barbershop_id = public.my_barbershop()
  );

-- El admin edita nombre y especialidad de los barberos de su barbería
grant update (name, specialty) on public.barbers to authenticated;

create policy "Admin edita barberos de su barbería"
  on public.barbers for update to authenticated
  using (public.my_role() = 'admin' and barbershop_id = public.my_barbershop())
  with check (public.my_role() = 'admin' and barbershop_id = public.my_barbershop());

-- Quitar un barbero (solo si no tiene citas); su cuenta vuelve a ser de cliente
create or replace function public.remove_barber(p_barber uuid)
returns void
language plpgsql security definer
set search_path = ''
as $$
declare
  v_b public.barbers%rowtype;
begin
  if public.my_role() <> 'admin' then
    raise exception 'No tienes permiso para hacer esto';
  end if;

  select * into v_b from public.barbers where id = p_barber;
  if not found or v_b.barbershop_id is distinct from public.my_barbershop() then
    raise exception 'Barbero no encontrado';
  end if;

  if exists (select 1 from public.appointments where barber_id = p_barber) then
    raise exception 'No puedes quitar a este barbero porque tiene citas asociadas';
  end if;

  delete from public.barbers where id = p_barber;
  update public.profiles
  set role = 'cliente', barbershop_id = null
  where id = v_b.profile_id;
end;
$$;

-- Confirmar una cita pendiente de la barbería del admin
create or replace function public.confirm_appointment(p_id uuid)
returns void
language plpgsql security definer
set search_path = ''
as $$
declare
  v_a public.appointments%rowtype;
begin
  select * into v_a from public.appointments where id = p_id;
  if not found then
    raise exception 'Cita no encontrada';
  end if;

  if public.my_role() <> 'admin'
     or v_a.barbershop_id is distinct from public.my_barbershop() then
    raise exception 'No puedes confirmar esta cita';
  end if;

  if v_a.status <> 'pendiente' then
    raise exception 'Solo se pueden confirmar citas pendientes';
  end if;

  update public.appointments set status = 'confirmada' where id = p_id;
end;
$$;

revoke execute on function public.remove_barber(uuid) from public, anon;
revoke execute on function public.confirm_appointment(uuid) from public, anon;
grant execute on function public.remove_barber(uuid) to authenticated;
grant execute on function public.confirm_appointment(uuid) to authenticated;