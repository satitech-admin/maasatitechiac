-- Align the already-deployed registration function with the official form.
-- Replacing the existing definition preserves its owner and grants.
do $migration$
declare
  definition text;
begin
  select pg_get_functiondef('public.iac_december_submit(jsonb)'::regprocedure)
    into strict definition;

  if position('2026-12-06 00:00:00+05:30' in definition) > 0 then
    return;
  end if;

  if position('2026-12-10 00:00:00+05:30' in definition) = 0 then
    raise exception 'Unexpected registration cutoff definition';
  end if;

  execute replace(definition, '2026-12-10 00:00:00+05:30',
    '2026-12-06 00:00:00+05:30');
end
$migration$;
