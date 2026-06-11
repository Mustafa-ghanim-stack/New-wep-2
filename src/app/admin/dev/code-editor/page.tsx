'use client';
import { useState } from 'react';
import { useAdminLang } from '../../admin-lang-context';

export default function CodeEditorPage() {
  const { t } = useAdminLang();
  const [code, setCode] = useState('function hello() {\n  console.log("Hello, World!");\n  return true;\n}\n\nhello();');
  const [output, setOutput] = useState('');

  const runCode = () => {
    try {
      const logs: string[] = [];
      const mockConsole = { log: (...args: any[]) => logs.push(args.map(String).join(' ')) };
      const fn = new Function('console', code);
      fn(mockConsole);
      setOutput(logs.join('\n') || 'Code executed successfully (no output).');
    } catch (e: any) {
      setOutput(`Error: ${e.message}`);
    }
  };

  return (
    <div className="container-fluid">
      <div className="mb-3"><h1 className="h3 font-bold mb-1">{t('sidebar.codeeditor')}</h1><p className="text-muted text-sm mb-0">{t('ui.dev.codeeditor.subtitle')}</p></div>
      <div className="row g-4">
        <div className="col-12">
          <div className="dashboard-card"><div className="dashboard-card-body">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-semibold mb-0">JavaScript Editor</h5>
              <div className="d-flex gap-2">
                <button className="btn btn-sm btn-success" onClick={runCode}><i className="bi bi-play-fill me-1"></i>Run</button>
                <button className="btn btn-sm btn-outline-secondary" onClick={() => setCode('')}>Clear</button>
              </div>
            </div>
            <div className="border rounded mb-3" style={{background:'#1e1e2e'}}>
              <textarea
                className="form-control border-0 text-light font-monospace"
                style={{background:'#1e1e2e', minHeight: 200, resize: 'vertical', tabSize: 2}}
                value={code}
                onChange={e => setCode(e.target.value)}
                spellCheck={false}
              />
            </div>
            <h6 className="fw-semibold mb-2">Output</h6>
            <pre className="border rounded p-3 mb-0" style={{background:'#f8f9fa', minHeight: 60, whiteSpace:'pre-wrap'}}>{output || 'Click "Run" to execute the code.'}</pre>
          </div></div>
        </div>
      </div>
    </div>
  );
}
