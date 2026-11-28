import { useEffect, useState, useRef } from "react";
import { Link } from "react-router";
import { BarChart3, Check, Lock } from "lucide-react";
import {
  castVote,
  pollEnded,
  pollVoters,
  type Poll,
} from "../model/community-domain";
import { useSocial } from "../model/useSocial";
import Modal from "../../../components/ui/Modal";
import Button from "../../../components/ui/Button";
import Avatar from "../../../components/ui/Avatar";
import { useToast } from "../../../context/ToastContext";
import { postsApi } from "../../posts/api/posts.api";

export default function PostPoll({
  post,
  onRequireAuth,
  onUpdatePoll,
}: {
  post: any;
  onRequireAuth?: () => void;
  onUpdatePoll?: (poll: Poll) => void;
}) {
  const { state, update, user } = useSocial();
  const { notify } = useToast();
  const [poll, setPoll] = useState<Poll>(() => {
    return post.poll || state.polls[post.poll?.id || post.id];
  });

  const activePostId = useRef(post.id);
  const activePollId = useRef(post.poll?.id);

  useEffect(() => {
    if (
      post.id !== activePostId.current ||
      post.poll?.id !== activePollId.current
    ) {
      activePostId.current = post.id;
      activePollId.current = post.poll?.id;
      if (post.poll) {
        setPoll(post.poll);
      } else if (state.polls[post.poll?.id || post.id]) {
        setPoll(state.polls[post.poll?.id || post.id]);
      }
    }
  }, [post.id, post.poll, state.polls]);

  const [votersOpen, setVotersOpen] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [, refresh] = useState(0);

  useEffect(() => {
    if (!poll?.expiresAt || pollEnded(poll)) return;
    const timer = window.setTimeout(
      () => refresh((n) => n + 1),
      Math.min(2147483647, Math.max(0, +new Date(poll.expiresAt) - Date.now())),
    );
    return () => window.clearTimeout(timer);
  }, [poll]);

  if (!poll) return null;
  const ended = pollEnded(poll);
  const voters = pollVoters(poll);
  const memberRequired = post.group?.isMember === false;
  const isAuthor = user?.id === (poll.authorId || post.authorId);
  const voted = (poll.options || []).some(
    (o) =>
      (user?.id && (o.voterIds || []).includes(user.id)) || Boolean(o.hasVoted),
  );

  async function vote(optionId: string) {
    if (!user) return onRequireAuth?.();
    if (memberRequired) return;

    const prevPoll = poll;
    try {
      // 1. Optimistic UI update immediately
      const nextPoll = castVote(poll, optionId, user.id);
      setPoll(nextPoll);
      onUpdatePoll?.(nextPoll);
      update((s) => {
        s.polls[poll.id] = nextPoll;
        s.people[user.id] = user;
      });

      // 2. Call GraphQL API in background
      const updated = await postsApi.votePoll(poll.id, optionId);
      if (updated) {
        setPoll(updated);
        onUpdatePoll?.(updated);
        update((s) => {
          s.polls[poll.id] = updated;
        });
      }
    } catch (e: any) {
      // Rollback on error
      setPoll(prevPoll);
      onUpdatePoll?.(prevPoll);
      update((s) => {
        s.polls[poll.id] = prevPoll;
      });
      notify.error(e.message || "Failed to submit vote");
    }
  }

  async function handleToggleStatus() {
    if (!isAuthor) return;
    setConfirm(false);

    const prevPoll = poll;
    const nextEnded = !ended;
    const nextPoll: Poll = {
      ...poll,
      closed: nextEnded,
      expiresAt: nextEnded ? poll.expiresAt : undefined,
    };

    try {
      // 1. Optimistic UI update immediately
      setPoll(nextPoll);
      onUpdatePoll?.(nextPoll);
      update((s) => {
        s.polls[poll.id] = nextPoll;
      });

      // 2. Call GraphQL API in background
      const updated = await postsApi.togglePollStatus(poll.id);
      if (updated) {
        setPoll(updated);
        onUpdatePoll?.(updated);
        update((s) => {
          s.polls[poll.id] = updated;
        });
      }
    } catch (e: any) {
      // Rollback on error
      setPoll(prevPoll);
      onUpdatePoll?.(prevPoll);
      update((s) => {
        s.polls[poll.id] = prevPoll;
      });
      notify.error(e.message || "Failed to update poll status");
    }
  }
  return (
    <section
      aria-label="Post poll"
      className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-5 space-y-4"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400">
          <BarChart3 size={15} />
          {poll.multiple ? "Choose one or more" : "Choose one answer"}
        </span>
        {ended && (
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 flex gap-1 items-center">
            <Lock size={12} />
            Voting closed
          </span>
        )}
      </div>
      <h3 className="font-bold text-base sm:text-lg leading-snug break-words">
        {poll.question}
      </h3>
      <div className="space-y-2" role="group" aria-label={poll.question}>
        {poll.options.map((option) => {
          const selected = Boolean(
            (user?.id && (option.voterIds || []).includes(user.id)) ||
              option.hasVoted,
          );
          const optionVotes =
            (option.voterIds || []).length || option.voteCount || 0;
          const totalVotesCount = voters.length || poll.totalVotes || 0;
          const percentage =
            totalVotesCount > 0
              ? Math.round((optionVotes / totalVotesCount) * 100)
              : 0;
          return (
            <button
              type="button"
              key={option.id}
              aria-pressed={selected}
              disabled={ended || memberRequired}
              onClick={() => vote(option.id)}
              className={`relative w-full overflow-hidden border rounded-xl flex items-center gap-3 px-3.5 py-3 text-left transition-all ${
                selected
                  ? "border-[#e02f21] ring-1 ring-[#e02f21]/20 shadow-xs"
                  : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
              } disabled:cursor-default cursor-pointer`}
            >
              <span
                className={`absolute inset-y-0 left-0 ${
                  selected
                    ? "bg-red-50 dark:bg-red-950/30"
                    : "bg-gray-50 dark:bg-[#18191a]"
                } transition-[width] duration-300 ease-out`}
                style={{ width: `${percentage}%` }}
              />
              <span
                className={`relative shrink-0 h-5 w-5 border flex items-center justify-center transition-colors ${
                  poll.multiple ? "rounded-md" : "rounded-full"
                } ${
                  selected
                    ? "bg-[#e02f21] border-[#e02f21] text-white"
                    : "border-gray-300 dark:border-gray-500 bg-white dark:bg-gray-800"
                }`}
              >
                {selected && <Check size={13} strokeWidth={3} />}
              </span>
              <span className="relative flex-1 min-w-0 text-sm font-semibold break-words text-gray-900 dark:text-gray-100">
                {option.text}
              </span>
              <span className="relative text-xs font-bold text-gray-600 dark:text-gray-400 shrink-0">
                {percentage}%
              </span>
            </button>
          );
        })}
      </div>
      <div className="flex flex-wrap justify-between items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
        <button
          type="button"
          onClick={() => setVotersOpen(true)}
          className="hover:underline"
        >
          {voters.length}{" "}
          {voters.length === 1 ? "person voted" : "people voted"}
        </button>
        {isAuthor && (
          <button
            type="button"
            onClick={() => setConfirm(true)}
            className="font-semibold text-[#e02f21]"
          >
            {ended ? "Reopen voting" : "End poll"}
          </button>
        )}
      </div>
      <p
        role="status"
        className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed"
      >
        {memberRequired ? (
          <Link to={`/group/${post.group.slug}`} className="text-[#e02f21]">
            Join this group to vote.
          </Link>
        ) : ended ? (
          "The results are final unless the author reopens voting."
        ) : voted ? (
          "Your vote is saved. Select it again to remove it."
        ) : (
          "Vote to join the conversation."
        )}
        {poll.expiresAt && !ended
          ? ` Closes ${new Date(poll.expiresAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}.`
          : ""}
      </p>
      {votersOpen && (
        <Modal
          isOpen
          onClose={() => setVotersOpen(false)}
          title="Poll votes"
          subtitle={poll.question}
          maxWidth="max-w-md"
        >
          <div className="p-5 space-y-5">
            {poll.options.map((option) => (
              <section key={option.id}>
                <h3 className="text-sm font-bold mb-2 break-words">
                  {option.text}{" "}
                  <span className="font-normal text-gray-400">
                    ({option.voterIds.length})
                  </span>
                </h3>
                <div className="space-y-2">
                  {option.voterIds.map((id) => {
                    const person =
                      (option as any).voters?.find((v: any) => v.id === id) ||
                      state.people[id] ||
                      (id === user?.id ? user : null);
                    return (
                      <Link
                        key={id}
                        to={`/profile/${id}`}
                        className="flex items-center gap-2 py-1 text-sm hover:underline"
                      >
                        <Avatar
                          size="sm"
                          src={person?.image}
                          alt={person?.name}
                        />
                        {person?.name || "Home cook"}
                      </Link>
                    );
                  })}
                  {!option.voterIds.length && (
                    <p className="text-sm text-gray-400">No votes yet.</p>
                  )}
                </div>
              </section>
            ))}
          </div>
        </Modal>
      )}
      {confirm && (
        <Modal
          isOpen
          onClose={() => setConfirm(false)}
          title={ended ? "Reopen this poll?" : "End this poll?"}
          maxWidth="max-w-sm"
        >
          <div className="p-5 space-y-5">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {ended
                ? "People will be able to vote again. The previous closing time will be removed."
                : "People will still see the results, but cannot change their votes. You can reopen it later."}
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setConfirm(false)}>
                Cancel
              </Button>
              <Button onClick={handleToggleStatus}>
                {ended ? "Reopen voting" : "End poll"}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </section>
  );
}
