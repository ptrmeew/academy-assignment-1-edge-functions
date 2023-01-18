import { config } from 'https://deno.land/x/dotenv@v3.2.0/mod.ts';
import * as path from 'https://deno.land/std@0.57.0/path/mod.ts';

config({
  path: path.dirname(path.fromFileUrl(import.meta.url)) + '/../../../../.env',
  export: true,
});

const execute = async () => {
  const pDatabasedTypes = Deno.run({
    cmd: [
      'npx',
      'supabase',
      'gen',
      'types',
      'typescript',
      '--project-id',
      Deno.env.get('SUPABASE_PROJECT_ID')!,
    ],
    stdout: 'piped',
  });

  const dbTypeOutput = await pDatabasedTypes.output();
  const dbTypes = new TextDecoder().decode(dbTypeOutput);
  await Deno.writeTextFile('./supabase/functions/types/database-types.ts', dbTypes);

  await pDatabasedTypes.status();
};

execute();
