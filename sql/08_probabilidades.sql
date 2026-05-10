-- ═══════════════════════════════════════════════════════════════
-- 08_probabilidades.sql
-- Tabla de probabilidades de animales administrable desde el panel
-- ═══════════════════════════════════════════════════════════════

-- 1. Tabla principal
create table if not exists public.probabilidades (
  id          serial primary key,
  animal      text    not null,
  emoji       text    not null default '🐾',
  numero      text    not null default '?',
  peso        integer not null default 10 check (peso >= 0 and peso <= 100),
  activo      boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Índice para consultas rápidas por animal
create unique index if not exists probabilidades_animal_idx on public.probabilidades (animal);

-- 2. Trigger para updated_at automático
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_probabilidades_updated_at on public.probabilidades;
create trigger trg_probabilidades_updated_at
  before update on public.probabilidades
  for each row execute function public.set_updated_at();

-- 3. RLS
alter table public.probabilidades enable row level security;

-- Lectura pública (el widget del cliente la necesita)
drop policy if exists "public_read_probabilidades" on public.probabilidades;
create policy "public_read_probabilidades"
  on public.probabilidades for select
  using (true);

-- Solo admins autenticados pueden escribir
drop policy if exists "admin_write_probabilidades" on public.probabilidades;
create policy "admin_write_probabilidades"
  on public.probabilidades for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- 4. RPC: upsert_probabilidad (create & update)
create or replace function public.upsert_probabilidad(
  p_animal text,
  p_emoji  text,
  p_numero text,
  p_peso   integer,
  p_activo boolean default true
) returns public.probabilidades language plpgsql security definer as $$
declare
  v_row public.probabilidades;
begin
  insert into public.probabilidades (animal, emoji, numero, peso, activo)
  values (p_animal, p_emoji, p_numero, p_peso, p_activo)
  on conflict (animal) do update
    set emoji  = excluded.emoji,
        numero = excluded.numero,
        peso   = excluded.peso,
        activo = excluded.activo
  returning * into v_row;

  return v_row;
end;
$$;

-- 5. RPC: delete_probabilidad
create or replace function public.delete_probabilidad(p_id integer)
returns void language plpgsql security definer as $$
begin
  delete from public.probabilidades where id = p_id;
end;
$$;

-- 6. Populate inicial desde los pesos por defecto del frontend
-- (Se ejecuta solo si la tabla está vacía)
do $$
begin
  if not exists (select 1 from public.probabilidades limit 1) then
    insert into public.probabilidades (animal, emoji, numero, peso) values
      ('Delfín',         '🐬', '0',   7),
      ('Ballena',        '🐳', '00',  4),
      ('Carnero',        '🐏', '01', 15),
      ('Toro',           '🐂', '02', 12),
      ('Ciempiés',       '🐛', '03',  5),
      ('Alacrán',        '🦂', '04',  6),
      ('León',           '🦁', '05', 18),
      ('Rana',           '🐸', '06', 10),
      ('Perico',         '🦜', '07',  8),
      ('Ratón',          '🐭', '08', 14),
      ('Águila',         '🦅', '09', 20),
      ('Tigre',          '🐯', '10', 22),
      ('Gato',           '🐱', '11', 25),
      ('Caballo',        '🐴', '12', 30),
      ('Mono',           '🐒', '13', 16),
      ('Paloma',         '🕊️', '14', 11),
      ('Zorro',          '🦊', '15',  9),
      ('Oso',            '🐻', '16', 13),
      ('Pavo',           '🦃', '17',  7),
      ('Burro',          '🫏', '18',  6),
      ('Chivo',          '🐐', '19', 10),
      ('Cochino',        '🐷', '20', 12),
      ('Gallo',          '🐓', '21', 15),
      ('Camello',        '🐫', '22',  5),
      ('Cebra',          '🦓', '23',  8),
      ('Iguana',         '🦎', '24',  7),
      ('Gallina',        '🐔', '25', 18),
      ('Vaca',           '🐄', '26', 20),
      ('Perro',          '🐶', '27', 35),
      ('Zamuro',         '🦅', '28',  4),
      ('Elefante',       '🐘', '29', 16),
      ('Caimán',         '🐊', '30',  9),
      ('Lapa',           '🦫', '31',  6),
      ('Ardilla',        '🐿️', '32', 11),
      ('Pescado',        '🐟', '33', 14),
      ('Venado',         '🦌', '34', 12),
      ('Jirafa',         '🦒', '35', 28),
      ('Culebra',        '🐍', '36',  8),
      ('Tortuga',        '🐢', '37',  7),
      ('Búfalo',         '🐃', '38',  9),
      ('Lechuza',        '🦉', '39', 10),
      ('Avispa',         '🐝', '40',  5),
      ('Canguro',        '🦘', '41', 10),
      ('Tucán',          '🐦', '42',  8),
      ('Mariposa',       '🦋', '43',  9),
      ('Chigüire',       '🦫', '44', 10),
      ('Garza',          '🦩', '45',  7),
      ('Puma',           '🐆', '46', 14),
      ('Pavo Real',      '🦚', '47', 11),
      ('Puercoespín',    '🦔', '48',  5),
      ('Pereza',         '🦥', '49',  6),
      ('Canario',        '🐤', '50', 12),
      ('Pelícano',       '🦤', '51',  8),
      ('Pulpo',          '🐙', '52',  7),
      ('Caracol',        '🐌', '53',  5),
      ('Grillo',         '🦗', '54',  4),
      ('Oso Hormiguero', '🐜', '55',  6),
      ('Tiburón',        '🦈', '56', 18),
      ('Pato',           '🦆', '57', 13),
      ('Hormiga',        '🐜', '58',  5),
      ('Pantera',        '🐈‍⬛', '59', 16),
      ('Camaleón',       '🦎', '60',  8),
      ('Panda',          '🐼', '61', 20),
      ('Cachicamo',      '🦔', '62',  7),
      ('Cangrejo',       '🦀', '63',  9),
      ('Gavilán',        '🦅', '64', 12),
      ('Araña',          '🕷️', '65',  7),
      ('Lobo',           '🐺', '66', 15),
      ('Avestruz',       '🦩', '67',  8),
      ('Jaguar',         '🐆', '68', 17),
      ('Conejo',         '🐇', '69', 22),
      ('Bisonte',        '🦬', '70', 10),
      ('Guacamaya',      '🦜', '71', 12),
      ('Gorila',         '🦍', '72', 14),
      ('Hipopótamo',     '🦛', '73', 10),
      ('Guácharo',       '🦇', '74',  6),
      ('Turpial',        '🐦', '75',  8);
  end if;
end $$;
