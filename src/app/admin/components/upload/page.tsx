'use client';
import { useState } from 'react';
import { useAdminLang } from '../../admin-lang-context';

export default function UploadPage() {
  const { t } = useAdminLang();
  const [files, setFiles] = useState<string[]>([]);
  const [dragging, setDragging] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const dropped = Array.from(e.dataTransfer.files).map(f => f.name);
    setFiles(prev => [...prev, ...dropped]);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []).map(f => f.name);
    setFiles(prev => [...prev, ...selected]);
  };

  const removeFile = (i: number) => setFiles(files.filter((_, idx) => idx !== i));

  return (
    <div className="container-fluid">
      <div className="mb-3"><h1 className="h3 font-bold mb-1">{t('sidebar.components.upload')}</h1><p className="text-muted text-sm mb-0">{t('ui.components.upload.subtitle')}</p></div>
      <div className="row g-4">
        <div className="col-md-8">
          <div className="dashboard-card"><div className="dashboard-card-body">
            <h5 className="fw-semibold mb-3">Multi File Upload</h5>
            <div
              className={`border-2 border-dashed rounded-3 p-5 text-center ${dragging ? 'border-primary bg-primary bg-opacity-10' : ''}`}
              style={{borderStyle:'dashed', cursor:'pointer', transition:'all 0.2s'}}
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => document.getElementById('fileInput')?.click()}
            >
              <i className="bi bi-cloud-upload" style={{fontSize: 48}}></i>
              <p className="mt-2 mb-0 fw-medium">{dragging ? 'Drop files here' : 'Drag & drop files or click to browse'}</p>
              <small className="text-muted">Supports: images, PDFs, documents</small>
              <input id="fileInput" type="file" multiple className="d-none" onChange={handleFileInput} />
            </div>
            {files.length > 0 && (
              <div className="mt-3">
                <h6 className="fw-semibold mb-2">Uploaded Files ({files.length})</h6>
                <div className="list-group">
                  {files.map((f, i) => (
                    <div key={i} className="list-group-item d-flex align-items-center">
                      <i className="bi bi-file-earmark me-2"></i>
                      <span className="flex-grow-1">{f}</span>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => removeFile(i)}><i className="bi bi-x"></i></button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div></div>
        </div>
      </div>
    </div>
  );
}
