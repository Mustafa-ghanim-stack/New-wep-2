'use client';
import { useState } from 'react';
import { useAdminLang } from '../../admin-lang-context';

export default function CropperPage() {
  const { t } = useAdminLang();
  const [preview, setPreview] = useState<string | null>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="container-fluid">
      <div className="mb-3"><h1 className="h3 font-bold mb-1">{t('sidebar.components.cropper')}</h1><p className="text-muted text-sm mb-0">{t('ui.components.cropper.subtitle')}</p></div>
      <div className="row g-4">
        <div className="col-md-6">
          <div className="dashboard-card"><div className="dashboard-card-body">
            <h5 className="fw-semibold mb-3">Upload & Preview</h5>
            <input className="form-control mb-3" type="file" accept="image/*" onChange={handleFile} />
            {preview && <img src={preview} alt="Preview" className="img-fluid border rounded" style={{maxHeight: 300}} />}
            {!preview && <div className="text-center py-5 text-muted"><i className="bi bi-image" style={{fontSize:48}}></i><p className="mt-2">Select an image to preview</p></div>}
          </div></div>
        </div>
        <div className="col-md-6">
          <div className="dashboard-card"><div className="dashboard-card-body">
            <h5 className="fw-semibold mb-3">Crop Controls</h5>
            <p className="text-muted mb-3">Use the select ratio and crop area controls:</p>
            <div className="d-flex flex-wrap gap-2 mb-3">
              <button className="btn btn-sm btn-outline-primary">Free</button>
              <button className="btn btn-sm btn-outline-primary">1:1</button>
              <button className="btn btn-sm btn-outline-primary">4:3</button>
              <button className="btn btn-sm btn-outline-primary">16:9</button>
            </div>
            <div className="d-flex gap-2">
              <button className="btn btn-primary"><i className="bi bi-crop me-1"></i>Crop</button>
              <button className="btn btn-outline-secondary"><i className="bi bi-arrow-clockwise me-1"></i>Rotate</button>
              <button className="btn btn-outline-danger"><i className="bi bi-trash me-1"></i>Reset</button>
            </div>
          </div></div>
        </div>
      </div>
    </div>
  );
}
