"use client";

import clientDB from "@/clientDB";
import { InstantFile, Post, ProfileArchetype } from "@/instant.schema";
import useAnonAuth from "@/useAnonAuth";
import { HeartIcon as HeartIconOutline } from "@heroicons/react/24/outline";
import {
  PlusIcon,
  XMarkIcon,
  HeartIcon as HeartIconSolid,
} from "@heroicons/react/24/solid";
import { id, User } from "@instantdb/react";
import React, { useRef, useState } from "react";

function ProfilePage({ user }: { user: User }) {
  // --------
  // Queries

  const { isLoading, error, data } = clientDB.useQuery({
    profiles: {
      $: {
        // My profile
        where: { owner: user.id },
      },
      // with it's profile photo.
      photo: {},
      // and all my authored posts
      authoredPosts: {
        // alongside the post's photo
        photo: {},
        // and profiles whoves hearted my posts!
        hearters: {},
      },
    },
  });

  if (isLoading) return;
  if (error) return <ErrorScreen message={error.message} />;

  const profile = data.profiles[0];

  if (!profile) return <DeletedUserScreen />;

  // --------
  // Transactions

  async function changeProfilePhoto(file: File) {
    // 1. Upload the file!
    const uploaded = await clientDB.storage.uploadFile(
      `/${user.id}/profilePhotos/${file.name}`,
      file
    );
    // 2. Link it to our profile!
    await clientDB.transact(
      clientDB.tx.profiles[profile.id].link({
        photo: uploaded.data.id,
      })
    );
  }

  async function createNewPost(file: File) {
    const postId = id();
    // 1. Upload the file!
    const uploaded = await clientDB.storage.uploadFile(
      `/${user.id}/postPhotos/${postId}`,
      file,
      {
        contentType: file.type,
        contentDisposition: `inline; filename="${file.name}"}`,
      }
    );
    // 2. Create a post, and _link_ our file!
    await clientDB.transact(
      clientDB.tx.posts[postId]
        .update({
          content: "Hey there!",
        })
        .link({
          photo: uploaded.data.id,
          author: profile.id,
        })
    );
  }

  async function deletePost(post: Post) {
    await clientDB.transact(clientDB.tx.posts[post.id].delete());
  }

  async function addHeart(post: Post) {
    await clientDB.transact(
      clientDB.tx.posts[post.id].link({ hearters: profile.id })
    );
  }

  async function removeHeart(post: Post) {
    await clientDB.transact(
      clientDB.tx.posts[post.id].unlink({ hearters: profile.id })
    );
  }

  // --------------
  // Time to render!

  return (
    <div className="max-w-prose mx-auto p-4 space-y-4 relative">
      {/* Instantgram Header */}
      <div className="border-b flex justify-between py-2 sticky top-0 bg-white">
        <Logo />
        <AddPostButton upload={createNewPost} />
      </div>
      {/* Profile Info */}
      <div className="flex items-center space-x-4 pb-4 border-b">
        <AddProfilePhotoButton
          upload={changeProfilePhoto}
          archetype={profile.archetype}
          photo={profile.photo}
        />
        <div className="space-y-1 overflow-hidden">
          <h3 className="text-2xl truncate">{profile.fullName}</h3>
          <h2 className="font-bold text-gray-500 text-sm truncate">
            @{profile.handle}
          </h2>
        </div>
      </div>
      {/* Posts Feed */}
      <div className="divide-y">
        {profile.authoredPosts.length === 0 ? (
          <NoPostsCard upload={createNewPost} />
        ) : (
          profile.authoredPosts.toReversed().map((post) => {
            const isHearted = !!post.hearters.find(
              (hearter) => hearter.id === profile.id
            );
            return (
              <PostCard
                key={post.id}
                isHearted={isHearted}
                post={post}
                photo={post.photo}
                deletePost={deletePost}
                addHeart={addHeart}
                removeHeart={removeHeart}
              />
            );
          })
        )}
      </div>
      {/* Footer */}
      <Footer />
    </div>
  );
}

// -----------
// Auth

export default function App() {
  // This is an example of how you can use
  const auth = useAnonAuth();
  if (auth.isLoading) return;
  if (auth.error) return <ErrorScreen message={auth.error.message} />;

  if (!auth.user) return <DeletedUserScreen />;

  return <ProfilePage user={auth.user} />;
}

// -----------
// Components

function Logo() {
  return <img src="/img/text-logo.svg" />;
}

function AddPostButton({ upload }: { upload: (file: File) => Promise<void> }) {
  return (
    <FileButton
      accept="image/*"
      render={(isLoading) => {
        return (
          <div className={isLoading ? "opacity-50" : ""}>
            <div className="bg-black rounded-xl w-10 h-10 flex items-center justify-center">
              <PlusIcon className="w-8 h-8 text-white" />
            </div>
          </div>
        );
      }}
      upload={upload}
    />
  );
}

function AddProfilePhotoButton(props: {
  upload: (file: File) => Promise<void>;
  archetype: ProfileArchetype;
  photo?: InstantFile;
}) {
  return (
    <FileButton
      accept="image/*"
      render={(isLoading) => {
        return (
          <div className={isLoading ? "opacity-50" : ""}>
            <div className="max-w-32 min-w-32 h-32">
              {props.photo ? (
                <img
                  src={props.photo.url}
                  className="object-cover h-full w-full rounded-full"
                />
              ) : (
                <img
                  src={`/img/characters/${props.archetype}.jpg`}
                  className="object-cover h-full w-full rounded-full"
                />
              )}
            </div>
          </div>
        );
      }}
      upload={props.upload}
    />
  );
}

function NoPostsCard({ upload }: { upload: (file: File) => Promise<void> }) {
  return (
    <FileButton
      accept="image/*"
      render={(isLoading) => {
        return (
          <div className={isLoading ? "opacity-50" : ""}>
            <div className="text-center relative">
              <img src="/img/no_posts.jpg" className="blur" />
              <div className="absolute inset-0 flex items-center justify-center flex-col text-white">
                <h2 className="text-2xl font-bold">No posts yets!</h2>
                <h2>Click here and upload something!</h2>
              </div>
            </div>
          </div>
        );
      }}
      upload={upload}
    />
  );
}

function PostCard({
  post,
  photo,
  deletePost,
  addHeart,
  removeHeart,
  isHearted,
}: {
  addHeart: (post: Post) => Promise<void>;
  deletePost: (post: Post) => Promise<void>;
  removeHeart: (post: Post) => Promise<void>;
  isHearted: boolean;
  post: Post;
  photo?: InstantFile;
}) {
  return (
    <div key={post.id} className="space-y-2 p-4">
      <div className="flex justify-end">
        <button onClick={() => deletePost(post)}>
          <XMarkIcon className="h-6 w-6" />
        </button>
      </div>
      {photo ? <img src={photo.url} className="w-full" /> : null}
      <button
        onClick={() => {
          if (isHearted) {
            removeHeart(post);
          } else {
            addHeart(post);
          }
        }}
      >
        {isHearted ? (
          <HeartIconSolid className="h-6 w-6 text-red-500" />
        ) : (
          <HeartIconOutline className="h-6 w-6" />
        )}
      </button>
    </div>
  );
}

function Footer() {
  return (
    <div className="text-gray-400 text-center text-sm space-y-2">
      <p>Open this page in another tab, it's all reactive!</p>
      <p>
        Curious about the code? Check it out{" "}
        <a
          className="underline text-blue-700"
          target="_blank"
          href="https://github.com/stopachka/instantgram"
        >
          here
        </a>
      </p>
    </div>
  );
}

function FileButton({
  accept,
  render,
  upload,
}: {
  render: (isLoading: boolean) => React.ReactNode;
  upload: (file: File) => Promise<void>;
  accept?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  return (
    <div>
      <button
        onClick={() => {
          inputRef.current!.click();
        }}
      >
        {render(isLoading)}
      </button>
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept={accept}
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          setIsLoading(true);
          try {
            await upload(file);
          } finally {
            setIsLoading(false);
          }
        }}
      />
    </div>
  );
}

function DeletedUserScreen() {
  return (
    <div className="flex items-center justify-center min-h-dvh flex-col space-y-4 p-4">
      <h2 className="text-2xl font-bold">⏰ We deleted your guest account.</h2>
      <p>
        Looks like we deleted your guest aaccount.{" "}
        <button
          onClick={async () => {
            await clientDB.auth.signOut();
            window.location.reload();
          }}
          className="text-blue-500"
        >
          Click here
        </button>{" "}
        and we'll create another account for you :)
      </p>
    </div>
  );
}

function ErrorScreen({ message }: { message?: string }) {
  return (
    <div className="flex items-center justify-center min-h-dvh flex-col space-y-4 p-4">
      <h2 className="text-2xl font-bold">🤕 Ohp.</h2>
      <p>We got an error.</p>
      {message ? <pre>{message}</pre> : null}
    </div>
  );
}
