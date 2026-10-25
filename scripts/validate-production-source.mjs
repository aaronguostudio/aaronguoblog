// A local build is unrestricted; production requires a committed main Git revision.
if (process.env.VERCEL_ENV === 'production' && (
  process.env.VERCEL_GIT_COMMIT_REF !== 'main'
  || !/^[a-f0-9]{40}$/i.test(process.env.VERCEL_GIT_COMMIT_SHA || '')
)) {
  throw new Error('Production requires a committed main Git revision')
}
