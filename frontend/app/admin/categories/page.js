'use client';

import { useEffect, useState } from 'react';
import {
  Layers, Plus, Edit2, Trash2, RotateCcw, Check, ChevronDown, ChevronRight,
  FolderTree, Search, AlertCircle, Eye, EyeOff
} from 'lucide-react';
import AdminShell from '../../../components/admin/AdminShell';
import { authService } from '../../../services/auth.service';
import { useToast } from '../../../components/Toast';

export default function AdminCategoriesPage() {
  const { addToast } = useToast();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // 'all' | 'active' | 'inactive'
  const [expandedCats, setExpandedCats] = useState({});

  // Modals
  const [mainModal, setMainModal] = useState({ open: false, mode: 'create', data: null });
  const [subModal, setSubModal] = useState({ open: false, mode: 'create', mainId: null, data: null });
  const [saving, setSaving] = useState(false);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await authService.getAdminCategories();
      if (res.success && Array.isArray(res.data)) {
        setCategories(res.data);
        // Expand first category by default
        if (res.data.length > 0 && Object.keys(expandedCats).length === 0) {
          setExpandedCats({ [res.data[0].id]: true });
        }
      } else {
        addToast(res.message || 'Failed to load categories', 'error');
      }
    } catch (err) {
      addToast(err.message || 'Error loading categories', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const toggleExpand = (id) => {
    setExpandedCats(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Main Category Handlers
  const handleSaveMain = async (e) => {
    e.preventDefault();
    setSaving(true);
    const form = e.target;
    const payload = {
      name: form.name.value.trim(),
      slug: form.slug.value.trim(),
      description: form.description.value.trim(),
      display_order: parseInt(form.display_order.value, 10) || 0
    };

    try {
      let res;
      if (mainModal.mode === 'create') {
        res = await authService.createAdminCategory(payload);
      } else {
        res = await authService.updateAdminCategory(mainModal.data.id, payload);
      }

      if (res.success) {
        addToast(res.message || 'Category saved successfully', 'success');
        setMainModal({ open: false, mode: 'create', data: null });
        fetchCategories();
      } else {
        addToast(res.message || 'Failed to save category', 'error');
      }
    } catch (err) {
      addToast(err.message || 'Error saving category', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActiveMain = async (cat) => {
    try {
      let res;
      if (cat.is_active) {
        res = await authService.deleteAdminCategory(cat.id);
      } else {
        res = await authService.restoreAdminCategory(cat.id);
      }
      if (res.success) {
        addToast(res.message, 'success');
        fetchCategories();
      } else {
        addToast(res.message || 'Action failed', 'error');
      }
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  // Sub-Category Handlers
  const handleSaveSub = async (e) => {
    e.preventDefault();
    setSaving(true);
    const form = e.target;
    const payload = {
      name: form.name.value.trim(),
      slug: form.slug.value.trim(),
      display_order: parseInt(form.display_order.value, 10) || 0,
      is_other: form.is_other?.checked || false
    };

    try {
      let res;
      if (subModal.mode === 'create') {
        res = await authService.createAdminSubcategory(subModal.mainId, payload);
      } else {
        res = await authService.updateAdminSubcategory(subModal.data.id, payload);
      }

      if (res.success) {
        addToast(res.message || 'Sub-category saved successfully', 'success');
        setSubModal({ open: false, mode: 'create', mainId: null, data: null });
        fetchCategories();
      } else {
        addToast(res.message || 'Failed to save sub-category', 'error');
      }
    } catch (err) {
      addToast(err.message || 'Error saving sub-category', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActiveSub = async (sub) => {
    try {
      let res;
      if (sub.is_active) {
        res = await authService.deleteAdminSubcategory(sub.id);
      } else {
        res = await authService.restoreAdminSubcategory(sub.id);
      }
      if (res.success) {
        addToast(res.message, 'success');
        fetchCategories();
      } else {
        addToast(res.message || 'Action failed', 'error');
      }
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  // Filter & Search
  const filteredCategories = categories.filter(cat => {
    if (filter === 'active' && !cat.is_active) return false;
    if (filter === 'inactive' && cat.is_active) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchMain = cat.name.toLowerCase().includes(q) || cat.slug.toLowerCase().includes(q);
      const matchSub = (cat.subcategories || []).some(s => s.name.toLowerCase().includes(q) || s.slug.toLowerCase().includes(q));
      return matchMain || matchSub;
    }
    return true;
  });

  return (
    <AdminShell title="Category & Sub-Category Hierarchy">
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        {/* Header Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, margin: '0 0 4px', color: '#0f172a' }}>
              Category Hierarchy Management
            </h1>
            <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>
              Manage platform Main Categories and Sub-Categories. Soft-delete or restore categories without breaking existing supplier or booking records.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setMainModal({ open: true, mode: 'create', data: null })}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#1d6fe8', color: '#fff', border: 0, padding: '10px 16px', borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
          >
            <Plus size={16} /> Add Main Category
          </button>
        </div>

        {/* Filter Bar */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 18, background: '#fff', padding: '12px 16px', borderRadius: 10, border: '1px solid #e2e8f0', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <Search size={16} style={{ position: 'absolute', left: 10, top: 10, color: '#94a3b8' }} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search categories or sub-categories..."
              style={{ width: '100%', padding: '8px 12px 8px 34px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13, outline: 'none' }}
            />
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {['all', 'active', 'inactive'].map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 6,
                  border: '1px solid #e2e8f0',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: filter === f ? '#1d6fe8' : '#fff',
                  color: filter === f ? '#fff' : '#64748b'
                }}
              >
                {f === 'all' ? 'All' : f === 'active' ? 'Active' : 'Soft-Deleted / Inactive'}
              </button>
            ))}
          </div>
        </div>

        {/* Categories List */}
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#64748b', background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0' }}>
            Loading category catalogue...
          </div>
        ) : filteredCategories.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#64748b', background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0' }}>
            No categories found matching your query.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {filteredCategories.map((cat) => {
              const isExpanded = expandedCats[cat.id];
              return (
                <div
                  key={cat.id}
                  style={{
                    background: '#fff',
                    borderRadius: 12,
                    border: `1px solid ${cat.is_active ? '#e2e8f0' : '#fecaca'}`,
                    boxShadow: '0 2px 6px rgba(15,23,42,0.03)',
                    overflow: 'hidden'
                  }}
                >
                  {/* Category Header */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '14px 18px',
                      background: cat.is_active ? '#f8fafc' : '#fef2f2',
                      borderBottom: isExpanded ? '1px solid #e2e8f0' : 'none',
                      cursor: 'pointer'
                    }}
                    onClick={() => toggleExpand(cat.id)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      {isExpanded ? <ChevronDown size={18} color="#64748b" /> : <ChevronRight size={18} color="#64748b" />}
                      <span style={{ width: 34, height: 34, borderRadius: 8, background: cat.is_active ? '#eff6ff' : '#fee2e2', color: cat.is_active ? '#1d6fe8' : '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14 }}>
                        {cat.display_order}
                      </span>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <strong style={{ fontSize: 16, color: '#0f172a' }}>{cat.name}</strong>
                          <span style={{ fontSize: 12, color: '#94a3b8' }}>({cat.slug})</span>
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 800,
                              padding: '2px 8px',
                              borderRadius: 999,
                              background: cat.is_active ? '#dcfce7' : '#fee2e2',
                              color: cat.is_active ? '#166534' : '#991b1b'
                            }}
                          >
                            {cat.is_active ? 'Active' : 'Inactive (Soft Deleted)'}
                          </span>
                        </div>
                        {cat.description ? (
                          <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{cat.description}</div>
                        ) : null}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }} onClick={(e) => e.stopPropagation()}>
                      <span style={{ fontSize: 12, color: '#64748b', marginRight: 6 }}>
                        <strong>{cat.subcategories?.length || 0}</strong> sub-categories
                      </span>
                      <button
                        type="button"
                        onClick={() => setSubModal({ open: true, mode: 'create', mainId: cat.id, data: null })}
                        style={{ border: '1px solid #cbd5e1', background: '#fff', color: '#1d6fe8', padding: '6px 10px', borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'inline-flex', gap: 4, alignItems: 'center' }}
                      >
                        <Plus size={13} /> Add Sub
                      </button>
                      <button
                        type="button"
                        onClick={() => setMainModal({ open: true, mode: 'edit', data: cat })}
                        style={{ border: '1px solid #cbd5e1', background: '#fff', color: '#475569', padding: '6px 8px', borderRadius: 6, fontSize: 12, cursor: 'pointer' }}
                        title="Edit category"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleActiveMain(cat)}
                        style={{
                          border: `1px solid ${cat.is_active ? '#fca5a5' : '#86efac'}`,
                          background: '#fff',
                          color: cat.is_active ? '#dc2626' : '#15803d',
                          padding: '6px 8px',
                          borderRadius: 6,
                          fontSize: 12,
                          cursor: 'pointer'
                        }}
                        title={cat.is_active ? 'Soft Delete / Deactivate' : 'Restore / Activate'}
                      >
                        {cat.is_active ? <Trash2 size={13} /> : <RotateCcw size={13} />}
                      </button>
                    </div>
                  </div>

                  {/* Sub-Categories Accordion */}
                  {isExpanded && (
                    <div style={{ padding: '14px 18px' }}>
                      {(!cat.subcategories || cat.subcategories.length === 0) ? (
                        <div style={{ padding: '14px 0', color: '#94a3b8', fontSize: 13, fontStyle: 'italic' }}>
                          No sub-categories added yet under {cat.name}.
                        </div>
                      ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 10 }}>
                          {cat.subcategories.map((sub) => (
                            <div
                              key={sub.id}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '10px 12px',
                                borderRadius: 8,
                                border: `1px solid ${sub.is_active ? '#e2e8f0' : '#fecaca'}`,
                                background: sub.is_active ? '#fff' : '#fef2f2'
                              }}
                            >
                              <div style={{ minWidth: 0, paddingRight: 8 }}>
                                <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {sub.name}
                                  {sub.is_other ? <span style={{ marginLeft: 6, fontSize: 10, background: '#fef3c7', color: '#92400e', padding: '1px 5px', borderRadius: 4 }}>Custom/Other</span> : null}
                                </div>
                                <div style={{ fontSize: 11, color: '#94a3b8' }}>
                                  {sub.slug} · Order: {sub.display_order}
                                </div>
                              </div>
                              <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                                <button
                                  type="button"
                                  onClick={() => setSubModal({ open: true, mode: 'edit', mainId: cat.id, data: sub })}
                                  style={{ border: 0, background: 'transparent', color: '#64748b', cursor: 'pointer', padding: 4 }}
                                  title="Edit sub-category"
                                >
                                  <Edit2 size={13} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleToggleActiveSub(sub)}
                                  style={{ border: 0, background: 'transparent', color: sub.is_active ? '#dc2626' : '#15803d', cursor: 'pointer', padding: 4 }}
                                  title={sub.is_active ? 'Soft Delete' : 'Restore'}
                                >
                                  {sub.is_active ? <Trash2 size={13} /> : <RotateCcw size={13} />}
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Modal: Main Category */}
        {mainModal.open && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, zIndex: 999 }}>
            <div style={{ background: '#fff', borderRadius: 12, padding: 24, width: '100%', maxWidth: 480, boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}>
              <h3 style={{ margin: '0 0 16px', fontSize: 18, fontWeight: 800 }}>
                {mainModal.mode === 'create' ? 'Add New Main Category' : `Edit Category: ${mainModal.data?.name}`}
              </h3>
              <form onSubmit={handleSaveMain} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#1e293b' }}>
                  Category Name *
                  <input
                    name="name"
                    defaultValue={mainModal.data?.name || ''}
                    required
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 6, border: '1px solid #cbd5e1', marginTop: 4, boxSizing: 'border-box' }}
                  />
                </label>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#1e293b' }}>
                  Slug (Optional - auto generated if empty)
                  <input
                    name="slug"
                    defaultValue={mainModal.data?.slug || ''}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 6, border: '1px solid #cbd5e1', marginTop: 4, boxSizing: 'border-box' }}
                  />
                </label>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#1e293b' }}>
                  Display Order
                  <input
                    name="display_order"
                    type="number"
                    defaultValue={mainModal.data?.display_order || 0}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 6, border: '1px solid #cbd5e1', marginTop: 4, boxSizing: 'border-box' }}
                  />
                </label>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#1e293b' }}>
                  Description
                  <textarea
                    name="description"
                    defaultValue={mainModal.data?.description || ''}
                    rows={2}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 6, border: '1px solid #cbd5e1', marginTop: 4, boxSizing: 'border-box' }}
                  />
                </label>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                  <button
                    type="button"
                    onClick={() => setMainModal({ open: false, mode: 'create', data: null })}
                    style={{ border: '1px solid #cbd5e1', background: '#fff', padding: '9px 16px', borderRadius: 6, cursor: 'pointer', fontWeight: 700 }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    style={{ border: 0, background: '#1d6fe8', color: '#fff', padding: '9px 18px', borderRadius: 6, cursor: saving ? 'wait' : 'pointer', fontWeight: 700 }}
                  >
                    {saving ? 'Saving...' : 'Save Category'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Sub-Category */}
        {subModal.open && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, zIndex: 999 }}>
            <div style={{ background: '#fff', borderRadius: 12, padding: 24, width: '100%', maxWidth: 440, boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}>
              <h3 style={{ margin: '0 0 16px', fontSize: 18, fontWeight: 800 }}>
                {subModal.mode === 'create' ? 'Add New Sub-Category' : `Edit Sub-Category: ${subModal.data?.name}`}
              </h3>
              <form onSubmit={handleSaveSub} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#1e293b' }}>
                  Sub-Category Name *
                  <input
                    name="name"
                    defaultValue={subModal.data?.name || ''}
                    required
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 6, border: '1px solid #cbd5e1', marginTop: 4, boxSizing: 'border-box' }}
                  />
                </label>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#1e293b' }}>
                  Slug (Optional - auto generated if empty)
                  <input
                    name="slug"
                    defaultValue={subModal.data?.slug || ''}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 6, border: '1px solid #cbd5e1', marginTop: 4, boxSizing: 'border-box' }}
                  />
                </label>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#1e293b' }}>
                  Display Order
                  <input
                    name="display_order"
                    type="number"
                    defaultValue={subModal.data?.display_order || 0}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 6, border: '1px solid #cbd5e1', marginTop: 4, boxSizing: 'border-box' }}
                  />
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#334155', cursor: 'pointer' }}>
                  <input
                    name="is_other"
                    type="checkbox"
                    defaultChecked={Boolean(subModal.data?.is_other)}
                    style={{ width: 16, height: 16, accentColor: '#1d6fe8' }}
                  />
                  <span>Mark as "Other" (User-defined custom entry target)</span>
                </label>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                  <button
                    type="button"
                    onClick={() => setSubModal({ open: false, mode: 'create', mainId: null, data: null })}
                    style={{ border: '1px solid #cbd5e1', background: '#fff', padding: '9px 16px', borderRadius: 6, cursor: 'pointer', fontWeight: 700 }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    style={{ border: 0, background: '#1d6fe8', color: '#fff', padding: '9px 18px', borderRadius: 6, cursor: saving ? 'wait' : 'pointer', fontWeight: 700 }}
                  >
                    {saving ? 'Saving...' : 'Save Sub-Category'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
