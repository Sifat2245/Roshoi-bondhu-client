import { useEffect, useState } from "react";
import { Link } from "react-router";
import {
  Trophy,
  Plus,
  Check,
  MoreHorizontal,
  BarChart3,
  Settings,
  Pencil,
  Lock,
  Trash2,
  Users,
} from "lucide-react";
import { useSocial } from "../../community/model/useSocial";
import { socialId } from "../../community/model/social-store";
import {
  canCreateChallenge,
  challengeEnded,
  validateChallenge,
  validatePoll,
  emptyPoll,
  type Challenge,
} from "../../community/model/community-domain";
import PollEditor from "../../community/components/PollEditor";
import PostPoll from "../../community/components/PostPoll";
import { isDemoMode } from "../../../lib/demo/demo-store";
import { useKitchen, rememberRecipe } from "../../kitchen/model/kitchen-store";
import Button from "../../../components/ui/Button";
import Modal from "../../../components/ui/Modal";
import Avatar from "../../../components/ui/Avatar";
import { useToast } from "../../../context/ToastContext";

const freshChallenge = () => ({
  title: "",
  description: "",
  rules: "",
  endsAt: "",
});
export default function GroupCommunityTab({
  group,
  posts,
  isMember,
  onCreatePost,
}) {
  const { state, update, user } = useSocial();
  const { state: kitchen, update: updateKitchen } = useKitchen();
  const { notify } = useToast();
  const [filter, setFilter] = useState("ALL");
  const [editing, setEditing] = useState<{
    id?: string;
    title: string;
    description: string;
    rules: string;
    endsAt: string;
  } | null>(null);
  const [selected, setSelected] = useState<Challenge | null>(null);
  const [operation, setOperation] = useState("");
  const [entryChallenge, setEntryChallenge] = useState<Challenge | null>(null);
  const [participants, setParticipants] = useState<Challenge | null>(null);
  const [pollOpen, setPollOpen] = useState(false);
  const [poll, setPoll] = useState(emptyPoll);
  const [policyOpen, setPolicyOpen] = useState(false);
  const [, tick] = useState(0);
  const role =
    user?.id === group.creatorId
      ? "ADMIN"
      : group.members?.find((m) => m.userId === user?.id)?.role;
  const staff = isMember && ["ADMIN", "MODERATOR"].includes(role);
  const policy = state.challengeCreators[group.id] || "STAFF";
  const canCreate = isMember && canCreateChallenge(group, user?.id, policy);
  const challenges = state.challenges[group.id] || [];
  const visible = challenges.filter(
    (challenge) =>
      filter === "ALL" || (filter === "CLOSED") === challengeEnded(challenge),
  );
  const mine = posts.filter(
    (post) =>
      post.postType === "RECIPE" &&
      (post.authorId === user?.id || post.author?.id === user?.id),
  );
  useEffect(() => {
    const timer = window.setInterval(() => tick((n) => n + 1), 60000);
    return () => window.clearInterval(timer);
  }, []);
  useEffect(() => {
    if (state.challenges[group.id] && state.groupPolls[group.id]) return;
    update((s) => {
      if (!s.challenges[group.id]) {
        const sampleMembers = isDemoMode()
          ? (group.members || [])
              .filter((m) => m.userId !== user?.id)
              .slice(0, 3)
              .map((m) => m.userId)
          : [];
        s.challenges[group.id] = isDemoMode()
          ? [
              {
                id: `seasonal-${group.id}`,
                title: "One ingredient. A table full of ideas.",
                description:
                  "Choose a seasonal vegetable and give it your own family twist. A humble potato, a handful of greens — good food starts small.",
                rules:
                  "Use one seasonal vegetable. Share your own recipe in this group and credit anyone who inspired it.",
                authorId: group.creatorId,
                createdAt: new Date().toISOString(),
                closed: false,
                participants: sampleMembers,
                entries: [],
              },
            ]
          : [];
      }
      if (!s.groupPolls[group.id]) {
        s.groupPolls[group.id] = [];
        if (isDemoMode()) {
          const id = `group-poll-${group.id}`;
          const voters = (group.members || [])
            .filter((m) => m.userId !== user?.id)
            .slice(0, 4);
          s.polls[id] = {
            id,
            question: "What should we cook together next?",
            authorId: group.creatorId,
            multiple: false,
            closed: false,
            options: [
              "A comforting one-pot dinner",
              "A family recipe with a story",
              "Something sweet for tea",
            ].map((text, i) => ({
              id: `${id}-${i}`,
              text,
              voterIds: voters.slice(i * 2, i * 2 + 2).map((m) => m.userId),
            })),
          };
          s.groupPolls[group.id].push(id);
        }
      }
    });
  }, [state.challenges, state.groupPolls, group, user?.id, update]);
  const canManage = (challenge: Challenge) =>
    isMember && (staff || challenge.authorId === user?.id);
  function edit(challenge: Challenge) {
    setSelected(null);
    setOperation("");
    setEditing({
      ...challenge,
      endsAt: challenge.endsAt
        ? new Date(
            +new Date(challenge.endsAt) -
              new Date(challenge.endsAt).getTimezoneOffset() * 60000,
          )
            .toISOString()
            .slice(0, 16)
        : "",
    });
  }
  function saveChallenge(event) {
    event.preventDefault();
    const endsAt = editing.endsAt
      ? new Date(editing.endsAt).toISOString()
      : undefined;
    const error = validateChallenge(editing.title, editing.description, endsAt);
    if (error) return notify.error(error);
    try {
      update((s) => {
        const existing = s.challenges[group.id].find(
          (c) => c.id === editing.id,
        );
        if (
          existing
            ? !canManage(existing)
            : !canCreateChallenge(
                group,
                user?.id,
                s.challengeCreators[group.id] || "STAFF",
              )
        )
          throw new Error("Your group role does not allow this action.");
        const fields = {
          title: editing.title.trim(),
          description: editing.description.trim(),
          rules: editing.rules.trim(),
          endsAt,
        };
        if (existing) Object.assign(existing, fields);
        else
          s.challenges[group.id].unshift({
            ...fields,
            id: socialId(),
            authorId: user.id,
            createdAt: new Date().toISOString(),
            closed: false,
            participants: [],
            entries: [],
          });
      });
      setEditing(null);
      setFilter("ALL");
      notify.success(
        editing.id ? "Challenge updated" : "Your challenge is ready",
      );
    } catch (e: any) {
      notify.error(e.message);
    }
  }
  function toggleJoin(challenge: Challenge) {
    try {
      update((s) => {
        const current = s.challenges[group.id].find(
          (c) => c.id === challenge.id,
        );
        if (!current || !isMember || challengeEnded(current))
          throw new Error(
            "This challenge is no longer accepting participants.",
          );
        const joined = current.participants.includes(user.id);
        current.participants = joined
          ? current.participants.filter((id) => id !== user.id)
          : [...current.participants, user.id];
        if (joined)
          current.entries = current.entries.filter(
            (entry) => entry.userId !== user.id,
          );
      });
    } catch (e: any) {
      notify.error(e.message);
    }
  }
  function manageChallenge() {
    try {
      update((s) => {
        const current = s.challenges[group.id].find(
          (c) => c.id === selected.id,
        );
        if (!current || !canManage(current))
          throw new Error("Your group role does not allow this action.");
        if (operation === "DELETE")
          s.challenges[group.id] = s.challenges[group.id].filter(
            (c) => c.id !== current.id,
          );
        else {
          current.closed = operation === "CLOSE";
          if (
            operation === "REOPEN" &&
            current.endsAt &&
            +new Date(current.endsAt) <= Date.now()
          )
            current.endsAt = undefined;
        }
      });
      setSelected(null);
      setOperation("");
      notify.success(
        operation === "DELETE"
          ? "Challenge deleted"
          : operation === "CLOSE"
            ? "Challenge closed"
            : "Challenge reopened",
      );
    } catch (e: any) {
      notify.error(e.message);
    }
  }
  function createPoll(event) {
    event.preventDefault();
    const error = validatePoll(poll.question, poll.options);
    if (error) return notify.error(error);
    if (poll.expiresAt && +new Date(poll.expiresAt) <= Date.now())
      return notify.error("Choose a future closing time.");
    if (!isMember) return;
    const id = `group-poll-${socialId()}`;
    update((s) => {
      s.polls[id] = {
        ...poll,
        id,
        question: poll.question.trim(),
        authorId: user.id,
        closed: false,
        options: poll.options.map((text) => ({
          id: socialId(),
          text: text.trim(),
          voterIds: [],
        })),
      };
      s.groupPolls[group.id].unshift(id);
      s.people[user.id] = user;
    });
    setPollOpen(false);
    setPoll(emptyPoll());
    notify.success("Your poll is ready");
  }
  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
      <div className="space-y-5">
        <header className="flex flex-wrap gap-3 justify-between items-center">
          <div>
            <h2 className="font-bold text-xl">Community challenges</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Cook along, share your ideas, and learn from each other.
            </p>
          </div>
          {canCreate && (
            <Button icon={Plus} onClick={() => setEditing(freshChallenge())}>
              Create challenge
            </Button>
          )}
        </header>
        <div className="flex flex-wrap gap-2">
          {["ALL", "OPEN", "CLOSED"].map((value) => (
            <button
              type="button"
              key={value}
              aria-pressed={filter === value}
              onClick={() => setFilter(value)}
              className={`rounded-full px-4 py-2 text-sm font-semibold ${filter === value ? "bg-white dark:bg-[#242526] text-[#e02f21] shadow-xs" : "text-gray-500 dark:text-gray-400"}`}
            >
              {value === "ALL"
                ? "All challenges"
                : value === "OPEN"
                  ? "Open"
                  : "Closed"}
            </button>
          ))}
        </div>
        {visible.map((challenge) => {
          const ended = challengeEnded(challenge);
          const joined = challenge.participants.includes(user?.id);
          const entry = challenge.entries.find((e) => e.userId === user?.id);
          return (
            <section
              key={challenge.id}
              className="kitchen-panel overflow-hidden"
              aria-label={`Challenge: ${challenge.title}`}
            >
              <div className="p-5 sm:p-6 bg-emerald-50/60 dark:bg-emerald-950/20 space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                    <Trophy size={16} />
                    {ended ? "Closed challenge" : "Cooking challenge"}
                  </span>
                  {canManage(challenge) && (
                    <button
                      type="button"
                      aria-label={`Manage challenge ${challenge.title}`}
                      onClick={() => {
                        setSelected(challenge);
                        setOperation("");
                      }}
                      className="rounded-full p-2 hover:bg-emerald-100 dark:hover:bg-emerald-900 text-gray-500 dark:text-gray-400"
                    >
                      <MoreHorizontal size={20} />
                    </button>
                  )}
                </div>
                <h3 className="font-bold text-xl sm:text-2xl break-words">
                  {challenge.title}
                </h3>
                <p className="text-sm sm:text-base leading-relaxed text-gray-600 dark:text-gray-300 whitespace-pre-wrap break-words">
                  {challenge.description}
                </p>
                {challenge.endsAt && (
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                    {ended ? "Closed" : "Closes"}{" "}
                    {new Date(challenge.endsAt).toLocaleString(undefined, {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                )}
                <div className="flex flex-wrap gap-2">
                  <Button
                    icon={joined ? Check : Plus}
                    variant={joined ? "secondary" : "primary"}
                    disabled={!isMember || ended}
                    onClick={() => toggleJoin(challenge)}
                  >
                    {ended
                      ? "Challenge closed"
                      : joined
                        ? "Joined · leave challenge"
                        : "Join the challenge"}
                  </Button>
                  {joined && !ended && (
                    <Button
                      variant="outline"
                      onClick={() => setEntryChallenge(challenge)}
                    >
                      {entry ? "Change your entry" : "Add your recipe"}
                    </Button>
                  )}
                </div>
              </div>
              <div className="p-5 sm:p-6 space-y-4">
                <button
                  type="button"
                  onClick={() => setParticipants(challenge)}
                  className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 hover:underline"
                >
                  <Users size={18} />
                  {challenge.participants.length}{" "}
                  {challenge.participants.length === 1
                    ? "cook is"
                    : "cooks are"}{" "}
                  taking part
                </button>
                {challenge.rules && (
                  <details>
                    <summary className="text-sm font-semibold cursor-pointer">
                      Challenge guidelines
                    </summary>
                    <p className="text-sm text-gray-500 dark:text-gray-400 whitespace-pre-wrap mt-2 leading-relaxed">
                      {challenge.rules}
                    </p>
                  </details>
                )}
                {challenge.entries.length > 0 && (
                  <div className="grid sm:grid-cols-2 gap-3">
                    {challenge.entries.map((item) => {
                      const recipe =
                        posts.find((p) => p.id === item.recipeId) ||
                        kitchen.recipes.find((p) => p.id === item.recipeId);
                      return (
                        recipe && (
                          <Link
                            key={item.userId}
                            to={`/post/${recipe.id}`}
                            className="flex items-center gap-3 rounded-xl border border-gray-200 dark:border-gray-700 p-3 hover:bg-gray-50 dark:hover:bg-gray-800"
                          >
                            {recipe.image && (
                              <img
                                src={recipe.image}
                                alt=""
                                className="w-14 h-14 rounded-lg object-cover shrink-0"
                              />
                            )}
                            <span className="min-w-0">
                              <span className="block font-semibold text-sm">
                                {recipe.title}
                              </span>
                              <span className="block text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {recipe.author?.name}
                              </span>
                            </span>
                          </Link>
                        )
                      );
                    })}
                  </div>
                )}
                {!isMember && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Join this group to take part.
                  </p>
                )}
              </div>
            </section>
          );
        })}
        {!visible.length && (
          <div className="kitchen-panel p-8 text-center">
            <Trophy size={32} className="mx-auto text-gray-400 mb-3" />
            <h3 className="font-bold">
              No {filter === "ALL" ? "" : filter.toLowerCase() + " "}challenges
              yet
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              {canCreate
                ? "Create a prompt and bring your community together."
                : "Your group’s next cooking challenge will appear here."}
            </p>
          </div>
        )}
        <section className="space-y-4">
          <div className="flex flex-wrap gap-3 items-center justify-between">
            <h2 className="font-bold text-lg flex items-center gap-2">
              <BarChart3 size={20} />
              Community polls
            </h2>
            {isMember && (
              <Button
                variant="secondary"
                size="sm"
                icon={Plus}
                onClick={() => {
                  setPoll(emptyPoll());
                  setPollOpen(true);
                }}
              >
                Create a poll
              </Button>
            )}
          </div>
          {(state.groupPolls[group.id] || []).map((id) => (
            <div className="kitchen-panel p-4" key={id}>
              <PostPoll post={{ id, poll: state.polls[id], group }} />
            </div>
          ))}
          {!state.groupPolls[group.id]?.length && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No polls yet. Start with a question for your group.
            </p>
          )}
        </section>
      </div>
      <aside className="kitchen-panel p-5 self-start space-y-4">
        <h2 className="font-bold text-lg">How challenges work</h2>
        <ol className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed space-y-3 list-decimal pl-4">
          <li>Join a challenge that inspires you.</li>
          <li>Share your own recipe in the group.</li>
          <li>Add it as your entry and explore everyone’s ideas.</li>
        </ol>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {policy === "MEMBERS"
            ? "Any group member can create a challenge. Admins and moderators can manage every challenge."
            : "Admins and moderators can create and manage challenges."}
        </p>
        {role === "ADMIN" && (
          <Button
            variant="secondary"
            icon={Settings}
            onClick={() => setPolicyOpen(true)}
          >
            Challenge permissions
          </Button>
        )}
        <p className="text-xs text-gray-400 border-t border-gray-100 dark:border-gray-700 pt-4">
          Activities and moderation previews are saved on this device.
        </p>
      </aside>
      {editing && (
        <Modal
          isOpen
          onClose={() => setEditing(null)}
          title={
            editing.id ? "Edit challenge" : "Bring your community together"
          }
          maxWidth="max-w-lg"
        >
          <form onSubmit={saveChallenge} className="p-5 sm:p-6 space-y-4">
            <label className="block text-sm font-semibold">
              Challenge title
              <input
                autoFocus
                aria-label="Challenge title"
                required
                minLength={5}
                maxLength={100}
                value={editing.title}
                onChange={(e) =>
                  setEditing({ ...editing, title: e.target.value })
                }
                className="kitchen-input w-full mt-2"
                placeholder="e.g. A family favourite with a seasonal twist"
              />
            </label>
            <label className="block text-sm font-semibold">
              What are we cooking?
              <textarea
                aria-label="Challenge description"
                required
                minLength={20}
                maxLength={1500}
                rows={4}
                value={editing.description}
                onChange={(e) =>
                  setEditing({ ...editing, description: e.target.value })
                }
                className="kitchen-input w-full mt-2"
              />
            </label>
            <label className="block text-sm font-semibold">
              Guidelines{" "}
              <span className="text-gray-400 font-normal">(optional)</span>
              <textarea
                aria-label="Challenge guidelines"
                maxLength={1000}
                rows={2}
                value={editing.rules}
                onChange={(e) =>
                  setEditing({ ...editing, rules: e.target.value })
                }
                className="kitchen-input w-full mt-2"
                placeholder="Ingredients, entry requirements, or a little inspiration…"
              />
            </label>
            <label className="block text-sm font-semibold">
              Closing time{" "}
              <span className="text-gray-400 font-normal">(optional)</span>
              <input
                aria-label="Challenge closing time"
                type="datetime-local"
                value={editing.endsAt}
                onChange={(e) =>
                  setEditing({ ...editing, endsAt: e.target.value })
                }
                className="kitchen-input w-full mt-2"
              />
            </label>
            <div className="flex flex-wrap justify-end gap-2 pt-4 border-t border-gray-100 dark:border-gray-700">
              <Button variant="secondary" onClick={() => setEditing(null)}>
                Cancel
              </Button>
              <Button type="submit">
                {editing.id ? "Save challenge" : "Create challenge"}
              </Button>
            </div>
          </form>
        </Modal>
      )}
      {selected && (
        <Modal
          isOpen
          onClose={() => {
            setSelected(null);
            setOperation("");
          }}
          title={
            operation
              ? operation === "DELETE"
                ? "Delete this challenge?"
                : operation === "CLOSE"
                  ? "Close this challenge?"
                  : "Reopen this challenge?"
              : "Challenge options"
          }
          maxWidth="max-w-sm"
        >
          <div className="p-5 space-y-3">
            {!operation ? (
              <>
                <p className="font-semibold text-sm break-words mb-4">
                  {selected.title}
                </p>
                <button
                  type="button"
                  onClick={() => edit(selected)}
                  className="flex items-center gap-3 w-full p-3 rounded-xl text-left hover:bg-gray-100 dark:hover:bg-gray-800 text-sm font-semibold"
                >
                  <Pencil size={17} />
                  Edit details
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setOperation(challengeEnded(selected) ? "REOPEN" : "CLOSE")
                  }
                  className="flex items-center gap-3 w-full p-3 rounded-xl text-left hover:bg-gray-100 dark:hover:bg-gray-800 text-sm font-semibold"
                >
                  <Lock size={17} />
                  {challengeEnded(selected)
                    ? "Reopen challenge"
                    : "Close challenge"}
                </button>
                <button
                  type="button"
                  onClick={() => setOperation("DELETE")}
                  className="flex items-center gap-3 w-full p-3 rounded-xl text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 text-sm font-semibold"
                >
                  <Trash2 size={17} />
                  Delete challenge
                </button>
              </>
            ) : (
              <>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                  {operation === "DELETE"
                    ? "The challenge and its entries will be removed from this preview. This cannot be undone."
                    : operation === "CLOSE"
                      ? "Existing entries stay visible. New participants and entries will be stopped until you reopen it."
                      : "The community can join and submit recipes again. An expired closing time will be cleared."}
                </p>
                <div className="flex justify-end gap-2 pt-3">
                  <Button variant="secondary" onClick={() => setOperation("")}>
                    Back
                  </Button>
                  <Button
                    variant={operation === "DELETE" ? "danger" : "primary"}
                    onClick={manageChallenge}
                  >
                    Confirm
                  </Button>
                </div>
              </>
            )}
          </div>
        </Modal>
      )}
      {entryChallenge && (
        <Modal
          isOpen
          onClose={() => setEntryChallenge(null)}
          title="Bring your recipe to the table"
          subtitle="Choose a recipe you’ve shared in this group."
          maxWidth="max-w-lg"
        >
          <div className="p-5 space-y-3">
            {mine.map((recipe) => (
              <button
                type="button"
                key={recipe.id}
                onClick={() => {
                  try {
                    update((s) => {
                      const challenge = s.challenges[group.id].find(
                        (c) => c.id === entryChallenge.id,
                      );
                      if (
                        !isMember ||
                        !challenge ||
                        challengeEnded(challenge) ||
                        !challenge.participants.includes(user.id)
                      )
                        throw new Error(
                          "Join an open challenge before adding an entry.",
                        );
                      challenge.entries = [
                        ...challenge.entries.filter(
                          (e) => e.userId !== user.id,
                        ),
                        { userId: user.id, recipeId: recipe.id },
                      ];
                    });
                    updateKitchen((s) => rememberRecipe(s, recipe));
                    setEntryChallenge(null);
                    notify.success("Your recipe is part of the challenge");
                  } catch (e: any) {
                    notify.error(e.message);
                  }
                }}
                className="flex items-center gap-3 w-full rounded-xl border border-gray-200 dark:border-gray-700 p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                {recipe.image && (
                  <img
                    src={recipe.image}
                    alt=""
                    className="h-16 w-16 shrink-0 object-cover rounded-lg"
                  />
                )}
                <span className="font-semibold text-sm">{recipe.title}</span>
              </button>
            ))}
            {!mine.length && (
              <p className="text-sm text-gray-500 dark:text-gray-400 py-5 text-center">
                Share a recipe in this group first, then add it to the
                challenge.
              </p>
            )}
            <Button
              variant="secondary"
              className="w-full"
              icon={Plus}
              onClick={() => {
                setEntryChallenge(null);
                onCreatePost();
              }}
            >
              Write a recipe for the group
            </Button>
          </div>
        </Modal>
      )}
      {participants && (
        <Modal
          isOpen
          onClose={() => setParticipants(null)}
          title="Cooking along"
          subtitle={participants.title}
          maxWidth="max-w-sm"
        >
          <div className="p-5 space-y-3">
            {participants.participants.map((id) => {
              const person =
                state.people[id] ||
                group.members?.find((m) => m.userId === id)?.user;
              return (
                <Link
                  key={id}
                  to={`/profile/${id}`}
                  className="flex items-center gap-3 text-sm font-semibold hover:underline"
                >
                  <Avatar src={person?.image} alt={person?.name} />
                  {person?.name || "Home cook"}
                </Link>
              );
            })}
            {!participants.participants.length && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Be the first to cook along.
              </p>
            )}
          </div>
        </Modal>
      )}
      {pollOpen && (
        <Modal
          isOpen
          onClose={() => setPollOpen(false)}
          title="Ask your food people"
          maxWidth="max-w-lg"
        >
          <form onSubmit={createPoll} className="p-5 space-y-5">
            <PollEditor value={poll} onChange={setPoll} />
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setPollOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Create poll</Button>
            </div>
          </form>
        </Modal>
      )}
      {policyOpen && role === "ADMIN" && (
        <Modal
          isOpen
          onClose={() => setPolicyOpen(false)}
          title="Who can create challenges?"
          maxWidth="max-w-md"
        >
          <div className="p-5 space-y-3">
            {[
              {
                id: "STAFF",
                title: "Admins and moderators",
                detail:
                  "Staff create the prompts. Members join and share entries.",
              },
              {
                id: "MEMBERS",
                title: "All group members",
                detail:
                  "Members can create and manage their own challenges. Staff can manage all challenges.",
              },
            ].map((item) => (
              <label
                key={item.id}
                className="flex gap-3 rounded-xl border border-gray-200 dark:border-gray-700 p-4 cursor-pointer"
              >
                <input
                  type="radio"
                  name="challenge-creators"
                  checked={policy === item.id}
                  onChange={() => {
                    if (role === "ADMIN")
                      update((s) => {
                        s.challengeCreators[group.id] = item.id as
                          | "STAFF"
                          | "MEMBERS";
                      });
                  }}
                  className="h-4 w-4 shrink-0 mt-1 accent-[#e02f21]"
                />
                <span>
                  <span className="font-semibold text-sm block">
                    {item.title}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400 block mt-1">
                    {item.detail}
                  </span>
                </span>
              </label>
            ))}
            <div className="flex justify-end pt-3">
              <Button onClick={() => setPolicyOpen(false)}>Done</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
