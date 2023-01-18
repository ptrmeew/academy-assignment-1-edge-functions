## Supabase edge functions

This repository contains all the edge functions for your supabase project. Before you can start working on edge functions, you must [install the supabase cli](https://supabase.com/docs/guides/resources/supabase-cli), and login and link it to your supabase project. to login run 

>*supabase login* 

To link the supabase cli to your supabase project run

>*supabase link --project-ref \<project-id>*

Where project-id can be found in the supabase settings under general.

Create a new function while in this folder with the 

>*supabase functions new NAME_OF_YOUR_FUNCTION* 

command. This will create a new function with the supplied name in theserverless/supabase/functions.

The supabase edge functions are written in deno instead of node. Therefore you need to install [deno](https://deno.land/) to run the included scripts for this
project. Your IDE also need to able to understand deno as there are a lot of differences between node and deno. For VSCode there is an extension that enables
deno linting.

## Environment Variables

Supabase already has some of the secrets defined. They are:

- SUPABASE_URL
- SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- SUPABASE_DB_URL

To work with env secrets, create a .env file in the /supabase folder. To use the secrets while serving the function locally use the following command

> _supabase functions new NAME_OF_YOUR_FUNCTION --env-file PATH_TO_ENV_FILE_

When deploying the functions the secrets are not deployed at the same time, but must be deployed seperately with

> _supabase secrets set --env-file PATH_TO_ENV_FILE_

The included functions require a few secrets in order for them to work. Check the code to see which.


Example .env

```
SUPABASE_PROJECT_ID=

STRIPE_API_SECRET=
STRIPE_API_VERSION=
STRIPE_WEBHOOK_SECRET=
STRIPE_RETURN_SESSION=true 
STRIPE_SKIP_CUSTOMER=false

APP_STORE_CONNECT_SECRET=
IOS_VERIFY_RECEIPT_URL=
```

STRIPE_RETURN_SESSION: If this is true, stripe will send session_id with the return url, so you can fetch the checkout information.
STRIPE_SKIP_CUSTOMER: If this is true, stripe will not create customer. (Not recommended)


## Shared code

Each function run isolated from each other, but you might still want code to be shared between functions. Code that are used in multiple functions should go in
the _shared folder, which will be accessible for all functions.

## Running

To test the functions locally use

> _supabase start_

to start the containers for supabase and then

> _supabase functions serve NAME_OF_YOUR_FUNCTION_

To serve a function locally. Use the parameter --no-verify-jwt before the name of the function, to make the function available for non authenticated users. This requires that Docker is installed on your machine.

When you want to deploy you function(s) use

> _supabase functions deploy NAME_OF_YOUR_FUNCTION_.

Use the parameter --no-verify-jwt before tha name of the function, to make the function available for non authenticated users. You can only deploy one function
at a time.


## Generate types

this project includes a script that generates types for the supabase client. To run it: >_deno run -A ./supabase/functions/scripts/generate-types.ts_

## Formatting code

To format to code in the edge functions folder run:

>*deno fmt*

command.
