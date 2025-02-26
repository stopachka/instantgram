const rules = {
  $users: {
    allow: {
      // Users can see their own data
      view: "auth.id == data.id",
      "*": "false",
    },
  },
  profiles: {
    allow: {
      // You can only see and change your profile
      "*": "auth.id == data.ref('owner.$user.id')",
      // But you can't delete it
      delete: "false",
    },
  },
  posts: {
    allow: {
      // You can see and change your own posts
      "*": "auth.id in data.ref('author.$user.id')",
    },
  },
  $files: {
    allow: {
      // You can do anything to your own files
      create: "data.path.startsWith('/')",
    },
  },
};

export default rules;
