"use client";

import clientDB from "@/clientDB";
import useAnonAuth from "@/useAnonAuth";
import { HeartIcon as HeartIconOutline } from "@heroicons/react/24/outline";
import {
  PlusIcon,
  XMarkIcon,
  HeartIcon as HeartIconSolid,
} from "@heroicons/react/24/solid";
import { id } from "@instantdb/react";
import React, { useRef, useState } from "react";

export default function App() {
  const auth = useAnonAuth();
  const query = clientDB.useQuery(
    auth.user
      ? {
          profiles: {
            $: {
              where: { owner: auth.user.id },
            },
            photo: {},
            authoredPosts: {
              photo: {},
              hearters: {
                $: {
                  where: { id: auth.user.id },
                },
              },
            },
          },
        }
      : null
  );
  if (auth.isLoading || query.isLoading) return;
  const error = auth.error || query.error;
  if (error) return <ErrorScreen error={error} />;
  const {
    data: { profiles },
  } = query;
  const profile = profiles[0];
  if (!profile) return <NotFound />;
  return (
    <div className="max-w-prose mx-auto p-4 space-y-4 relative">
      {/* Company Header */}
      <div className="border-b flex justify-between py-2 sticky top-0 bg-white">
        <img src="/img/text-logo.svg" />
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
          upload={async (file: File) => {
            const postId = id();
            const ret = await clientDB.storage.uploadFile(
              `/postPhotos/${auth.user.id}/${postId}`,
              file,
              {
                contentType: file.type,
                contentDisposition: `inline; filename="${file.name}"}`,
              }
            );
            await clientDB.transact(
              clientDB.tx.posts[postId]
                .update({
                  content: "Hey there!",
                })
                .link({
                  photo: ret.data.id,
                  author: profile.id,
                })
            );
          }}
        />
      </div>
      {/* Profile Header */}
      <div className="flex items-center space-x-4">
        <FileButton
          accept="image/*"
          render={(isLoading) => {
            return (
              <div className={isLoading ? "opacity-50" : ""}>
                <div className="max-w-32 min-w-32 h-32">
                  {profile.photo ? (
                    <img
                      src={profile.photo.url}
                      className="object-cover h-full w-full rounded-full"
                    />
                  ) : (
                    <img
                      src={`/img/characters/${profile.archetype}.jpg`}
                      className="object-cover h-full w-full rounded-full"
                    />
                  )}
                </div>
              </div>
            );
          }}
          upload={async (file: File) => {
            const ret = await clientDB.storage.uploadFile(
              `/profilePhotos/${auth.user.id}/${file.name}`,
              file
            );
            await clientDB.transact(
              clientDB.tx.profiles[profile.id].link({
                photo: ret.data.id,
              })
            );
          }}
        />
        <div className="space-y-1 overflow-hidden">
          <h3 className="text-2xl truncate">{profile.fullName}</h3>
          <h2 className="font-bold text-gray-500 text-sm truncate">
            @{profile.handle}
          </h2>
        </div>
      </div>
      {/* Posts Feed */}
      <div className="space-y-4">
        {profile.authoredPosts.length === 0 ? (
          <div className="text-center">
            No posts yets! Click + and upload something
          </div>
        ) : (
          profile.authoredPosts.toReversed().map((post) => {
            const isHearted = post.hearters.length > 0;
            return (
              <div key={post.id} className="space-y-2">
                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      clientDB.transact(clientDB.tx.posts[post.id].delete());
                    }}
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>
                {post.photo ? (
                  <img src={post.photo.url} className="w-full" />
                ) : null}
                <button
                  onClick={() => {
                    const postChunk = clientDB.tx.posts[post.id];
                    clientDB.transact(
                      isHearted
                        ? postChunk.unlink({ hearters: auth.user.id })
                        : postChunk.link({ hearters: auth.user.id })
                    );
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
          })
        )}
      </div>
      <div className="text-gray-400 text-center text-sm">
        <p>Open another tab, it's all reactive!</p>
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

function NotFound() {
  return <div>Not found!</div>;
}

function ErrorScreen({ error }: { error: { message: string } }) {
  return <div>{error.message}</div>;
}
