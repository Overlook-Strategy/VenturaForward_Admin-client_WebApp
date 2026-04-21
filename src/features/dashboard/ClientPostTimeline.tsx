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
    <section className="rounded-3xl border border-white/20 bg-white/10 p-6 backdrop-blur-xl">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Instagram Promos</h2>
        <span className="rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.14em] text-white/70">
          Last 20 posts
        </span>
      </div>

      {!props.posts.length && (
        <div className="rounded-2xl border border-white/10 bg-black/20 p-5 text-sm text-white/75">
          No tagged promo posts have been synced yet.
        </div>
      )}

      <div className="space-y-3">
        {props.posts.map(post => (
          <article
            key={post.id}
            className="group rounded-2xl border border-white/15 bg-black/20 p-4 transition hover:border-white/35 hover:bg-black/30"
          >
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs uppercase tracking-[0.14em] text-white/60">
                {formatDate(post.postedAt)}
              </span>
              <a
                className="text-xs font-medium text-white/80 underline-offset-4 hover:text-white hover:underline"
                href={post.postUrl}
                rel="noreferrer"
                target="_blank"
              >
                View post
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
