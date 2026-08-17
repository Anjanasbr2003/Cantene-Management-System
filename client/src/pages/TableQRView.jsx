import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { message, Modal, Spin } from 'antd';
import { 
  QrCode, 
  Utensils, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  RefreshCw, 
  ExternalLink,
  Users,
  Sparkles,
  ChevronRight,
  Plus
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchTables, updateTableStatusLocally } from '../store/tableSlice';
import { setTableNumber, setOrderType } from '../store/cartSlice';
import { playSuccessChime } from '../utils/audio';

const springTransition = { type: 'spring', bounce: 0, duration: 0.35 };

export const TableQRView = () => {
  const { tables, loading } = useSelector((state) => state.tables);
  const { user, token } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [selectedFilter, setSelectedFilter] = useState('All');
  const [activeModalTable, setActiveModalTable] = useState(null);

  const defaultTables = [
    { id: 'tbl_1', number: 'T-01', capacity: 2, status: 'Available', currentOrderId: null, qrCodeUrl: 'http://localhost:3000/menu?table=T-01' },
    { id: 'tbl_2', number: 'T-02', capacity: 4, status: 'Occupied', currentOrderId: 'ORD-9821', occupantName: 'Alex Mercer', prepMinutes: 8, qrCodeUrl: 'http://localhost:3000/menu?table=T-02' },
    { id: 'tbl_3', number: 'T-03', capacity: 2, status: 'Available', currentOrderId: null, qrCodeUrl: 'http://localhost:3000/menu?table=T-03' },
    { id: 'tbl_4', number: 'T-04', capacity: 6, status: 'Reserved', reservedTime: '14:30 PM', reservedFor: 'Dr. Orion Vance', qrCodeUrl: 'http://localhost:3000/menu?table=T-04' },
    { id: 'tbl_5', number: 'T-05', capacity: 4, status: 'Available', currentOrderId: null, qrCodeUrl: 'http://localhost:3000/menu?table=T-05' },
    { id: 'tbl_6', number: 'T-06', capacity: 2, status: 'Occupied', currentOrderId: 'ORD-9822', occupantName: 'Elena Rostova', prepMinutes: 5, qrCodeUrl: 'http://localhost:3000/menu?table=T-06' },
    { id: 'tbl_7', number: 'T-07', capacity: 4, status: 'Cleaning', currentOrderId: null, qrCodeUrl: 'http://localhost:3000/menu?table=T-07' },
    { id: 'tbl_8', number: 'T-08', capacity: 8, status: 'Available', currentOrderId: null, qrCodeUrl: 'http://localhost:3000/menu?table=T-08' },
  ];

  const displayTables = (tables && tables.length > 0) ? tables : defaultTables;

  useEffect(() => {
    dispatch(fetchTables());
  }, [dispatch]);

  const handleUpdateStatus = async (tableId, status) => {
    try {
      await fetch(`/api/tables/${tableId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || ''}`
        },
        body: JSON.stringify({ status })
      });
      dispatch(updateTableStatusLocally({ id: tableId, status }));
    } catch {
      dispatch(updateTableStatusLocally({ id: tableId, status }));
    }
    playSuccessChime();
    message.success(`Table ${tableId} updated to ${status}`);
    if (activeModalTable && activeModalTable.id === tableId) {
      setActiveModalTable({ ...activeModalTable, status });
    }
  };

  const handleSimulateScan = (tableNumber) => {
    dispatch(setOrderType('Dine-In'));
    dispatch(setTableNumber(tableNumber));
    playSuccessChime();
    message.success(`🔗 Scanned Table ${tableNumber}! Dine-In order mode locked.`);
    navigate(`/menu?table=${tableNumber}`);
  };

  const filteredTables = displayTables.filter((t) => {
    if (selectedFilter === 'All') return true;
    return t.status.toLowerCase() === selectedFilter.toLowerCase();
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Available':
        return <span className="chip chip-green">● {t('available')}</span>;
      case 'Occupied':
        return <span className="chip chip-amber">● {t('occupied')}</span>;
      case 'Reserved':
        return <span className="chip chip-blue">● {t('reserved')}</span>;
      case 'Cleaning':
      default:
        return <span className="chip" style={{ backgroundColor: 'rgba(0,0,0,0.06)', color: 'var(--color-ink-muted-80)' }}>● {t('cleaning')}</span>;
    }
  };

  const filterOptions = [
    { key: 'All', label: t('all') },
    { key: 'Available', label: t('available') },
    { key: 'Occupied', label: t('occupied') },
    { key: 'Reserved', label: t('reserved') },
    { key: 'Cleaning', label: t('cleaning') }
  ];

  return (
    <div 
      style={{ 
        backgroundColor: 'var(--color-canvas)',
        minHeight: 'calc(100vh - 96px)',
        paddingBottom: 64
      }}
    >
      
      {/* Header Bar with Glassmorphic Backdrop */}
      <section 
        style={{ 
          backgroundColor: 'var(--color-canvas-parchment)', 
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          padding: '48px 24px 36px 24px', 
          borderBottom: '1px solid var(--color-hairline)' 
        }}
      >
        <div className="apple-container-wide">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '4px 12px', borderRadius: 'var(--r-pill)', backgroundColor: 'rgba(0, 102, 204, 0.08)', color: 'var(--color-primary)', fontSize: 12, fontWeight: 600, marginBottom: 12 }}>
                <QrCode size={14} />
                <span>{t('tables_badge')}</span>
              </div>
              <h1 className="display-lg" style={{ color: 'var(--color-ink)', marginBottom: 8 }}>
                {t('tables_title')}
              </h1>
              <p style={{ fontSize: 17, color: 'var(--color-ink-muted-80)', maxWidth: 640 }}>
                {t('tables_desc')}
              </p>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => dispatch(fetchTables())}
                className="button-pearl-capsule"
                style={{ padding: '8px 16px', fontSize: 14, backdropFilter: 'blur(10px)' }}
              >
                <RefreshCw size={14} />
                <span>{t('refresh_status')}</span>
              </button>
            </div>
          </div>

          {/* Filter Pills */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 28 }}>
            {filterOptions.map((opt) => {
              const active = selectedFilter === opt.key;
              return (
                <button
                  key={opt.key}
                  onClick={() => setSelectedFilter(opt.key)}
                  className={active ? 'button-dark-utility' : 'button-pearl-capsule'}
                  style={{
                    borderRadius: 'var(--r-pill)',
                    padding: '8px 18px',
                    fontSize: 14,
                    fontWeight: active ? 600 : 400
                  }}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main Grid with Glass Cards */}
      <section className="apple-container-wide" style={{ padding: '48px 24px' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <p style={{ fontSize: 14, color: 'var(--color-ink-muted-80)', fontWeight: 500 }}>
            Showing {filteredTables.length} table station{filteredTables.length !== 1 ? 's' : ''}
          </p>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
            <Spin size="large" />
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 24
            }}
          >
            <AnimatePresence>
              {filteredTables.map((tbl, i) => (
                <motion.div
                  key={tbl.id}
                  layout
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ ...springTransition, delay: Math.min(i * 0.03, 0.24) }}
                  className="store-utility-card"
                  style={{
                    backgroundColor: 'var(--color-surface-pearl)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    border: '1px solid var(--color-hairline)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: 16
                  }}
                >
                  {/* Card Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 600, color: 'var(--color-ink)', letterSpacing: '-0.28px' }}>
                          {tbl.number}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: 'var(--color-ink-muted-80)' }}>
                          <Users size={14} />
                          <span>{tbl.capacity} seats</span>
                        </div>
                      </div>
                    </div>

                    {getStatusBadge(tbl.status)}
                  </div>

                  {/* QR Code Preview Thumbnail */}
                  <div
                    onClick={() => setActiveModalTable(tbl)}
                    style={{
                      backgroundColor: 'var(--color-canvas-parchment)',
                      borderRadius: 'var(--r-md)',
                      padding: 16,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 16,
                      cursor: 'pointer',
                      border: '1px solid var(--color-hairline)'
                    }}
                  >
                    <div style={{ backgroundColor: '#ffffff', padding: 6, borderRadius: 'var(--r-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <QRCodeSVG
                        value={`http://localhost:3000/menu?table=${tbl.number}`}
                        size={72}
                        bgColor="#ffffff"
                        fgColor="#1d1d1f"
                        level="M"
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-ink)', marginBottom: 4 }}>
                        {tbl.status === 'Occupied' ? `Active: ${tbl.occupantName || 'Diner'}` : tbl.status === 'Reserved' ? `Reserved: ${tbl.reservedFor}` : t('ready_for_diner')}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--color-ink-muted-80)' }}>
                        {t('station')} {tbl.number} • {tbl.capacity} {t('seats')}
                      </div>
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div style={{ display: 'flex', gap: 10, borderTop: '1px solid var(--color-divider-soft)', paddingTop: 14 }}>
                    <button
                      onClick={() => handleSimulateScan(tbl.number)}
                      className="button-primary"
                      style={{ flex: 1, padding: '8px 14px', fontSize: 13 }}
                    >
                      <span>{t('simulate_scan')}</span>
                      <ChevronRight size={14} />
                    </button>

                    <button
                      onClick={() => setActiveModalTable(tbl)}
                      className="button-pearl-capsule"
                      style={{ padding: '8px 12px', fontSize: 13 }}
                    >
                      {t('qr_details')}
                    </button>
                  </div>

                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

      </section>

      {/* Table Detail & Status Modal */}
      {activeModalTable && (
        <Modal
          open={!!activeModalTable}
          onCancel={() => setActiveModalTable(null)}
          footer={null}
          centered
          width={440}
        >
          <div style={{ textAlign: 'center', padding: '12px 8px' }}>
            
            <div style={{ marginBottom: 16 }}>
              <span className="chip chip-blue" style={{ marginBottom: 8 }}>{t('table_telemetry')}</span>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 600, color: 'var(--color-ink)' }}>
                {t('station')} {activeModalTable.number}
              </h3>
              <p style={{ fontSize: 14, color: 'var(--color-ink-muted-80)' }}>
                {t('seats')}: {activeModalTable.capacity} • {activeModalTable.status}
              </p>
            </div>

            {/* High Res QR Display */}
            <div style={{
              backgroundColor: '#ffffff',
              padding: 24,
              borderRadius: 'var(--r-lg)',
              border: '1px solid var(--color-hairline)',
              display: 'inline-block',
              marginBottom: 20,
              boxShadow: 'var(--product-shadow)'
            }}>
              <QRCodeSVG
                value={`http://localhost:3000/menu?table=${activeModalTable.number}`}
                size={180}
                bgColor="#ffffff"
                fgColor="#1d1d1f"
                level="H"
                includeMargin
              />
              <div style={{ marginTop: 12, fontSize: 12, color: 'var(--color-ink-muted-80)', fontFamily: 'var(--font-mono)' }}>
                http://localhost:3000/menu?table={activeModalTable.number}
              </div>
            </div>

            {/* Live Status Switcher Buttons */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--color-ink-muted-48)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
                {t('set_status')}
              </label>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <button
                  onClick={() => handleUpdateStatus(activeModalTable.id || activeModalTable.number, 'Available')}
                  className={activeModalTable.status === 'Available' ? 'button-dark-utility' : 'button-pearl-capsule'}
                >
                  ● {t('available')}
                </button>
                <button
                  onClick={() => handleUpdateStatus(activeModalTable.id || activeModalTable.number, 'Occupied')}
                  className={activeModalTable.status === 'Occupied' ? 'button-dark-utility' : 'button-pearl-capsule'}
                >
                  ● {t('occupied')}
                </button>
                <button
                  onClick={() => handleUpdateStatus(activeModalTable.id || activeModalTable.number, 'Reserved')}
                  className={activeModalTable.status === 'Reserved' ? 'button-dark-utility' : 'button-pearl-capsule'}
                >
                  ● {t('reserved')}
                </button>
                <button
                  onClick={() => handleUpdateStatus(activeModalTable.id || activeModalTable.number, 'Cleaning')}
                  className={activeModalTable.status === 'Cleaning' ? 'button-dark-utility' : 'button-pearl-capsule'}
                >
                  ● {t('cleaning')}
                </button>
              </div>
            </div>

            {/* Direct Launch Button */}
            <button
              onClick={() => {
                setActiveModalTable(null);
                handleSimulateScan(activeModalTable.number);
              }}
              className="button-primary"
              style={{ width: '100%', height: 44 }}
            >
              {t('open_menu_sim')}
            </button>

          </div>
        </Modal>
      )}

    </div>
  );
};

export default TableQRView;
