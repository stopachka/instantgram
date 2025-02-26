import { i, InstaQLEntity } from "@instantdb/react";

export type ProfileArchetype =
  | "alyssa"
  | "ben"
  | "cy"
  | "eva"
  | "lem"
  | "louis"
  | "ima";

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
      archetype: i.string<ProfileArchetype>(),
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
    postHearters: {
      forward: { on: "posts", has: "many", label: "hearters" },
      reverse: { on: "profiles", has: "many", label: "heartedPosts" },
    },
  },
});

// This helps Typescript display nicer intellisense
type _AppSchema = typeof _schema;
interface AppSchema extends _AppSchema {}
const schema: AppSchema = _schema;

type InstantFile = InstaQLEntity<AppSchema, "$files">;
type Post = InstaQLEntity<AppSchema, "posts">;

export type { AppSchema, InstantFile, Post };
export default schema;
