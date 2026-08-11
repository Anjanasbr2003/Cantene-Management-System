import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Button, Tag, Modal, message, Badge } from 'antd';
import { QrCode, Utensils, CheckCircle2, AlertCircle, RefreshCw, ExternalLink } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { fetchTables, updateTableStatusLocally } from '../store/tableSlice';
import { setTableNumber, setOrderType } from '../store/cartSlice';

export const TableQRView = () => {
  const { tables } = useSelector((state) => state.tables);
  const { user, token } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [qrModalTable, setQrModalTable] = useState(null);

  useEffect(() => {
    dispatch(fetchTables());
  }, [dispatch]);

  const handleUpdateStatus = async (tableId, status) => {
    try {
      const res = await fetch(`/api/tables/${tableId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || ''}`
        },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (data.success) {
        dispatch(updateTableStatusLocally({ id: tableId, status }));
        message.success(`Table updated to ${status}`);
      }
    } catch (e) {
      message.error('Failed to update table.');
    }
  };

  const handleSimulateScan = (tableNumber) => {
    dispatch(setOrderType('Dine-In'));
    dispatch(setTableNumber(tableNumber));
    message.success(`🔗 Scanned Table ${tableNumber}! Locked order type to Dine-In.`);
    navigate(`/menu?table=${tableNumber}`);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-4 space-y-6">
      
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-3xl flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 flex items-center justify-center" style={{ background: 'var(--blue)', borderRadius: 'var(--r-md)' }}>
            <QrCode className="w-6 h-6" style={{ color: '#fff' }} />
          </div>
          <div>
            <h2 className="text-2xl font-bold font-display">
              Table QR Codes
            </h2>
            <p className="text-xs text-slate-400">
              Scan to order · Manage table status
            </p>
          </div>
        </div>
      </div>

      {/* Table Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {tables.map((table) => {
          const isOccupied = table.status === 'Occupied';
          const isCleaning = table.status === 'Cleaning';

          return (
            <div
              key={table.id}
              className={`glass-panel p-5 rounded-2xl space-y-4 border transition-all ${
                isOccupied
                  ? 'border-amber-500/50 bg-amber-950/10'
                  : isCleaning
                  ? 'border-purple-500/50 bg-purple-950/10'
                  : 'border-emerald-500/50 bg-emerald-950/10'
              }`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold font-mono text-slate-100">{table.tableNumber}</h3>
                  <p className="text-xs text-slate-400">Capacity: {table.capacity} Seats</p>
                </div>
                <Tag color={isOccupied ? 'gold' : isCleaning ? 'purple' : 'green'} className="text-xs font-bold px-3 py-0.5">
                  {table.status}
                </Tag>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <Button
                  block
                  icon={<QrCode className="w-4 h-4 text-cyan-400" />}
                  onClick={() => setQrModalTable(table)}
                  className="spring-button text-xs font-semibold"
                >
                  Generate & View Table QR
                </Button>

                <Button
                  type="primary"
                  block
                  icon={<ExternalLink className="w-4 h-4" />}
                  onClick={() => handleSimulateScan(table.tableNumber)}
                  className="spring-button text-xs font-bold bg-gradient-to-r from-cyan-500 to-purple-600 border-0"
                >
                  Simulate QR Customer Scan
                </Button>
              </div>

              {/* Staff Session Status Switcher */}
              {(user?.role === 'admin' || user?.role === 'staff') && (
                <div className="pt-2 border-t border-slate-800 flex gap-1">
                  <Button
                    size="small"
                    type={table.status === 'Vacant' ? 'primary' : 'default'}
                    onClick={() => handleUpdateStatus(table.id, 'Vacant')}
                    className="text-[10px] flex-1 spring-button"
                  >
                    Vacant
                  </Button>
                  <Button
                    size="small"
                    type={table.status === 'Occupied' ? 'primary' : 'default'}
                    onClick={() => handleUpdateStatus(table.id, 'Occupied')}
                    className="text-[10px] flex-1 spring-button"
                  >
                    Occupied
                  </Button>
                  <Button
                    size="small"
                    type={table.status === 'Cleaning' ? 'primary' : 'default'}
                    onClick={() => handleUpdateStatus(table.id, 'Cleaning')}
                    className="text-[10px] flex-1 spring-button"
                  >
                    Cleaning
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* QR Code SVG Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-cyan-400 font-display">
            <QrCode className="w-5 h-5" />
            <span>Table QR Code: {qrModalTable?.tableNumber}</span>
          </div>
        }
        open={!!qrModalTable}
        onCancel={() => setQrModalTable(null)}
        footer={null}
        width={380}
      >
        {qrModalTable && (
          <div className="py-6 flex flex-col items-center justify-center space-y-4 text-center">
            <div className="p-4 bg-white rounded-2xl shadow-2xl">
              <QRCodeSVG
                value={`${window.location.origin}/menu?table=${qrModalTable.tableNumber}`}
                size={200}
                fgColor="#070A0F"
              />
            </div>
            <div>
              <p className="text-xs font-mono font-bold text-cyan-300">
                {window.location.origin}/menu?table={qrModalTable.tableNumber}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Scan this QR code from any smartphone camera to open the menu pre-tagged for Dine-In at Table {qrModalTable.tableNumber}.
              </p>
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
};

export default TableQRView;
