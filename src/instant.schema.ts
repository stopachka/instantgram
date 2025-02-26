import { i } from "@instantdb/react";

const _schema = i.schema({
  entities: {
    $files: i.entity({
      path: i.string().unique().indexed(),
      url: i.string(),
    }),
    $users: i.entity({
      email: i.string().unique().indexed(),
    }),
    profiles: i.entity({
      fullName: i.string(),
      handle: i.string().unique(),
    }),
    posts: i.entity({
      content: i.string().optional(),
    }),
  },
  links: {
    profilesOwner: {
      forward: {
        on: "profiles",
        has: "one",
        label: "owner",
        onDelete: "cascade",
      },
      reverse: {
        on: "$users",
        has: "one",
        label: "profile",
      },
    },
    profilePhoto: {
      forward: {
        on: "profiles",
        has: "one",
        label: "photo",
      },
      reverse: {
        on: "$files",
        has: "one",
        label: "profile",
        onDelete: "cascade",
      },
    },
    postAuthor: {
      forward: {
        on: "posts",
        has: "one",
        label: "author",
        onDelete: "cascade",
      },
      reverse: {
        on: "profiles",
        has: "many",
        label: "authoredPosts",
      },
    },
    postPhoto: {
      forward: { on: "posts", has: "one", label: "photo" },
      reverse: { on: "$files", has: "one", label: "post", onDelete: "cascade" },
    },
  },
});

// This helps Typescript display nicer intellisense
type _AppSchema = typeof _schema;
interface AppSchema extends _AppSchema {}
const schema: AppSchema = _schema;

export type { AppSchema };
export default schema;
