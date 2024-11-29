export const redisKeys = {
  posts() {
    return `posts`
  },

  publishedPosts() {
    return `publishedPosts`
  },

  space(address: string) {
    return `space:${address}`
  },

  spaceLogo(address: string) {
    return `space:logo:${address}`
  },

  mySpaces(address: string) {
    return `spaces:${address}`
  },
}
