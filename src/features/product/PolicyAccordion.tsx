import React from "react";

const PolicyAccordion: React.FC = () => {
  return (
    <div className="accordion  my-5 border border-0 "  id="policyAccordion">
      
      {/* ===== Return & Refund Policy ===== */}
      <div className="accordion-item border-0 border-top border-bottom " style={{backgroundColor:"transparent"}}>
        <h2 className="accordion-header" id="headingOne">
          <button
            className="accordion-button collapsed bg-transparent shadow-none"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#collapseOne"
            aria-expanded="false"
            aria-controls="collapseOne"
          >
            Return & Refund Policy
          </button>
        </h2>
        <div
          id="collapseOne"
          className="accordion-collapse collapse"
          aria-labelledby="headingOne"
          data-bs-parent="#policyAccordion"
        >
          <div className="accordion-body text-muted">
            I’m a Return and Refund policy. I’m a great place to let your customers know 
            what to do in case they are dissatisfied with their purchase. Having a straightforward 
            refund or exchange policy is a great way to build trust and reassure your customers 
            that they can buy with confidence.
          </div>
        </div>
      </div>

      {/* ===== Shipping Policy ===== */}
      <div className="accordion-item border-0 border-bottom" style={{backgroundColor:"transparent"}}>
        <h2 className="accordion-header" id="headingTwo">
          <button
            className="accordion-button collapsed bg-transparent shadow-none"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#collapseTwo"
            aria-expanded="false"
            aria-controls="collapseTwo"
          >
            Shipping Policy
          </button>
        </h2>
        
        <div
          id="collapseTwo"
          className="accordion-collapse collapse"
          aria-labelledby="headingTwo"
          data-bs-parent="#policyAccordion"
        >
          <div className="accordion-body text-muted">
            I'm a shipping policy. I'm a great place to add more information about your shipping methods, packaging and cost. Providing straightforward information about your shipping policy is a great way to build trust and reassure your customers that they can buy from you with confidence.
          </div>
        </div>
      </div>

    </div>
  );
};

export default PolicyAccordion;
