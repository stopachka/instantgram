import prettyID from "@/prettyId";
import serverDB from "@/serverDB";
import { id } from "@instantdb/admin";

/**
 * This is a handy endpoint to create an anonymous user.
 *
 * We'll also create a profile and an `archetype`.
 *
 * In a real application, you may want to use actual auth methods.
 * Magic codes, Sign with Google, Apple, and other integrations come out of the box.
 *
 * Check out http://instantdb.com/docs/auth to learn more
 */
export async function POST() {
  const randEmail = `anon-${id()}@instantdb.com`;
  const token = await serverDB.auth.createToken(randEmail);
  const user = await serverDB.auth.getUser({ refresh_token: token });
  await serverDB.transact(
    serverDB.tx.profiles[id()]
      .update({
        fullName: "Alyssa P. Hacker",
        handle: `alyssa_${prettyID()}`,
      })
      .link({ owner: user.id })
  );

  return { user };
}
