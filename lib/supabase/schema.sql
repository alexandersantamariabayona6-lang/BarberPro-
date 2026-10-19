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