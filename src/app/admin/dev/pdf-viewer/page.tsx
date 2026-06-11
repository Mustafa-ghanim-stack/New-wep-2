'use client';
import { useState } from 'react';
import { useAdminLang } from '../../admin-lang-context';

export default function PdfViewerPage() {
  const { t } = useAdminLang();
  const [file, setFile] = useState<string | null>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f && f.type === 'application/pdf') {
      setFile(URL.createObjectURL(f));
    } else if (f) {
      alert('Please select a PDF file.');
    }
  };

  return (
    <div className="container-fluid">
      <div className="mb-3"><h1 className="h3 font-bold mb-1">{t('sidebar.pdfviewer')}</h1><p className="text-muted text-sm mb-0">{t('ui.dev.pdfviewer.subtitle')}</p></div>
      <div className="row g-4">
        <div className="col-12">
          <div className="dashboard-card"><div className="dashboard-card-body">
            <h5 className="fw-semibold mb-3">PDF Document Viewer</h5>
            <div className="mb-3">
              <input className="form-control" type="file" accept=".pdf" onChange={handleFile} />
              <small className="text-muted">Select a PDF file to preview</small>
            </div>
            {file ? (
              <div className="border rounded" style={{height: 500}}>
                <iframe src={file} className="w-100 h-100 border-0" title="PDF Viewer"></iframe>
              </div>
            ) : (
              <div className="text-center py-5 text-muted border rounded">
                <i className="bi bi-filetype-pdf" style={{fontSize: 64}}></i>
                <p className="mt-2 mb-0">No PDF selected</p>
                <small>Upload a PDF file to view it here</small>
              </div>
            )}
          </div></div>
        </div>
      </div>
    </div>
  );
}
