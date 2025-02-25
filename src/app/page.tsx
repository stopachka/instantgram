"use client";

import clientDB from "@/clientDB";
import useAnonAuth from "@/useAnonAuth";
import { HeartIcon } from "@heroicons/react/24/outline";
import { PlusIcon } from "@heroicons/react/24/solid";
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
        <button className="bg-black rounded-xl w-10 h-10 flex items-center justify-center">
          <PlusIcon className="w-8 h-8 text-white" />
        </button>
      </div>
      {/* Profile Header */}
      <div className="flex items-center space-x-4">
        <FileButton
          render={(isLoading) => {
            return (
              <div className={isLoading ? "opacity-50" : ""}>
                <div className="max-w-32 h-32 min-w-32 rounded-full">
                  {profile.photo ? (
                    <img
                      src={profile.photo.url}
                      className="object-cover h-full w-full rounded-full"
                    />
                  ) : (
                    <div className="bg-gray-200 h-full w-full"></div>
                  )}
                </div>
              </div>
            );
          }}
          upload={async (file: File) => {
            const ret = await clientDB.storage.uploadFile(
              `/photos/${auth.user.id}/${file.name}`,
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
        {[{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }].map((post) => {
          return (
            <div key={post.id} className="space-y-2">
              <div className="h-40 w-full bg-blue-500"></div>
              <button>
                <HeartIcon className="h-6 w-6" />
              </button>
            </div>
          );
        })}
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
  render,
  upload,
}: {
  render: (isLoading: boolean) => React.ReactNode;
  upload: (file: File) => Promise<void>;
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
