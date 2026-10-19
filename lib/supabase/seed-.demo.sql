-- ============ Fase 2B: cuentas de prueba ============

update public.profiles p
set full_name = v.full_name,
    role = v.role::public.user_role,
    barbershop_id = s.id
from (values
  ('laura@demo.com',     'Laura Martínez',  'cliente', null),
  ('carlos@demo.com',    'Carlos Duarte',   'admin',   'golden-blade'),
  ('marta@demo.com',     'Marta Ríos',      'admin',   'the-gentlemans-cut'),
  ('andres@demo.com',    'Andrés Rojas',    'barbero', 'golden-blade'),
  ('camilo@demo.com',    'Camilo Pérez',    'barbero', 'golden-blade'),
  ('sebastian@demo.com', 'Sebastián Gómez', 'barbero', 'the-gentlemans-cut'),
  ('root@demo.com',      'Root BarberPro',  'root',    null)
) as v(email, full_name, role, shop_slug)
join auth.users u on u.email = v.email
left join public.barbershops s on s.slug = v.shop_slug
where p.id = u.id;

insert into public.barbers (profile_id, barbershop_id, name, specialty, rating)
select u.id, s.id, v.name, v.specialty, v.rating
from (values
  ('andres@demo.com',    'golden-blade',       'Andrés Rojas',    'Cortes clásicos y fade',     4.9),
  ('camilo@demo.com',    'golden-blade',       'Camilo Pérez',    'Barba y afeitado a navaja',  4.8),
  ('sebastian@demo.com', 'the-gentlemans-cut', 'Sebastián Gómez', 'Estilos modernos y diseños', 4.9)
) as v(email, slug, name, specialty, rating)
join auth.users u on u.email = v.email
join public.barbershops s on s.slug = v.slug;