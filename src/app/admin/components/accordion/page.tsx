'use client';
import { useAdminLang } from '../../admin-lang-context';

export default function AccordionPage() {
  const { t } = useAdminLang();
  return (
    <div className="container-fluid">
      <div className="mb-3"><h1 className="h3 font-bold mb-1">{t('sidebar.components.accordion')}</h1><p className="text-muted text-sm mb-0">{t('ui.components.accordion.subtitle')}</p></div>
      <div className="row g-4">
        <div className="col-md-6">
          <div className="dashboard-card"><div className="dashboard-card-body">
            <h5 className="fw-semibold mb-3">Basic Accordion</h5>
            <div className="accordion" id="basicAccordion">
              <div className="accordion-item">
                <h2 className="accordion-header"><button className="accordion-button" data-bs-toggle="collapse" data-bs-target="#collapseOne">Accordion Item #1</button></h2>
                <div id="collapseOne" className="accordion-collapse collapse show" data-bs-parent="#basicAccordion"><div className="accordion-body">This is the first item's accordion body.</div></div>
              </div>
              <div className="accordion-item">
                <h2 className="accordion-header"><button className="accordion-button collapsed" data-bs-toggle="collapse" data-bs-target="#collapseTwo">Accordion Item #2</button></h2>
                <div id="collapseTwo" className="accordion-collapse collapse" data-bs-parent="#basicAccordion"><div className="accordion-body">This is the second item's accordion body.</div></div>
              </div>
              <div className="accordion-item">
                <h2 className="accordion-header"><button className="accordion-button collapsed" data-bs-toggle="collapse" data-bs-target="#collapseThree">Accordion Item #3</button></h2>
                <div id="collapseThree" className="accordion-collapse collapse" data-bs-parent="#basicAccordion"><div className="accordion-body">This is the third item's accordion body.</div></div>
              </div>
            </div>
          </div></div>
        </div>
        <div className="col-md-6">
          <div className="dashboard-card"><div className="dashboard-card-body">
            <h5 className="fw-semibold mb-3">Flush Accordion</h5>
            <div className="accordion accordion-flush" id="flushAccordion">
              <div className="accordion-item"><h2 className="accordion-header"><button className="accordion-button" data-bs-toggle="collapse" data-bs-target="#flushOne">Item #1</button></h2><div id="flushOne" className="accordion-collapse collapse show" data-bs-parent="#flushAccordion"><div className="accordion-body">Content for item one.</div></div></div>
              <div className="accordion-item"><h2 className="accordion-header"><button className="accordion-button collapsed" data-bs-toggle="collapse" data-bs-target="#flushTwo">Item #2</button></h2><div id="flushTwo" className="accordion-collapse collapse" data-bs-parent="#flushAccordion"><div className="accordion-body">Content for item two.</div></div></div>
              <div className="accordion-item"><h2 className="accordion-header"><button className="accordion-button collapsed" data-bs-toggle="collapse" data-bs-target="#flushThree">Item #3</button></h2><div id="flushThree" className="accordion-collapse collapse" data-bs-parent="#flushAccordion"><div className="accordion-body">Content for item three.</div></div></div>
            </div>
          </div></div>
        </div>
      </div>
    </div>
  );
}
