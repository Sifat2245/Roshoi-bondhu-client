import React from 'react';
import { Flag, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import Button from '../ui/Button';

const AdminReportsTab = ({
  reports = [],
  onResolveReport,
  onDismissReport,
  onDeleteReportedPost,
}) => {
  return (
    <div className="bg-white dark:bg-[#242526] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden p-5 space-y-4">
      <h3 className="font-bold text-base text-gray-900 dark:text-white">
        Moderation Queue & Reports ({reports.length})
      </h3>

      {reports.length === 0 ? (
        <div className="py-12 text-center text-xs text-gray-400">
          <Flag size={32} className="mx-auto text-gray-300 dark:text-gray-600 mb-2" />
          No reports pending. Everything is clean!
        </div>
      ) : (
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {reports.map((r) => (
            <div key={r.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 text-[10px] font-bold">
                    {r.reason}
                  </span>
                  <span className="text-xs text-gray-400">
                    Reported by {r.reporter?.name || 'User'}
                  </span>
                </div>
                <p className="text-xs text-gray-700 dark:text-gray-300">
                  {r.details || 'No additional comment provided.'}
                </p>
                {r.post && (
                  <p className="text-[11px] text-gray-400 italic">
                    Target Post: "{r.post.caption?.slice(0, 80)}..."
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button
                  onClick={() => onResolveReport(r.id)}
                  variant="outline"
                  className="text-xs px-3 py-1.5"
                >
                  <CheckCircle size={14} className="text-emerald-500 mr-1" /> Resolve
                </Button>
                <Button
                  onClick={() => onDismissReport(r.id)}
                  variant="outline"
                  className="text-xs px-3 py-1.5"
                >
                  <XCircle size={14} className="text-gray-400 mr-1" /> Dismiss
                </Button>
                {r.post && (
                  <Button
                    onClick={() => onDeleteReportedPost(r.post.id, r.id)}
                    className="text-xs px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white"
                  >
                    <Trash2 size={14} className="mr-1" /> Delete Post
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminReportsTab;

