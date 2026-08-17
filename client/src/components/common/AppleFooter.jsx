import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export const AppleFooter = () => {
  const { t } = useTranslation();

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
              {t('footer_col_menu')}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <Link to="/menu" className="dense-link" style={{ color: 'var(--color-ink-muted-80)', textDecoration: 'none' }}>
                {t('nav_menu')}
              </Link>
              <Link to="/tables" className="dense-link" style={{ color: 'var(--color-ink-muted-80)', textDecoration: 'none' }}>
                {t('nav_tables')}
              </Link>
              <Link to="/orders" className="dense-link" style={{ color: 'var(--color-ink-muted-80)', textDecoration: 'none' }}>
                {t('nav_orders')}
              </Link>
              <Link to="/menu" className="dense-link" style={{ color: 'var(--color-ink-muted-80)', textDecoration: 'none' }}>
                {t('tasting_selection')}
              </Link>
            </div>
          </div>

          {/* Col 2 */}
          <div>
            <div className="caption-strong" style={{ color: 'var(--color-ink)', marginBottom: 12 }}>
              {t('footer_col_account')}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <Link to="/login" className="dense-link" style={{ color: 'var(--color-ink-muted-80)', textDecoration: 'none' }}>
                {t('sign_in')}
              </Link>
              <Link to="/register" className="dense-link" style={{ color: 'var(--color-ink-muted-80)', textDecoration: 'none' }}>
                {t('register')}
              </Link>
              <Link to="/login" className="dense-link" style={{ color: 'var(--color-ink-muted-80)', textDecoration: 'none' }}>
                Bonus Rewards
              </Link>
              <Link to="/orders" className="dense-link" style={{ color: 'var(--color-ink-muted-80)', textDecoration: 'none' }}>
                Orbit Loyalty Status
              </Link>
            </div>
          </div>

          {/* Col 3 */}
          <div>
            <div className="caption-strong" style={{ color: 'var(--color-ink)', marginBottom: 12 }}>
              {t('footer_col_staff')}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <Link to="/staff" className="dense-link" style={{ color: 'var(--color-ink-muted-80)', textDecoration: 'none' }}>
                {t('nav_staff')}
              </Link>
              <Link to="/admin" className="dense-link" style={{ color: 'var(--color-ink-muted-80)', textDecoration: 'none' }}>
                {t('nav_admin')}
              </Link>
              <Link to="/admin" className="dense-link" style={{ color: 'var(--color-ink-muted-80)', textDecoration: 'none' }}>
                {t('tab_inventory')}
              </Link>
              <Link to="/admin" className="dense-link" style={{ color: 'var(--color-ink-muted-80)', textDecoration: 'none' }}>
                Supplier Lead Times
              </Link>
            </div>
          </div>

          {/* Col 4 */}
          <div>
            <div className="caption-strong" style={{ color: 'var(--color-ink)', marginBottom: 12 }}>
              {t('footer_col_values')}
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
            {t('footer_copyright')}
          </div>

          <div style={{ display: 'flex', gap: 20 }}>
            <span className="fine-print" style={{ color: 'var(--color-ink-muted-48)' }}>{t('privacy_policy')}</span>
            <span className="fine-print" style={{ color: 'var(--color-ink-muted-48)' }}>{t('terms_of_service')}</span>
            <span className="fine-print" style={{ color: 'var(--color-ink-muted-48)' }}>{t('food_safety')}</span>
            <span className="fine-print" style={{ color: 'var(--color-ink-muted-48)' }}>{t('system_status')}</span>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default AppleFooter;
