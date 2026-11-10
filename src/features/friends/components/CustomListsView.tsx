import React, { useEffect, useState } from "react";
import { Plus, Users, Trash2 } from "lucide-react";
import Modal from "../../../components/ui/Modal";
import Avatar from "../../../components/ui/Avatar";
import Button from "../../../components/ui/Button";
import { useToast } from "../../../context/ToastContext";

export default function CustomListsView({ friends = [] }: { friends?: any[] }) {
  const { notify } = useToast();
  const [lists, setLists] = useState<
    { id: string; name: string; members: string[] }[]
  >(() => {
    try {
      return (
        JSON.parse(localStorage.getItem("heshel:friend-lists") || "null") || [
          { id: "close-friends", name: "Close foodie friends", members: [] },
        ]
      );
    } catch {
      return [];
    }
  });
  const [editing, setEditing] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [members, setMembers] = useState<string[]>([]);
  useEffect(() => {
    localStorage.setItem("heshel:friend-lists", JSON.stringify(lists));
  }, [lists]);
  const open = (list?: (typeof lists)[number]) => {
    setEditing(list?.id || "new");
    setName(list?.name || "");
    setMembers(list?.members || []);
  };
  const save = (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return;
    const list = {
      id: editing === "new" ? crypto.randomUUID() : editing!,
      name: name.trim(),
      members,
    };
    setLists((previous) =>
      editing === "new"
        ? [...previous, list]
        : previous.map((item) => (item.id === editing ? list : item)),
    );
    setEditing(null);
    notify.success("List saved on this device");
  };
  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">Custom lists</h1>
          <p className="text-xs text-gray-500 mt-1">
            Organise your cooking circle. Lists stay on this device.
          </p>
        </div>
        <Button onClick={() => open()}>
          <Plus size={16} />
          Create list
        </Button>
      </div>
      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {lists.map((list) => (
          <button
            type="button"
            key={list.id}
            onClick={() => open(list)}
            className="bg-white dark:bg-[#242526] rounded-2xl border border-gray-200 dark:border-gray-800 p-5 text-left hover:border-red-300 transition"
          >
            <Users size={22} className="text-[#e02f21] mb-4" />
            <h2 className="font-bold text-sm">{list.name}</h2>
            <p className="text-xs text-gray-500 mt-2">
              {
                list.members.filter((id) =>
                  friends.some((friend) => friend.id === id),
                ).length
              }{" "}
              members
            </p>
          </button>
        ))}
      </div>
      {!lists.length && (
        <p className="py-10 text-center text-sm text-gray-500">
          Create your first list to keep your favourite cooking circles
          together.
        </p>
      )}
      <Modal
        isOpen={editing !== null}
        onClose={() => setEditing(null)}
        title={editing === "new" ? "Create a friend list" : "Edit friend list"}
        maxWidth="max-w-md"
      >
        <form onSubmit={save} className="p-5 space-y-5">
          <label className="block text-sm font-semibold">
            List name
            <input
              autoFocus
              required
              maxLength={60}
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="mt-2 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-3"
            />
          </label>
          <fieldset>
            <legend className="text-sm font-semibold mb-2">
              Choose friends
            </legend>
            {friends.map((friend) => (
              <label
                key={friend.id}
                className="flex items-center gap-3 py-3 cursor-pointer"
              >
                <Avatar src={friend.image} alt={friend.name} size="sm" />
                <span className="flex-1 text-sm">{friend.name}</span>
                <input
                  type="checkbox"
                  checked={members.includes(friend.id)}
                  onChange={() =>
                    setMembers((previous) =>
                      previous.includes(friend.id)
                        ? previous.filter((id) => id !== friend.id)
                        : [...previous, friend.id],
                    )
                  }
                  className="w-4 h-4 accent-[#e02f21]"
                />
              </label>
            ))}
            {!friends.length && (
              <p className="text-sm text-gray-500">
                Add friends to choose members for this list.
              </p>
            )}
          </fieldset>
          <div className="flex flex-wrap justify-between gap-3">
            {editing !== "new" && (
              <button
                type="button"
                onClick={() => {
                  setLists((previous) =>
                    previous.filter((list) => list.id !== editing),
                  );
                  setEditing(null);
                }}
                className="text-sm text-red-600 flex items-center gap-2"
              >
                <Trash2 size={16} />
                Delete list
              </button>
            )}
            <div className="flex gap-2 ml-auto">
              <Button variant="secondary" onClick={() => setEditing(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={!name.trim()}>
                Save list
              </Button>
            </div>
          </div>
        </form>
      </Modal>
    </section>
  );
}
