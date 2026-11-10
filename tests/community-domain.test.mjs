import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validatePoll, castVote, pollEnded, pollVoters, memberActions, applyMemberAction, resolveGroup, canCreateChallenge, validateChallenge, originalPost } from '../src/features/community/model/community-domain.ts';

const poll = () => ({ id: 'p', question: 'What should we cook tonight?', multiple: false, authorId: 'owner', closed: false, options: [{ id: 'a', text: 'Pasta', voterIds: ['a-person'] }, { id: 'b', text: 'Curry', voterIds: [] }] });
const group = () => ({ id: 'g', creatorId: 'owner', isMember: true, membershipRole: 'ADMIN', membersCount: 5, members: [{ userId: 'owner', role: 'ADMIN' }, { userId: 'admin', role: 'ADMIN' }, { userId: 'mod', role: 'MODERATOR' }, { userId: 'member', role: 'MEMBER' }, { userId: 'other', role: 'MEMBER' }] });

test('polls require a meaningful question and distinct, bounded answers', () => {
  assert.equal(validatePoll('What should we cook?', ['Rice', 'Pasta']), '');
  assert.ok(validatePoll('Hi', ['Rice', 'Pasta']));
  assert.ok(validatePoll('What should we cook?', [' Rice ', 'rice']));
  assert.ok(validatePoll('What should we cook?', ['Rice', '']));
  assert.ok(validatePoll('What should we cook?', Array.from({ length: 7 }, (_, i) => `Answer ${i}`)));
});
test('a single-choice vote moves between answers and can be removed', () => {
  let p = castVote(poll(), 'a', 'me');
  assert.deepEqual(p.options[0].voterIds, ['a-person', 'me']);
  p = castVote(p, 'b', 'me');
  assert.deepEqual(p.options[0].voterIds, ['a-person']);
  assert.deepEqual(p.options[1].voterIds, ['me']);
  p = castVote(p, 'b', 'me');
  assert.deepEqual(p.options[1].voterIds, []);
});
test('multiple-choice polls count people once and keep other selected answers', () => {
  let p = { ...poll(), multiple: true };
  p = castVote(castVote(p, 'a', 'me'), 'b', 'me');
  assert.deepEqual(pollVoters(p), ['a-person', 'me']);
  p = castVote(p, 'a', 'me');
  assert.ok(p.options[1].voterIds.includes('me'));
  assert.equal(pollVoters(p).length, 2);
});
test('closed and expired polls reject new votes, including stale UI clicks', () => {
  assert.throws(() => castVote({ ...poll(), closed: true }, 'a', 'me'));
  assert.throws(() => castVote({ ...poll(), expiresAt: '2020-01-01' }, 'a', 'me'));
  assert.throws(() => castVote(poll(), 'missing', 'me'));
  assert.equal(pollEnded({ ...poll(), expiresAt: '2099-01-01' }), false);
});
test('member permissions respect owner, staff hierarchy, and self protection', () => {
  const g = group();
  assert.deepEqual(memberActions(g, 'owner', 'owner'), []);
  assert.deepEqual(memberActions(g, 'admin', 'owner'), []);
  assert.deepEqual(memberActions(g, 'member', 'other'), []);
  assert.deepEqual(memberActions(g, 'outsider', 'member'), []);
  assert.deepEqual(memberActions(g, 'mod', 'member'), ['REMOVE', 'BAN']);
  assert.deepEqual(memberActions(g, 'mod', 'admin'), []);
  assert.deepEqual(memberActions(g, 'mod', 'mod'), []);
  assert.ok(memberActions(g, 'owner', 'admin').includes('MEMBER'));
  assert.ok(memberActions(g, 'admin', 'member').includes('MODERATOR'));
});
test('member role changes and bans persist without restoring membership on unban', () => {
  const base = group();
  let changes = applyMemberAction(base, 'owner', 'member', 'MODERATOR');
  let view = resolveGroup(base, changes, 'owner');
  assert.equal(view.members.find((m) => m.userId === 'member').role, 'MODERATOR');
  changes = applyMemberAction(view, 'owner', 'member', 'BAN', changes);
  view = resolveGroup(base, changes, 'owner');
  assert.equal(view.membersCount, 4);
  assert.equal(view.bannedMembers.length, 1);
  changes = applyMemberAction(view, 'owner', 'member', 'UNBAN', changes);
  view = resolveGroup(base, changes, 'owner');
  assert.equal(view.bannedMembers.length, 0);
  assert.equal(view.membersCount, 4);
  assert.throws(() => applyMemberAction(base, 'member', 'other', 'ADMIN'));
});
test('member totals do not double-count exclusions and creator stays an admin', () => {
  const view = resolveGroup(group(), { roles: { owner: 'MEMBER' }, removed: ['member'], banned: ['member'] }, 'owner');
  assert.equal(view.membersCount, 4);
  assert.equal(view.members.find((m) => m.userId === 'owner').role, 'ADMIN');
});
test('challenge creation is staff-only unless admins enable member creation', () => {
  assert.ok(canCreateChallenge(group(), 'owner'));
  assert.ok(canCreateChallenge(group(), 'mod'));
  assert.equal(canCreateChallenge(group(), 'member'), false);
  assert.ok(canCreateChallenge(group(), 'member', 'MEMBERS'));
  assert.equal(canCreateChallenge(group(), 'outsider', 'MEMBERS'), false);
  assert.equal(validateChallenge('Seasonal supper', 'Cook a lovely meal with a seasonal vegetable.'), '');
  assert.ok(validateChallenge('Hi', 'Too short'));
  assert.ok(validateChallenge('Seasonal supper', 'Cook a lovely meal with a seasonal vegetable.', '2020-01-01'));
});
test('shared-post resolution finds the original and stops malformed loops', () => {
  const recipe = { id: 'recipe', postType: 'RECIPE' };
  assert.equal(originalPost({ id: 'outer', postType: 'REPOST', originalPost: { id: 'inner', postType: 'REPOST', originalPost: recipe } }), recipe);
  const cyclic = { id: 'loop', postType: 'REPOST' }; cyclic.originalPost = cyclic;
  assert.equal(originalPost(cyclic), cyclic);
});
