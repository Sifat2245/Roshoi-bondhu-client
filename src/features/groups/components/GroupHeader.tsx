import React, { useState, useRef, useEffect } from "react";
import {
  Users,
  Lock,
  Globe,
  Check,
  UserPlus,
  Share2,
  MoreHorizontal,
  Search,
  Flag,
  Plus,
  ChevronDown,
  Camera,
  Loader2,
} from "lucide-react";
import Button from "../../../components/ui/Button";
import { useToast } from "../../../context/ToastContext";
import { useAuth } from "../../../context/AuthContext";
import { useSession } from "../../../lib/auth-client";
import Modal from "../../../components/ui/Modal";
import ReportModal from "../../reports/components/ReportModal";
import InviteMemberModal from "./InviteMemberModal";
import profileApi from "../../profile/api/profile.api";
import groupsApi from "../api/groups.api";
import { useInvalidateGroupQueries } from "../hooks/useGroupQueries";
import defaultUserAvatar from "../../../assets/user-image.png";
import defaultGroupCover from "../../../assets/group/group-default.png";

const GroupHeader = ({
  group,
  activeTab,
  onSelectTab,
  onJoinToggle,
  isMember,
  isAdmin,
  search = "",
  onSearch = (_value: string) => {},
}) => {
  const [loading, setLoading] = useState(false);
  const { notify } = useToast();
  const [showOptions, setShowOptions] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [showMoreDropdown, setShowMoreDropdown] = useState(false);
  const moreDropdownRef = useRef<HTMLDivElement>(null);

  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1200
  );

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!showMoreDropdown) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        moreDropdownRef.current &&
        !moreDropdownRef.current.contains(e.target as Node)
      ) {
        setShowMoreDropdown(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowMoreDropdown(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [showMoreDropdown]);

  const { user } = useAuth();
  const { data: session } = useSession();
  const token = session?.session?.token || null;
  const { updateGroupCoverInCache, invalidateGroupDetail } = useInvalidateGroupQueries();
  const [uploadingCover, setUploadingCover] = useState(false);
  const [previewCover, setPreviewCover] = useState<string | null>(null);

  const isCreator = Boolean(
    user?.id && (user.id === group.createdById || user.id === group.createdBy?.id)
  );
  const myMemberRecord = (group.members || []).find(
    (m: any) => m.userId === user?.id || m.user?.id === user?.id
  );
  const viewerRole = isCreator
    ? "ADMIN"
    : group.currentUserRole || myMemberRecord?.role || "MEMBER";
  const canEditCover =
    isAdmin || isCreator || group.canModerate || ["ADMIN", "MODERATOR"].includes(viewerRole);

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !group?.id) return;

    if (!file.type.startsWith("image/")) {
      notify.error("Please select an image file.");
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviewCover(objectUrl);
    setUploadingCover(true);

    try {
      const upData = await profileApi.uploadImage(file, token);
      const imageUrl = upData?.data?.url || upData?.url;
      if (!imageUrl) throw new Error(upData?.message || "Failed to upload image.");

      await groupsApi.updateGroupCover(group.id, imageUrl);
      updateGroupCoverInCache(group.id, imageUrl);
      invalidateGroupDetail(group.slug || group.id);
      notify.success("Group cover updated successfully!");
    } catch (err: any) {
      setPreviewCover(null);
      notify.error(err.message || "Failed to update group cover.");
    } finally {
      setUploadingCover(false);
      e.target.value = "";
    }
  };

  const handleAction = async () => {
    setLoading(true);
    try {
      await onJoinToggle();
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = () => {
    setIsInviteModalOpen(true);
  };

  const handleShare = handleInvite;

  const memberList = (group.members || []).map((member: any) => ({
    id: member.user?.id || member.userId,
    name: member.user?.name || "Member",
    image: member.user?.image || defaultUserAvatar,
    role: member.role,
  }));
  const memberCount = group.membersCount ?? group.members?.length ?? memberList.length;

  return (
    <div className="w-full bg-white dark:bg-[#242526] shadow-xs border-b border-gray-200 dark:border-gray-800">
      {/* 1. Contained Cover Image Banner */}
      <div className="w-full bg-gradient-to-b from-gray-200/50 via-gray-100/30 to-transparent dark:from-black/40 dark:via-[#18191a]/40 dark:to-transparent pt-0 sm:pt-4">
        <div className="max-w-[1250px] mx-auto px-0 sm:px-4">
          <div className="relative h-56 sm:h-72 md:h-84 w-full bg-gray-200 dark:bg-gray-800 sm:rounded-2xl overflow-hidden shadow-sm group/cover">
            <img
              src={previewCover || group.coverImage || defaultGroupCover}
              alt={group.name}
              className="w-full h-full object-cover transition duration-300"
            />

            {/* Edit Cover Photo Button for Admins & Moderators */}
            {canEditCover && (
              <label
                htmlFor="group-cover-upload"
                className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 bg-white/95 hover:bg-white dark:bg-[#242526]/90 dark:hover:bg-[#242526] text-gray-800 dark:text-gray-200 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-md cursor-pointer transition flex items-center gap-2 backdrop-blur-xs z-10 hover:shadow-lg"
              >
                {uploadingCover ? (
                  <>
                    <Loader2 size={16} className="animate-spin text-[#e02f21]" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <Camera size={16} />
                    <span>Edit cover photo</span>
                  </>
                )}
                <input
                  id="group-cover-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleCoverUpload}
                  disabled={uploadingCover}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>
      </div>

      {/* 2. Group Info, Member Avatar Cluster, Action Buttons */}
      <div className="max-w-[1250px] mx-auto px-4 sm:px-8 py-6">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="min-w-0 space-y-2.5">
            <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white tracking-tight break-words">
              {group.name}
            </h1>

            {/* Subtitle Line */}
            <div className="flex flex-wrap items-center gap-2.5 text-sm sm:text-base text-gray-500 dark:text-gray-400 font-medium">
              <span className="flex items-center gap-1.5 font-bold">
                {group.privacy === "PRIVATE" ? (
                  <Lock size={15} />
                ) : (
                  <Globe size={15} />
                )}
                {group.privacy === "PRIVATE" ? "Private group" : "Public group"}
              </span>
              <span>•</span>
              <span className="font-bold text-gray-800 dark:text-gray-200">
                {memberCount >= 1000 ? `${(memberCount / 1000).toFixed(1)}k` : memberCount} {memberCount === 1 ? "member" : "members"}
              </span>
            </div>

            {/* Member Avatars Cluster (Matching Facebook reference in media_1795155165011_cd309caa.jpg) */}
            {memberList.length > 0 && (
              <div
                className="flex items-center gap-2 pt-1 cursor-pointer group/members"
                onClick={() => onSelectTab("MEMBERS")}
                title="View all group members"
              >
                <div className="flex -space-x-1.5 sm:-space-x-2 overflow-hidden py-1 items-center">
                  {memberList.slice(0, 18).map((m: any, i: number) => (
                    <img
                      key={m.id || i}
                      src={m.image}
                      alt={m.name}
                      title={`${m.name}${m.role && m.role !== 'MEMBER' ? ` (${m.role})` : ''}`}
                      className="inline-block h-8 w-8 sm:h-9 sm:w-9 rounded-full ring-2 ring-white dark:ring-[#242526] object-cover bg-gray-200 dark:bg-gray-700 shrink-0 hover:z-10 transition-transform hover:scale-105"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {isMember && (
              <Button
                onClick={handleInvite}
                className="bg-[#e02f21] hover:bg-[#c92518] text-white px-4 py-2.5 text-sm font-bold rounded-xl shadow-xs flex items-center gap-2 cursor-pointer"
              >
                <Plus size={16} />
                <span>Invite</span>
              </Button>
            )}

            <Button
              onClick={handleShare}
              variant="secondary"
              className="px-4 py-2.5 text-sm font-bold rounded-xl flex items-center gap-2 cursor-pointer"
            >
              <Share2 size={16} />
              <span>Share</span>
            </Button>

            <Button
              onClick={() =>
                isMember ? setConfirmLeave(true) : handleAction()
              }
              loading={loading}
              variant={isMember ? "secondary" : "primary"}
              className="px-4 py-2.5 text-sm font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
            >
              {isMember ? (
                <>
                  <Check size={16} className="text-emerald-500" />
                  <span>Joined</span>
                  <ChevronDown size={14} className="text-gray-500 ml-0.5" />
                </>
              ) : (
                <span>Join Group</span>
              )}
            </Button>

            <button
              type="button"
              aria-label="Group options"
              onClick={() => setShowOptions(true)}
              className="p-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-[#3a3b3c] dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition cursor-pointer"
            >
              <MoreHorizontal size={18} />
            </button>
          </div>
        </div>

        {/* 3. Navigation Tabs */}
        {(() => {
          const allGroupTabs = [
            { id: "DISCUSSION", label: "Discussion" },
            { id: "FEATURED", label: "Featured" },
            { id: "COMMUNITY", label: "Community" },
            { id: "ABOUT", label: "About" },
            { id: "MEMBERS", label: "Members" },
            ...(isAdmin ? [{ id: "SETTINGS", label: "Settings" }] : []),
          ];

          let visibleCount = allGroupTabs.length;
          if (windowWidth < 540) {
            visibleCount = 2;
          } else if (windowWidth < 768) {
            visibleCount = 3;
          } else if (windowWidth < 960) {
            visibleCount = 4;
          }

          const visibleTabs = allGroupTabs.slice(0, visibleCount);
          const overflowTabs = allGroupTabs.slice(visibleCount);
          const isOverflowActive = overflowTabs.some((t) => t.id === activeTab);
          const activeOverflowTab = overflowTabs.find((t) => t.id === activeTab);

          return (
            <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-800 mt-6 pt-1 text-sm sm:text-base font-bold relative">
              <div
                className="flex items-center gap-1 sm:gap-2"
                role="tablist"
                aria-label="Group sections"
              >
                {visibleTabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      onSelectTab(tab.id);
                      setShowMoreDropdown(false);
                    }}
                    role="tab"
                    aria-selected={activeTab === tab.id}
                    className={`px-3 sm:px-4 py-3.5 border-b-3 transition cursor-pointer whitespace-nowrap ${
                      activeTab === tab.id
                        ? "border-[#e02f21] text-[#e02f21]"
                        : "border-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#3a3b3c] rounded-t-lg"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}

                {/* More ▾ Dropdown */}
                {overflowTabs.length > 0 && (
                  <div ref={moreDropdownRef} className="relative">
                    <button
                      type="button"
                      onClick={() => setShowMoreDropdown((prev) => !prev)}
                      role="tab"
                      aria-expanded={showMoreDropdown}
                      className={`px-3 sm:px-4 py-3.5 border-b-3 transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                        isOverflowActive
                          ? "border-[#e02f21] text-[#e02f21]"
                          : "border-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#3a3b3c] rounded-t-lg"
                      }`}
                    >
                      <span>{isOverflowActive ? activeOverflowTab?.label : "More"}</span>
                      <ChevronDown
                        size={15}
                        className={`transition-transform duration-200 ${
                          showMoreDropdown ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {showMoreDropdown && (
                      <div className="absolute top-full left-0 sm:left-auto sm:right-0 mt-1 min-w-[200px] bg-white dark:bg-[#242526] rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                        {overflowTabs.map((tab) => {
                          const isSelected = activeTab === tab.id;
                          return (
                            <button
                              key={tab.id}
                              type="button"
                              onClick={() => {
                                onSelectTab(tab.id);
                                setShowMoreDropdown(false);
                              }}
                              className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition cursor-pointer flex items-center justify-between ${
                                isSelected
                                  ? "bg-red-50 dark:bg-red-950/40 text-[#e02f21] font-bold"
                                  : "text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#3a3b3c]"
                              }`}
                            >
                              <span>{tab.label}</span>
                              {isSelected && (
                                <Check size={16} className="text-[#e02f21]" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowSearch((value) => !value)}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition cursor-pointer"
                  title="Search this group"
                >
                  <Search size={18} />
                </button>
              </div>
            </div>
          );
        })()}
        {showSearch && (
          <input
            autoFocus
            value={search}
            onChange={(event) => onSearch(event.target.value)}
            type="search"
            aria-label="Search this group"
            placeholder="Search recipes and conversations in this group"
            className="mt-3 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#18191a] px-4 py-3 text-sm"
          />
        )}
      </div>
      <Modal
        isOpen={showOptions}
        onClose={() => setShowOptions(false)}
        title="Group options"
        maxWidth="max-w-sm"
      >
        <div className="p-3 space-y-1">
          {[
            { tab: "ABOUT", label: "About this group" },
            { tab: "MEMBERS", label: "See group members" },
            ...(isAdmin
              ? [{ tab: "SETTINGS", label: "Manage group settings" }]
              : []),
          ].map((item) => (
            <button
              key={item.tab}
              type="button"
              className="w-full rounded-xl p-3 text-left text-sm font-semibold hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={() => {
                onSelectTab(item.tab);
                setShowOptions(false);
              }}
            >
              {item.label}
            </button>
          ))}
          {!isAdmin && (
            <button
              type="button"
              className="w-full rounded-xl p-3 text-left text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-2.5 transition cursor-pointer"
              onClick={() => {
                setShowOptions(false);
                setIsReportModalOpen(true);
              }}
            >
              <Flag size={16} />
              <span>Report group</span>
            </button>
          )}
        </div>
      </Modal>
      <Modal
        isOpen={confirmLeave}
        onClose={() => setConfirmLeave(false)}
        title="Leave this group?"
        maxWidth="max-w-sm"
      >
        <div className="p-5">
          <p className="text-sm text-gray-500">
            You’ll stop seeing {group.name} in your groups feed. You can join
            again later.
          </p>
          <div className="mt-5 flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setConfirmLeave(false)}>
              Stay
            </Button>
            <Button
              loading={loading}
              onClick={async () => {
                await handleAction();
                setConfirmLeave(false);
              }}
            >
              Leave group
            </Button>
          </div>
        </div>
      </Modal>

      {/* Report Group Modal */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        targetType="GROUP"
        targetId={group.id}
        targetAuthorName={group.name}
        onLeaveGroup={handleAction}
      />

      {/* Invite Member Modal */}
      <InviteMemberModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        group={group}
      />
    </div>
  );
};

export default GroupHeader;
