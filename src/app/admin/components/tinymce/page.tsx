'use client';
import { useState } from 'react';
import { useAdminLang } from '../../admin-lang-context';

export default function TinymcePage() {
  const { t } = useAdminLang();
  const [content, setContent] = useState('<p>Start typing here...</p>');
  const [showPreview, setShowPreview] = useState(false);

  return (
    <div className="container-fluid">
      <div className="mb-3"><h1 className="h3 font-bold mb-1">{t('sidebar.components.tinymce')}</h1><p className="text-muted text-sm mb-0">{t('ui.components.tinymce.subtitle')}</p></div>
      <div className="dashboard-card"><div className="dashboard-card-body">
        <h5 className="fw-semibold mb-3">Rich Text Editor</h5>
        <div className="border rounded mb-3">
          <div className="border-bottom p-2 d-flex flex-wrap gap-1 bg-light">
            <button className="btn btn-sm btn-light" onClick={() => document.execCommand('bold')}><i className="bi bi-type-bold"></i></button>
            <button className="btn btn-sm btn-light" onClick={() => document.execCommand('italic')}><i className="bi bi-type-italic"></i></button>
            <button className="btn btn-sm btn-light" onClick={() => document.execCommand('underline')}><i className="bi bi-type-underline"></i></button>
            <span className="border-start mx-1"></span>
            <button className="btn btn-sm btn-light" onClick={() => document.execCommand('insertUnorderedList')}><i className="bi bi-list-ul"></i></button>
            <button className="btn btn-sm btn-light" onClick={() => document.execCommand('insertOrderedList')}><i className="bi bi-list-ol"></i></button>
            <span className="border-start mx-1"></span>
            <button className="btn btn-sm btn-light" onClick={() => document.execCommand('justifyLeft')}><i className="bi bi-text-left"></i></button>
            <button className="btn btn-sm btn-light" onClick={() => document.execCommand('justifyCenter')}><i className="bi bi-text-center"></i></button>
            <button className="btn btn-sm btn-light" onClick={() => document.execCommand('justifyRight')}><i className="bi bi-text-right"></i></button>
          </div>
          <div
            contentEditable
            className="p-3"
            style={{minHeight: 250, outline: 'none'}}
            dangerouslySetInnerHTML={{__html: content}}
            onInput={e => setContent((e.target as HTMLElement).innerHTML)}
          />
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-primary" onClick={() => alert('Content saved!')}><i className="bi bi-check-lg me-1"></i>Save</button>
          <button className="btn btn-outline-secondary" onClick={() => setShowPreview(!showPreview)}><i className="bi bi-eye me-1"></i>{showPreview ? 'Hide' : 'Preview'}</button>
        </div>
        {showPreview && (
          <div className="mt-3 p-3 border rounded bg-light">
            <h6 className="fw-semibold mb-2">Preview</h6>
            <div dangerouslySetInnerHTML={{__html: content}} />
          </div>
        )}
      </div></div>
    </div>
  );
}
