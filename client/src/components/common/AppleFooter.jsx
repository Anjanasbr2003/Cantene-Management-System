import React from 'react';
import { Link } from 'react-router-dom';

export const AppleFooter = () => {
  return (
    <footer className="footer-apple">
      <div className="apple-container-wide">
        
        {/* Footnote notes */}
        <div style={{ paddingBottom: 24, borderBottom: '1px solid var(--color-hairline)', marginBottom: 32 }}>
          <p className="fine-print" style={{ color: 'var(--color-ink-muted-48)', lineHeight: 1.4 }}>
            1. All kitchen preparation times are estimated based on real-time station workloads and sensor telemetry.
            <br />
            2. Organic certifications and allergen declarations are audited weekly by the Canteen Quality Assurance team.
            <br />
            3. Role credentials determine real-time access roles (Customer Diner, Kitchen Display Specialist, Operations Executive).
          </p>
        </div>

        {/* Dense Link Columns (2.41 line height) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 32,
            marginBottom: 48
          }}
        >
          {/* Col 1 */}
          <div>
            <div className="caption-strong" style={{ color: 'var(--color-ink)', marginBottom: 12 }}>
              Canteen & Menu
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <Link to="/menu" className="dense-link" style={{ color: 'var(--color-ink-muted-80)', textDecoration: 'none' }}>
                Daily Fresh Menu
              </Link>
              <Link to="/tables" className="dense-link" style={{ color: 'var(--color-ink-muted-80)', textDecoration: 'none' }}>
                Table QR & Status
              </Link>
              <Link to="/orders" className="dense-link" style={{ color: 'var(--color-ink-muted-80)', textDecoration: 'none' }}>
                Live Order Radar
              </Link>
              <Link to="/menu" className="dense-link" style={{ color: 'var(--color-ink-muted-80)', textDecoration: 'none' }}>
                Dietary & Allergen Map
              </Link>
            </div>
          </div>

          {/* Col 2 */}
          <div>
            <div className="caption-strong" style={{ color: 'var(--color-ink)', marginBottom: 12 }}>
              Account & Credentials
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <Link to="/login" className="dense-link" style={{ color: 'var(--color-ink-muted-80)', textDecoration: 'none' }}>
                Sign In to System
              </Link>
              <Link to="/register" className="dense-link" style={{ color: 'var(--color-ink-muted-80)', textDecoration: 'none' }}>
                Create Diner Account
              </Link>
              <Link to="/login" className="dense-link" style={{ color: 'var(--color-ink-muted-80)', textDecoration: 'none' }}>
                Claim 50 Pts Bonus
              </Link>
              <Link to="/orders" className="dense-link" style={{ color: 'var(--color-ink-muted-80)', textDecoration: 'none' }}>
                Loyalty Point Balance
              </Link>
            </div>
          </div>

          {/* Col 3 */}
          <div>
            <div className="caption-strong" style={{ color: 'var(--color-ink)', marginBottom: 12 }}>
              Staff & Operations
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <Link to="/staff" className="dense-link" style={{ color: 'var(--color-ink-muted-80)', textDecoration: 'none' }}>
                Kitchen Display System
              </Link>
              <Link to="/admin" className="dense-link" style={{ color: 'var(--color-ink-muted-80)', textDecoration: 'none' }}>
                Executive Analytics
              </Link>
              <Link to="/admin" className="dense-link" style={{ color: 'var(--color-ink-muted-80)', textDecoration: 'none' }}>
                Inventory Valuation
              </Link>
              <Link to="/admin" className="dense-link" style={{ color: 'var(--color-ink-muted-80)', textDecoration: 'none' }}>
                Supplier Lead Times
              </Link>
            </div>
          </div>

          {/* Col 4 */}
          <div>
            <div className="caption-strong" style={{ color: 'var(--color-ink)', marginBottom: 12 }}>
              Values & Sustainability
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span className="dense-link" style={{ color: 'var(--color-ink-muted-80)' }}>
                Zero Food Waste Goal
              </span>
              <span className="dense-link" style={{ color: 'var(--color-ink-muted-80)' }}>
                100% Eco Packaging
              </span>
              <span className="dense-link" style={{ color: 'var(--color-ink-muted-80)' }}>
                Local Farm Bio-Partners
              </span>
              <span className="dense-link" style={{ color: 'var(--color-ink-muted-80)' }}>
                Precision Nutrition Lab
              </span>
            </div>
          </div>
        </div>

        {/* Legal Row */}
        <div
          style={{
            paddingTop: 24,
            borderTop: '1px solid var(--color-hairline)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 16
          }}
        >
          <div className="fine-print" style={{ color: 'var(--color-ink-muted-48)' }}>
            Copyright © 2026 Canteen Management System. All rights reserved. Photography-first Museum Gallery Interface.
          </div>

          <div style={{ display: 'flex', gap: 20 }}>
            <span className="fine-print" style={{ color: 'var(--color-ink-muted-48)' }}>Privacy Policy</span>
            <span className="fine-print" style={{ color: 'var(--color-ink-muted-48)' }}>Terms of Service</span>
            <span className="fine-print" style={{ color: 'var(--color-ink-muted-48)' }}>Food Safety Standards</span>
            <span className="fine-print" style={{ color: 'var(--color-ink-muted-48)' }}>System Status</span>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default AppleFooter;
