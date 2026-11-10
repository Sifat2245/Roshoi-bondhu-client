import { useState } from 'react';
import { Link } from 'react-router';
import { BookOpen, Plus, Search, ArrowUpRight, MoreHorizontal, Bookmark } from 'lucide-react';
import KitchenLayout from '../../features/kitchen/components/KitchenLayout';
import RecipeCard from '../../features/kitchen/components/RecipeCard';
import SaveRecipeModal from '../../features/kitchen/components/SaveRecipeModal';
import { kitchenId, useKitchen } from '../../features/kitchen/model/kitchen-store';
import type { Recipe } from '../../features/kitchen/model/recipe-utils';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import { useToast } from '../../context/ToastContext';

export default function CookbookPage() {
  const { state, update } = useKitchen();
  const { notify } = useToast();
  const [active, setActive] = useState('all');
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState<Recipe | null>(null);
  const [editing, setEditing] = useState<{ id: string; name: string } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const allIds = [...new Set(state.collections.flatMap((c) => c.recipeIds))];
  const activeCollection = state.collections.find((c) => c.id === active);
  const ids = active === 'all' ? allIds : activeCollection?.recipeIds || [];
  const recipes = state.recipes.filter((p) => ids.includes(p.id) && `${p.title} ${p.author?.name} ${p.cuisine}`.toLowerCase().includes(search.toLowerCase()));
  function saveCollection(event) {
    event.preventDefault(); if (!editing?.name.trim()) return;
    if (state.collections.some((c) => c.id !== editing.id && c.name.toLowerCase() === editing.name.trim().toLowerCase())) { notify.error('You already have a cookbook with this name.'); return; }
    const id = editing.id || kitchenId();
    update((s) => { const collection = s.collections.find((c) => c.id === id); if (collection) collection.name = editing.name.trim(); else s.collections.push({ id, name: editing.name.trim(), recipeIds: [] }); });
    setActive(id); setEditing(null); notify.success('Cookbook saved');
  }
  return <KitchenLayout title="Your little recipe library" description="The recipes you want to come back to, all in one familiar place." action={<Button icon={Plus} onClick={() => { setDeleting(false); setEditing({ id: '', name: '' }); }}>New cookbook</Button>}>
    <section className="kitchen-panel p-5 sm:p-7 hidden sm:flex items-center justify-between gap-5 overflow-hidden">
      <div className="max-w-lg"><span className="kitchen-kicker"><Bookmark size={15} />Picked by you</span><h2 className="text-xl sm:text-2xl font-bold mt-3">Good recipes deserve a second helping.</h2><p className="mt-2 text-sm sm:text-base text-gray-500 dark:text-gray-400 leading-relaxed">Keep weeknight favourites, family classics, and everything you’re excited to try.</p><Link to="/?type=RECIPE" className="inline-flex items-center gap-1.5 mt-4 text-sm font-semibold text-[#e02f21]">Find your next favourite <ArrowUpRight size={17} /></Link></div>
      {state.recipes.some((p) => p.image && allIds.includes(p.id)) && <div className="hidden sm:flex shrink-0 -space-x-7 pr-2">{state.recipes.filter((p) => p.image && allIds.includes(p.id)).slice(0, 2).map((p, i) => <img key={p.id} src={p.image} alt="" className={`w-28 h-36 lg:w-32 lg:h-40 object-cover rounded-xl border-4 border-white dark:border-[#242526] shadow-md ${i ? 'rotate-6' : '-rotate-6'}`} />)}</div>}
    </section>
    <section aria-label="Your cookbooks" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {state.collections.map((collection) => { const cover = state.recipes.find((p) => collection.recipeIds.includes(p.id) && p.image); return <button type="button" key={collection.id} aria-pressed={active === collection.id} onClick={() => setActive(collection.id)} className={`kitchen-panel p-4 flex items-center gap-3 text-left transition hover:shadow-sm ${active === collection.id ? 'ring-2 ring-[#e02f21] ring-offset-2 dark:ring-offset-[#18191a]' : ''}`}><div className="w-16 h-16 shrink-0 overflow-hidden rounded-xl bg-red-50 dark:bg-red-950/30 flex items-center justify-center text-[#e02f21]">{cover ? <img src={cover.image} alt="" className="h-full w-full object-cover" /> : <BookOpen size={25} />}</div><span className="min-w-0"><span className="block font-bold break-words">{collection.name}</span><span className="block text-sm text-gray-500 mt-1">{collection.recipeIds.length} {collection.recipeIds.length === 1 ? 'recipe' : 'recipes'}</span></span></button>; })}
    </section>
    <div className="flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-3"><button type="button" onClick={() => setActive('all')} aria-pressed={active === 'all'} className={`rounded-full px-3 py-2 text-sm font-semibold ${active === 'all' ? 'bg-white dark:bg-[#242526] shadow-xs' : 'text-[#e02f21]'}`}>All saved · {allIds.length}</button>{activeCollection && <><h2 className="font-bold text-base">{activeCollection.name}</h2><button type="button" aria-label="Edit cookbook" className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800" onClick={() => { setDeleting(false); setEditing({ id: activeCollection.id, name: activeCollection.name }); }}><MoreHorizontal size={20} /></button></>}</div><label className="relative w-full sm:w-64"><Search size={17} className="absolute left-3 top-3 text-gray-400" /><input aria-label="Search saved recipes" placeholder="Search saved recipes" value={search} onChange={(e) => setSearch(e.target.value)} className="kitchen-input w-full pl-10!" /></label></div>
    {recipes.length ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{recipes.map((recipe) => <RecipeCard key={recipe.id} recipe={recipe} saved onSave={() => setSaving(recipe)} />)}</div> : <div className="kitchen-panel text-center px-5 py-14"><BookOpen size={38} className="text-gray-400 mx-auto mb-4" /><h2 className="font-bold text-lg">{search ? 'No recipes found' : 'A cookbook waiting for good food'}</h2><p className="mt-2 text-sm text-gray-500">{search ? 'Try a recipe name, cook, or cuisine.' : 'Save a recipe from the feed to start filling these pages.'}</p><Link to="/?type=RECIPE" className="inline-block mt-5 text-sm font-semibold text-[#e02f21]">Explore community recipes</Link></div>}
    {saving && <SaveRecipeModal recipe={saving} onClose={() => setSaving(null)} />}
    {editing && <Modal isOpen onClose={() => setEditing(null)} title={deleting ? 'Delete this cookbook?' : editing.id ? 'Edit cookbook' : 'A new home for your favourites'} maxWidth="max-w-md"><form onSubmit={saveCollection} className="p-5 sm:p-6 space-y-5">{deleting ? <><p className="text-sm text-gray-500">“{editing.name}” will be removed. Recipes saved in your other cookbooks stay there.</p><div className="flex justify-end gap-2"><Button variant="secondary" onClick={() => setDeleting(false)}>Back</Button><Button variant="danger" onClick={() => { update((s) => { s.collections = s.collections.filter((c) => c.id !== editing.id); }); setEditing(null); setActive('all'); notify.success('Cookbook deleted'); }}>Delete cookbook</Button></div></> : <><label className="block text-sm font-semibold">Cookbook name<input autoFocus value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} required maxLength={45} placeholder="e.g. Sunday family lunches" className="kitchen-input mt-2 w-full" /></label><div className="flex flex-wrap justify-end gap-2">{editing.id && <Button variant="danger" className="mr-auto" onClick={() => setDeleting(true)}>Delete</Button>}<Button variant="secondary" onClick={() => setEditing(null)}>Cancel</Button><Button type="submit">Save cookbook</Button></div></>}</form></Modal>}
  </KitchenLayout>;
}
