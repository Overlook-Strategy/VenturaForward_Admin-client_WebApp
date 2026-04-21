type ClientPost = {
  commentCount: number;
  engagementCount: number;
  id: string;
  likeCount: number;
  postUrl: string;
  postedAt: Date;
};

const formatDate = (value: Date) => {
  return value.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export const ClientPostTimeline = (props: {
  posts: ClientPost[];
}) => {
  return (
    <section className="vf-glass p-6 text-white">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="vf-kicker text-cyan-200">Campaign delivery</p>
          <h2 className="mt-2 text-xl font-semibold">Ad post timeline</h2>
        </div>
        <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.14em] text-white/70">
          Latest 20 posts
        </span>
      </div>

      {!props.posts.length && (
        <div className="rounded-2xl border border-white/10 bg-black/20 p-5 text-sm text-white/75">
          No ad posts have been synced yet.
        </div>
      )}

      <div className="space-y-3">
        {props.posts.map(post => (
          <article
            key={post.id}
            className="group rounded-2xl border border-white/10 bg-slate-950/55 p-4 transition hover:border-cyan-200/35 hover:bg-slate-950/75"
          >
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs uppercase tracking-[0.14em] text-white/60">
                {formatDate(post.postedAt)}
              </span>
              <a
                className="text-xs font-medium text-cyan-100 underline-offset-4 hover:text-white hover:underline"
                href={post.postUrl}
                rel="noreferrer"
                target="_blank"
              >
                Open post
              </a>
            </div>

            <div className="grid grid-cols-3 gap-3 text-sm text-white">
              <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                <div className="text-xs uppercase tracking-[0.12em] text-white/55">Likes</div>
                <div className="mt-1 text-lg font-semibold">{post.likeCount}</div>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                <div className="text-xs uppercase tracking-[0.12em] text-white/55">Comments</div>
                <div className="mt-1 text-lg font-semibold">{post.commentCount}</div>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                <div className="text-xs uppercase tracking-[0.12em] text-white/55">Engagement</div>
                <div className="mt-1 text-lg font-semibold">{post.engagementCount}</div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};
