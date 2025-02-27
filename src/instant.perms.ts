const rules = {
  $users: {
    allow: {
      $default: "false",
      // Users can see their own data
      view: "auth.id == data.id",
    },
  },
  profiles: {
    allow: {
      // You can't delete profiles
      delete: "false",
      // You don't need to create profiles (we make them through the admin SDK)
      create: "false",
      // You can view or change your own profile
      $default: "auth.id in data.ref('owner.id')",
    },
  },
  posts: {
    allow: {
      // You can do anything to your own posts
      $default: "auth.id in data.ref('author.owner.id')",
    },
  },
  $files: {
    allow: {
      // You can do anything to your own files
      $default: "data.path.startsWith('/' + auth.id + '/')",
    },
  },
};

export default rules;
