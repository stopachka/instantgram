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

import { ProfileArchetype } from "@/instant.schema";
import prettyID from "@/prettyID";
import serverDB from "@/serverDB";
import { id } from "@instantdb/admin";

export async function POST() {
  const pretty = prettyID();
  const character = characters[Math.floor(Math.random() * characters.length)];

  const token = await serverDB.auth.createToken(
    `${character.archetype}-${pretty}@instantdb.com`
  );

  const user = await serverDB.auth.getUser({ refresh_token: token });
  await serverDB.transact(
    serverDB.tx.profiles[id()]
      .update({
        fullName: character.name,
        archetype: character.archetype,
        handle: `${character.archetype}_${prettyID()}`,
      })
      .link({ owner: user.id })
  );

  return Response.json({ user, token });
}

type Character = {
  name: string;
  archetype: ProfileArchetype;
};

const characters: Character[] = [
  { name: "Alyssa P. Hacker", archetype: "alyssa" },
  { name: "Ben Bitdiddle", archetype: "ben" },
  { name: "Cy D. Fect", archetype: "cy" },
  { name: "Eva Lu Ator", archetype: "eva" },
  { name: "Lem E. Tweakit", archetype: "lem" },
  { name: "Louis Reasoner", archetype: "louis" },
  { name: "Ima Qu Ri", archetype: "ima" },
];
