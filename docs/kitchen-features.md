# Kitchen features and frontend handoff

Open `/login` and choose **Explore interactive demo**, or choose **Try interactive demo** in an existing account’s menu. Feed shortcuts and **My kitchen** navigation lead to the new pages. Open a recipe through its title, photo, or comments to find cooking tools. Open a group’s **Community** tab for challenges and polls. **Exit demo** leaves the preview without signing out of an existing real session.

| Feature | Entry point | Working interactions |
| --- | --- | --- |
| Cookbooks | `/cookbook`, recipe bookmarks | Create, rename, search, delete; save recipes to multiple private collections; remove saved recipes. |
| Cooking mode | Recipe → Cook now | Ingredient checklist, cooking steps, progress, configurable timer, pause/reset, completion screen. |
| Serving adjustment | Recipe → Ingredients | Scale whole numbers, decimals, fractions, and mixed fractions for 1–24 servings; carry servings into cooking mode and planning. Free-form amounts stay unchanged. |
| Pantry | `/pantry` | Add/remove ingredients, common suggestions, comma-separated entry, cooking-time filter, matching recipes and missing ingredients. |
| Cooking reviews | Recipe → I cooked this | Star rating, notes, photo upload, editing, recipe-specific review list. |
| Meal planning | `/meal-planner` | Navigate weeks/days; plan breakfast/lunch/dinner; replace/move/remove meals; adjust servings; generate shopping entries; check items; add extras; copy a list. |
| Group activities | Group → Community | Join/leave a cooking challenge; enter a recipe shared in that group; view entries; create polls with 2–4 choices; vote/change/remove a vote. Membership gates participation. |
| Drafts | `/drafts`, existing composer | Autosave, save on close/reload, search, resume, publish, delete with confirmation. Publishing removes the draft. Group drafts retain their destination. |

## Storage and backend integration

New kitchen features save on the device under `heshel:kitchen:v1:<demo|user>:<userId>`. They do not add server endpoints or change existing API contracts. Cookbooks, pantry items, plans, reviews, drafts, votes, and challenge entries need backend integration for sharing and synchronization across devices. Real accounts start with an empty kitchen.

The model is in `src/features/kitchen/model/kitchen-store.ts`. Suggested entities:

- `Cookbook(ownerId, name)` and `CookbookRecipe(cookbookId, recipeId)`.
- `PantryItem(ownerId, name)`.
- `MealPlan(ownerId, date, slot, recipeId, servings)` with unique owner/date/slot. Dates are local calendar dates.
- `ShoppingItem(ownerId, mealId?, text, checked)`. Generated entries retain source recipes/servings; quantities are listed per recipe rather than combined across incompatible units. Changing a meal clears outdated checkmarks.
- `CookedReview(authorId, recipeId, rating, text, image)` with one editable review per author/recipe.
- `Draft(ownerId, groupId?, postPayload, updatedAt)`.
- `GroupPoll`, `PollOption`, and `PollVote` with one choice per user/poll.
- `GroupChallenge`, `ChallengeParticipant`, and `ChallengeEntry(challengeId, userId, recipeId)`.

Apply server authorization for private collections/drafts, group participation, and recipe ownership when connecting these features. Recipe snapshots in the local store support saved/planned meals; they do not replace the canonical server recipe.

## Demo and review

The demo includes **12 cooks, six groups, and 20 recipe/story posts**, varied comments, moderator roles, sample cooking reviews, cookbooks, and meal ideas. Fixture upgrades preserve existing edits and custom content.

The existing red accent, social cards, navigation, and dark theme are retained. Kitchen navigation now uses a persistent left sidebar rather than duplicate tabs. Improvements include nested-dialog focus/Escape handling, keyboard-accessible post photos and recipe titles, readable group cards, accurate demo group counts, contained mobile notifications, a responsive missing-page screen, and correct session refresh after editing personal details.

See [Social post and group controls](social-controls.md) for regular-post polls, challenge creation/management, member role menus, bans, and shared original-post navigation.

Pages now load on demand. The main production JavaScript entry decreased from approximately 1,061 kB to 661 kB after splitting; page chunks download separately. The existing large-chunk advisory still applies to the shared entry.

Validation includes 132 page/viewport checks, 40 production route checks plus an anonymous redirect check, 19 existing social workflows, kitchen workflows, phone-sized dialogs, account isolation, and demo switching with mocked authentication reads. No backend writes occurred in these demo checks. Run the six core recipe checks with `node --experimental-strip-types tests/recipe-utils.test.mjs` using a Node version that supports TypeScript stripping. Server integration was not tested or modified.

## Sample photography

Existing assets are reused. Additional local demo photos come from Unsplash: [bread](https://images.unsplash.com/photo-1509440159596-0249088772ff), [curry](https://images.unsplash.com/photo-1596797038530-2c107229654b), [salad](https://images.unsplash.com/photo-1512621776951-a57141f2eefd), [cake](https://images.unsplash.com/photo-1578985545062-69928b1d9587), and [noodles](https://images.unsplash.com/photo-1569718212165-3a8278d5f624).
