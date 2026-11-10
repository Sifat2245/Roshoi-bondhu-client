import pasta from '../../assets/recipe-28-550x690.jpg';
import wedges from '../../assets/recipe-8-550x690.jpg';
import noodles from '../../assets/demo/noodles.jpg';
import kitchen from '../../assets/user-box.jpg';
import bread from '../../assets/demo/bread.jpg';
import curry from '../../assets/demo/curry.jpg';
import salad from '../../assets/demo/salad.jpg';
import cake from '../../assets/demo/cake.jpg';

const MODE_KEY = 'heshel:demo:enabled';
const DATA_KEY = 'heshel:demo:v1';
const EVENT = 'heshel:demo-change';
const now = () => new Date().toISOString();
const ago = (hours: number) => new Date(Date.now() - hours * 3600000).toISOString();
const id = (prefix: string) => `${prefix}-${crypto.randomUUID()}`;

function avatar(name: string, color: string) {
  const initials = name.split(' ').slice(0, 2).map((part) => part[0]).join('');
  return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160"><rect width="160" height="160" rx="80" fill="${color}"/><text x="80" y="88" dominant-baseline="middle" text-anchor="middle" font-family="Arial,sans-serif" font-size="52" font-weight="600" fill="#fff">${initials}</text></svg>`)}`;
}

function seed() {
  const people = [
    ['demo-rahima', 'Rahima Sultana', '#bb4f3b', 'Dhaka', 'Sharing family recipes, one delicious memory at a time.'],
    ['cook-saba', 'Saba Ahmed', '#507d70', 'Chattogram', 'Quick dinners, big flavours. Always happy to swap a kitchen tip.'],
    ['cook-farhan', 'Farhan Rahman', '#5679a1', 'Dhaka', 'Weekend cook. Pasta enthusiast. Learning something new every day.'],
    ['cook-nusrat', 'Nusrat Jahan', '#9b6481', 'Sylhet', 'A little baking, a little experimenting, and lots of sharing.'],
    ['cook-tanvir', 'Tanvir Hasan', '#a17c42', 'Rajshahi', 'Good food brings good people together.'],
    ['cook-ayesha', 'Ayesha Khan', '#7964a0', 'Dhaka', 'Home cooking and stories from my grandmother’s kitchen.'],
    ['cook-reza', 'Reza Karim', '#477e87', 'Khulna', 'Fresh ingredients and simple recipes.'],
    ['cook-maya', 'Maya Das', '#b66d45', 'Dhaka', 'Baking bread, keeping a tiny herb garden, and sharing both.'],
    ['cook-imran', 'Imran Chowdhury', '#57744e', 'Chattogram', 'One pot, plenty of spice, and always room for another guest.'],
    ['cook-nadia', 'Nadia Islam', '#a95e68', 'Sylhet', 'Seasonal vegetables and colourful lunchboxes.'],
    ['cook-rifat', 'Rifat Hossain', '#607da5', 'Rajshahi', 'Learning my way around the kitchen, one dinner at a time.'],
    ['cook-meher', 'Meher Afroz', '#87724e', 'Khulna', 'Tea-time treats and the stories behind our family recipes.'],
  ];
  const users: any[] = people.map(([userId, name, color, city, bio], index) => ({
    id: userId, name, username: name.toLowerCase().replace(/ /g, '_'),
    email: index ? `${userId}@example.com` : 'chef.rahima@heshel.com',
    image: avatar(name, color), coverImage: kitchen, city, bio,
    work: index ? 'Home cook' : 'Recipe creator at Heshel', education: 'University of Dhaka',
    phone: '', gender: 'Prefer not to say', role: 'USER', emailVerified: true,
    createdAt: ago(24 * 180), followersCount: 128 + index * 27, followingCount: 46 + index * 9,
    mutualFriends: 3 + index, mutualCount: 3 + index,
  }));
  const groupInfo = [
    ['g-grandma', 'Secret Grandma Recipes', 'secret-grandma-recipes', 'Heirloom & Traditional', kitchen],
    ['g-baking', 'Baking & Sweet Tooth Club', 'baking-sweet-tooth-club', 'Baking & Pastry', bread],
    ['g-quick', 'Quick & Delicious Dinners', 'quick-delicious-dinners', 'Healthy Diet', noodles],
    ['g-spices', 'Desi Spices & Curries', 'desi-spices-curries', 'Street Food', curry],
    ['g-seasonal', 'The Seasonal Table', 'the-seasonal-table', 'Healthy Diet', salad],
    ['g-beginners', 'First-Time Cooks Club', 'first-time-cooks-club', 'Heirloom & Traditional', pasta],
  ];
  const groups: any[] = groupInfo.map(([groupId, name, slug, category, coverImage], index) => ({
    id: groupId, name, slug, category, coverImage, avatar: coverImage,
    description: index === 0 ? 'A welcoming place to preserve family recipes, trade kitchen secrets, and celebrate the food we grew up with. Share your latest creation or ask another home cook for a little help.' : `A friendly community for ${name.toLowerCase()}. Share recipes, ask questions, and cook something wonderful together.`,
    privacy: index === 1 ? 'PRIVATE' : 'PUBLIC', creatorId: index ? users[index].id : users[0].id,
    isMember: index < 2, membershipRole: index === 0 ? 'ADMIN' : index === 1 ? 'MEMBER' : null,
    membersCount: index < 2 ? users.length : users.length - 1, requiresPostApproval: false, createdAt: ago(24 * 90),
    members: users.filter((_, i) => index < 2 || i !== 0).map((user, i) => ({ id: `${groupId}-${user.id}`, userId: user.id, groupId, user, role: user.id === users[index].id ? 'ADMIN' : i === 2 ? 'MODERATOR' : 'MEMBER' })),
  }));
  const recipes = [
    ['Prawn & veggie pasta', 'Tonight’s comfort food, straight from my kitchen. The secret is saving a little pasta water for the sauce. What are you cooking today?', pasta, 'Italian', 25, 0, 0],
    ['Crispy herb potato wedges', 'Golden edges, fluffy centres. Soak the potatoes in cold water first, then dry them really well before roasting.', wedges, 'Bangladeshi', 35, 1, 0],
    ['Colourful vegetable noodles', 'A fridge-clearing dinner that everyone asked me to make again. Add whichever vegetables you have at home!', noodles, 'Chinese', 20, 2, 2],
    ['A little weekend kitchen joy', 'My favourite part of the weekend: cooking slowly, listening to music, and making enough to share with the neighbours.', kitchen, '', 0, 3, 1],
    ['Pasta for two', 'Made this for a friend who came over after work. A simple meal tastes even better with good company.', pasta, 'Italian', 20, 0, -1],
    ['A better way to use leftover herbs', 'Mix chopped herbs with a little olive oil and freeze in an ice cube tray. Future-you will thank you on a busy weeknight!', wedges, '', 0, 4, 3],
    ['Easy garlic potato wedges', 'My first recipe here! These are our favourite after-school snack. Would love to hear your favourite dipping sauce.', wedges, 'Bangladeshi', 30, 5, 0],
    ['A bowl full of colour', 'Trying one new vegetable every week. This week: a big bowl of crunchy vegetables and noodles.', noodles, 'Chinese', 15, 6, 2],
    ['My first no-knead loaf', 'A little patience does most of the work. Crispy outside, soft inside. Who else is baking this weekend?', bread, 'Baking', 55, 7, 1],
    ['Chickpea & tomato curry', 'One pot and a handful of pantry staples. I make extra so tomorrow’s lunch is sorted too.', curry, 'Bangladeshi', 30, 8, 3],
    ['Crunchy garden salad', 'Fresh from the market this morning. The lemon dressing is just three ingredients and works on everything.', salad, 'Healthy', 15, 9, 4],
    ['Sunday chocolate cake', 'Baked this for our family tea. My niece insisted on decorating it herself. A little messy and a lot of love.', cake, 'Desserts', 50, 11, 1],
    ['My first dinner without a recipe!', 'Nothing fancy — just garlic, pasta, and a little confidence. What was the first dish you learned to cook?', pasta, '', 0, 10, 5],
    ['Roasted potatoes for a crowd', 'These disappear before anything else at our family table. Keep the potatoes in a single layer for crispy edges.', wedges, 'Bangladeshi', 35, 0, 0],
    ['A better lunch break', 'Packing lunch has become my favourite little ritual. Today: crunchy vegetables and a tangy lemon dressing.', salad, 'Healthy', 10, 1, 4],
    ['What’s your favourite kitchen shortcut?', 'Mine is freezing chopped garlic in small portions. Share one little trick that makes your weeknight cooking easier!', '', '', 0, 6, 5],
    ['Creamy tomato pasta', 'Simple, comforting, and ready before the family starts asking when dinner is. Save some of the pasta water!', pasta, 'Italian', 25, 2, 2],
    ['The smell of freshly baked bread', 'Sharing half this loaf with our next-door neighbour. Food has a way of starting the nicest conversations.', bread, '', 0, 7, 1],
    ['A pot of comfort', 'This curry tastes even better the next day. Does anyone else cook a little extra on purpose?', curry, 'Bangladeshi', 40, 4, 3],
    ['Herby potatoes, yoghurt dip', 'Our contribution to this week’s group challenge. Added coriander from the balcony garden!', wedges, 'Bangladeshi', 30, 5, 0],
  ];
  const recipeParts = (image: string) => image === bread ? {
    ingredients: ['3 cups plain flour', '1 tsp instant yeast', '1 tsp salt', '1½ cups warm water'],
    instructions: [{ title: 'Mix & rest', details: 'Mix flour, yeast, salt and water into a shaggy dough. Cover and let rise until doubled.' }, { title: 'Shape', details: 'Turn onto a floured surface and gently shape into a round loaf. Rest for 30 minutes.' }, { title: 'Bake', details: 'Bake in a preheated covered pot at 220°C for 30 minutes, then uncover for 15 minutes until golden.' }],
  } : image === curry ? {
    ingredients: ['2 cups cooked chickpeas', '2 tomatoes, chopped', '1 onion, sliced', '2 cloves garlic, minced', '1 tbsp olive oil', '1 tsp ground cumin', '½ tsp salt'],
    instructions: [{ title: 'Build the base', details: 'Warm the oil and soften the onion for 5 minutes. Stir in garlic and cumin.' }, { title: 'Simmer', details: 'Add tomatoes, chickpeas and half a cup of water. Simmer for 15 minutes until the sauce thickens.' }, { title: 'Finish', details: 'Season with salt, taste, and serve with rice or warm bread.' }],
  } : image === salad ? {
    ingredients: ['2 cups lettuce', '1 carrot, grated', '1 tomato, chopped', '1 cucumber, sliced', '1 tbsp olive oil', '1 lemon', '½ tsp salt'],
    instructions: [{ title: 'Prepare', details: 'Wash and dry the lettuce. Grate the carrot and chop the other vegetables.' }, { title: 'Dress', details: 'Whisk olive oil with lemon juice and salt. Taste and adjust the dressing.' }, { title: 'Toss & serve', details: 'Toss the vegetables with the dressing just before serving to keep them crunchy.' }],
  } : image === cake ? {
    ingredients: ['2 cups plain flour', '1 cup sugar', '½ cup cocoa powder', '2 eggs', '1 cup milk', '½ cup butter', '1 tsp baking powder'],
    instructions: [{ title: 'Prepare', details: 'Heat the oven to 180°C. Grease a cake tin and sift together the dry ingredients.' }, { title: 'Mix', details: 'Beat butter and sugar, add eggs and milk, then fold in the dry ingredients until just combined.' }, { title: 'Bake', details: 'Pour into the tin and bake for 35 minutes, until a skewer comes out clean. Cool before decorating.' }],
  } : image === wedges ? {
    ingredients: ['4 potatoes', '2 tbsp olive oil', '2 cloves garlic, minced', '1 tsp dried herbs', '½ tsp salt', '½ tsp black pepper'],
    instructions: [{ title: 'Prepare the potatoes', details: 'Heat the oven to 220°C. Cut potatoes into even wedges, rinse in cold water, and pat dry.' }, { title: 'Season', details: 'Toss with olive oil, garlic, herbs, salt and pepper. Arrange in one layer on a baking tray.' }, { title: 'Roast', details: 'Roast for 30 minutes, turning halfway, until the edges are golden and the centres are soft.' }],
  } : {
    ingredients: ['200 g pasta', '1 cup broccoli', '1 carrot, sliced', '2 cloves garlic, minced', '1 tbsp olive oil', '½ tsp salt'],
    instructions: [{ title: 'Get ready', details: 'Chop the vegetables and mince the garlic. Bring a large pan of salted water to the boil.' }, { title: 'Cook the pasta', details: 'Cook the pasta according to the packet. Save half a cup of cooking water before draining.' }, { title: 'Bring it together', details: 'Soften garlic in olive oil. Add the vegetables, toss with the pasta and a splash of cooking water, then season and serve.' }],
  };
  const posts: any[] = recipes.map(([title, caption, image, cuisine, time, authorIndex, groupIndex], index) => ({
    id: `demo-post-${index + 1}`, authorId: users[Number(authorIndex)].id, author: users[Number(authorIndex)],
    postType: time ? 'RECIPE' : 'CASUAL', title: time ? title : '', caption, content: caption, image, cuisine,
    preparationTime: time, cookingTime: time, servings: 2 + index % 3,
    categories: ['Dinner', index % 2 ? 'Vegetarian' : 'Quick & Easy'], tags: ['Dinner', 'Quick & Easy'],
    ingredients: time ? [...(index === 0 ? ['150 g prawns'] : []), ...recipeParts(String(image)).ingredients.map((item) => image === noodles ? item.replace('200 g pasta', '200 g noodles') : item)] : [],
    instructions: time ? recipeParts(String(image)).instructions : [],
    groupId: Number(groupIndex) < 0 ? null : groups[Number(groupIndex)].id,
    hasLiked: false, likeCount: 12 + index * 9, commentCount: 2, shareCount: index % 4,
    isPinned: index === 0, createdAt: ago(index * 3 + 1), updatedAt: ago(index * 3 + 1),
    comments: [1, 2, ...(index % 3 === 0 ? [3] : [])].map((offset) => ({ id: `comment-${index}-${offset}`, postId: `demo-post-${index + 1}`, author: users[(index + offset) % users.length], authorId: users[(index + offset) % users.length].id, content: ['Saving this for the weekend. Thanks for explaining the steps so clearly!', 'Made something similar yesterday — a squeeze of lemon at the end is lovely.', 'Could I use sunflower oil instead? This looks like something my family would love.', 'That golden colour! Please share your favourite dipping sauce too.', 'I love the story behind this. My grandmother used to cook for the whole neighbourhood.', 'Tried this with what I had in the fridge and it worked beautifully.'][((index + offset) % 6)], createdAt: ago(index * 3 + 0.5) })),
  }));
  const notifications = users.slice(1, 6).map((actor, index) => ({
    id: `notification-${index}`, actor, sender: actor, userId: users[0].id,
    type: index === 2 ? 'GROUP_INVITE' : index % 2 ? 'COMMENT' : 'LIKE',
    iconType: index === 2 ? 'INVITE' : index % 2 ? 'COMMENT' : 'HEART',
    message: index === 2 ? 'invited you to join Quick & Delicious Dinners.' : index % 2 ? 'commented on your recipe: “Can’t wait to try this!”' : 'loved your Prawn & veggie pasta recipe.',
    link: index === 2 ? '/group/quick-delicious-dinners' : '/post/demo-post-1',
    isUnread: index < 3, actionable: index === 2, timeAgo: `${index * 12 + 2} minutes ago`, createdAt: ago(index / 3),
  }));
  return { fixtureVersion: 3, users, groups, posts, notifications, friends: ['cook-saba', 'cook-farhan', 'cook-maya'], requests: ['cook-nusrat', 'cook-tanvir'], following: ['cook-saba', 'cook-farhan', 'cook-maya'], settings: {} as Record<string, any> };
}

export const isDemoMode = () => localStorage.getItem(MODE_KEY) === 'true';
export const getDemoSnapshot = () => isDemoMode() ? localStorage.getItem(DATA_KEY) : null;
export function subscribeDemo(listener: () => void) {
  window.addEventListener(EVENT, listener);
  window.addEventListener('storage', listener);
  return () => { window.removeEventListener(EVENT, listener); window.removeEventListener('storage', listener); };
}
export function readDemo(): ReturnType<typeof seed> {
  try {
    const stored = JSON.parse(localStorage.getItem(DATA_KEY) || 'null');
    if (stored?.users?.length && stored?.posts) {
      if (stored.fixtureVersion !== 3) {
        const fresh = seed();
        for (const user of fresh.users) if (!stored.users.some((u) => u.id === user.id)) stored.users.push(user);
        for (const group of fresh.groups) {
          const current = stored.groups.find((g) => g.id === group.id);
          if (!current) { if (['g-seasonal', 'g-beginners'].includes(group.id)) stored.groups.push(group); continue; }
          for (const member of group.members) if (member.userId !== stored.users[0].id && !current.members.some((m) => m.userId === member.userId)) current.members.push(member);
          current.membersCount = current.members.length;
          if (group.id === 'g-baking' && current.coverImage?.includes('recipe-28')) current.coverImage = group.coverImage;
          if (group.id === 'g-spices' && current.coverImage?.includes('recipe-8')) current.coverImage = group.coverImage;
        }
        for (const post of fresh.posts) {
          const current = stored.posts.find((p) => p.id === post.id);
          if (!current && Number(post.id.replace('demo-post-', '')) > 8) stored.posts.push(post);
          if (current?.ingredients?.some((item) => typeof item === 'string' && item.includes('main ingredient'))) { current.ingredients = post.ingredients; current.instructions = post.instructions; }
          if (current?.image?.includes('search-hero-2')) { current.image = post.image; current.ingredients = post.ingredients; current.instructions = post.instructions; }
        }
        stored.fixtureVersion = 3;
        localStorage.setItem(DATA_KEY, JSON.stringify(stored));
      }
      return stored;
    }
  } catch { /* Recover invalid demo data. */ }
  const state = seed();
  localStorage.setItem(DATA_KEY, JSON.stringify(state));
  return state;
}
export function writeDemo(state: ReturnType<typeof seed>) {
  localStorage.setItem(DATA_KEY, JSON.stringify(state));
  window.dispatchEvent(new Event(EVENT));
}
export function startDemo() {
  readDemo();
  localStorage.setItem(MODE_KEY, 'true');
  window.dispatchEvent(new Event(EVENT));
}
export function exitDemo() {
  localStorage.removeItem(MODE_KEY);
  window.dispatchEvent(new Event(EVENT));
}
export function resetDemo() { writeDemo(seed()); }
let cachedSnapshot: string | null;
let cachedSession: any;
export function getDemoSession() {
  const snapshot = getDemoSnapshot();
  if (snapshot !== cachedSnapshot || !cachedSession) {
    cachedSnapshot = snapshot;
    const user = readDemo().users[0];
    if (!cachedSession || JSON.stringify(user) !== JSON.stringify(cachedSession.user)) {
      cachedSession = { user, session: { id: 'demo-session', token: 'frontend-demo', expiresAt: '2099-01-01T00:00:00.000Z' } };
    }
  }
  return cachedSession;
}

export async function demoRequest(endpoint: string, method: string, payload: any) {
  await new Promise((resolve) => setTimeout(resolve, 100));
  const url = new URL(endpoint, window.location.origin);
  const path = url.pathname.replace(/\/$/, '');
  const parts = path.split('/').filter(Boolean);
  const state = readDemo();
  const me = state.users[0];
  const decorate = (post: any) => ({ ...post, author: state.users.find((u) => u.id === post.authorId) || post.author, group: state.groups.find((g) => g.id === post.groupId), commentCount: post.comments?.length || 0 });
  const decorateGroup = (group: any) => ({ ...group, postsCount: state.posts.filter((p) => p.groupId === group.id).length, members: (group.members || []).map((member) => ({ ...member, user: state.users.find((u) => u.id === member.userId) || member.user })) });
  let result: any;
  if (path === '/api/upload/image' && payload instanceof FormData) {
    const file = payload.get('image') as File;
    if (!file?.type.startsWith('image/') || file.size > 5 * 1024 * 1024) throw new Error('Choose an image smaller than 5 MB.');
    const dataUrl = await new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = reject; reader.readAsDataURL(file); });
    return { success: true, data: { url: dataUrl } };
  }
  if (parts[1] === 'post') {
    const post = state.posts.find((p) => p.id === parts[2]);
    if (method === 'GET' && !parts[2]) {
      const q = url.searchParams;
      result = state.posts.filter((p) => (!q.get('authorId') || p.authorId === q.get('authorId')) && (!q.get('groupId') || p.groupId === q.get('groupId')) && (!q.get('type') || p.postType === q.get('type')) && (!q.get('cuisine') || p.cuisine === q.get('cuisine')) && (!q.get('tag') || [...(p.tags || []), ...(p.categories || [])].includes(q.get('tag'))) && (!q.get('maxTime') || (p.preparationTime > 0 && p.preparationTime <= Number(q.get('maxTime')))) && (!q.get('filter') || q.get('filter') !== 'FOLLOWING' || p.authorId === me.id || state.following.includes(p.authorId)) && (!q.get('search') || `${p.title} ${p.caption} ${p.author?.name}`.toLowerCase().includes(q.get('search')!.toLowerCase()))).sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt) || b.id.localeCompare(a.id));
      const limit = Math.min(100, Math.max(1, Number(q.get('limit')) || 50));
      const page = Math.max(1, Number(q.get('page')) || 1);
      return { success: true, data: result.slice((page - 1) * limit, page * limit).map(decorate), meta: { page, limit, total: result.length, totalPages: Math.ceil(result.length / limit) } };
    } else if (method === 'POST' && !parts[2]) {
      result = { ...payload, id: id('post'), authorId: me.id, author: me, comments: [], hasLiked: false, likeCount: 0, commentCount: 0, createdAt: now() };
      state.posts.unshift(result);
    } else {
      if (!post) throw new Error('This post is no longer available.');
      if (method === 'GET') result = decorate(post);
      else if (parts[3] === 'like') { post.hasLiked = !post.hasLiked; post.likeCount += post.hasLiked ? 1 : -1; result = { liked: post.hasLiked, likeCount: post.likeCount }; }
      else if (parts[3] === 'comment') { result = { id: id('comment'), postId: post.id, authorId: me.id, author: me, content: payload.content, createdAt: now() }; post.comments.push(result); post.commentCount = post.comments.length; }
      else if (parts[3] === 'share') { result = { id: id('post'), postType: 'REPOST', authorId: me.id, author: me, caption: payload.caption || '', originalPost: decorate(post), originalPostId: post.id, comments: [], likeCount: 0, hasLiked: false, createdAt: now() }; state.posts.unshift(result); post.shareCount = (post.shareCount || 0) + 1; }
      else if (method === 'DELETE') { if (post.authorId !== me.id) throw new Error('You can only delete your own posts.'); state.posts = state.posts.filter((p) => p.id !== post.id); result = { id: post.id }; }
      else { if (post.authorId !== me.id) throw new Error('You can only edit your own posts.'); Object.assign(post, payload, { updatedAt: now() }); result = decorate(post); }
    }
  } else if (parts[1] === 'group') {
    const group = state.groups.find((g) => g.slug === parts[2] || g.id === parts[2]);
    if (method === 'GET' && !parts[2]) result = state.groups.filter((g) => (!url.searchParams.get('myGroups') || g.isMember) && (!url.searchParams.get('search') || g.name.toLowerCase().includes(url.searchParams.get('search')!.toLowerCase()))).map(decorateGroup);
    else if (method === 'POST' && !parts[2]) {
      const slug = `${payload.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'cooking-group'}-${Date.now().toString(36)}`;
      result = { ...payload, id: id('group'), slug, coverImage: payload.coverImage || kitchen, isMember: true, membershipRole: 'ADMIN', creatorId: me.id, membersCount: 1, members: [{ id: id('member'), userId: me.id, user: me, role: 'ADMIN' }], createdAt: now() };
      state.groups.unshift(result);
    } else {
      if (!group) throw new Error('This group could not be found.');
      if (method === 'GET') result = decorateGroup(group);
      else if (parts[3] === 'join' || parts[3] === 'leave') {
        const joining = parts[3] === 'join';
        if (joining !== group.isMember) {
          group.isMember = joining; group.membersCount += joining ? 1 : -1;
          group.membershipRole = joining ? (group.creatorId === me.id ? 'ADMIN' : 'MEMBER') : null;
          group.members = joining ? [...group.members, { id: id('member'), userId: me.id, user: me, role: group.membershipRole }] : group.members.filter((m: any) => m.userId !== me.id);
        }
        result = group;
      } else { if (group.membershipRole !== 'ADMIN') throw new Error('Only group admins can edit group settings.'); Object.assign(group, payload); result = group; }
    }
  } else if (parts[1] === 'user') {
    if (parts[2] === 'notifications') result = state.notifications;
    else if (parts[2] === 'friends') result = state.users.filter((u) => u.id !== me.id && (parts[3] === 'all' ? state.friends.includes(u.id) : !state.friends.includes(u.id) && !state.requests.includes(u.id) && !(state.settings.sentRequests || []).includes(u.id) && !(state.settings.hiddenSuggestions || []).includes(u.id)));
    else if (parts[2] === 'profile' || parts[2] === 'bio') { Object.assign(me, payload); result = me; }
    else {
      const user = state.users.find((u) => u.id === (parts[2] === 'me' ? me.id : parts[2]));
      if (!user) throw new Error('This profile could not be found.');
      if (parts[3] === 'follow') { const following = state.following.includes(user.id); state.following = following ? state.following.filter((uid) => uid !== user.id) : [...state.following, user.id]; result = { isFollowing: !following }; }
      else result = { ...user, isFollowing: state.following.includes(user.id), friends: state.users.filter((u) => state.friends.includes(u.id)) };
    }
  } else throw new Error(`No frontend demo handler for ${method} ${path}`);
  if (method !== 'GET') writeDemo(state);
  return { success: true, data: result };
}
