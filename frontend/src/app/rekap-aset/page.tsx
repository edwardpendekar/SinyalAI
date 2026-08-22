"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  FileSpreadsheet, 
  Plus, 
  Trash2, 
  Save, 
  Layers, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle,
  X,
  Edit2
} from "lucide-react";

interface AssetData {
  [month: string]: number;
}

interface RowData {
  asset: string;
  data: AssetData;
}

export default function RekapAset() {
  const [months, setMonths] = useState<string[]>([
    "JAN 2025", "FEB 2025", "MAR 2025", "APR 2025", "MAY 2025", "JUN 2025",
    "JUL 2025", "AUG 2025", "SEP 2025", "OCT 2025", "NOV 2025", "DEC 2025",
    "JAN 2026", "FEB 2026", "MAR 2026", "JUN 2026"
  ]);

  const [rows, setRows] = useState<RowData[]>([]);
  const [editingCell, setEditingCell] = useState<{ assetIndex: number; month: string } | null>(null);
  const [editValue, setEditValue] = useState("");
  const [showAddMonthModal, setShowAddMonthModal] = useState(false);
  const [newMonthName, setNewMonthName] = useState("");
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Load from LocalStorage or seed default data from keuangan.sql
  useEffect(() => {
    const saved = localStorage.getItem("sinyalai_asset_rekap");
    if (saved) {
      setRows(JSON.parse(saved));
      const savedMonths = localStorage.getItem("sinyalai_asset_rekap_months");
      if (savedMonths) setMonths(JSON.parse(savedMonths));
    } else {
      // Data riil awal dari keuangan.sql untuk Jan & Feb 2025, dengan sisa sebagai interpolasi logis
      const initialRows: RowData[] = [
        {
          asset: "Saham",
          data: {
            "JAN 2025": 27340901, "FEB 2025": 27336879, "MAR 2025": 27336879, "APR 2025": 27350000,
            "MAY 2025": 28100000, "JUN 2025": 28400000, "JUL 2025": 29000000, "AUG 2025": 29500000,
            "SEP 2025": 30200000, "OCT 2025": 30800000, "NOV 2025": 31200000, "DEC 2025": 32000000,
            "JAN 2026": 32500000, "FEB 2026": 32900000, "MAR 2026": 33400000, "JUN 2026": 34500000
          }
        },
        {
          asset: "P2P Lending",
          data: {
            "JAN 2025": 145161899, "FEB 2025": 145161899, "MAR 2025": 145250000, "APR 2025": 145300000,
            "MAY 2025": 145400000, "JUN 2025": 145500000, "JUL 2025": 145600000, "AUG 2025": 145700000,
            "SEP 2025": 145800000, "OCT 2025": 145900000, "NOV 2025": 146000000, "DEC 2025": 146100000,
            "JAN 2026": 146200000, "FEB 2026": 146300000, "MAR 2026": 146400000, "JUN 2026": 146500000
          }
        },
        {
          asset: "Emas",
          data: {
            "JAN 2025": 502879, "FEB 2025": 502879, "MAR 2025": 510000, "APR 2025": 515000,
            "MAY 2025": 520000, "JUN 2025": 525000, "JUL 2025": 530000, "AUG 2025": 540000,
            "SEP 2025": 550000, "OCT 2025": 560000, "NOV 2025": 570000, "DEC 2025": 580000,
            "JAN 2026": 590000, "FEB 2026": 600000, "MAR 2026": 610000, "JUN 2026": 625000
          }
        },
        {
          asset: "Dollar",
          data: {
            "JAN 2025": 1656391, "FEB 2025": 1656391, "MAR 2025": 1660000, "APR 2025": 1670000,
            "MAY 2025": 1680000, "JUN 2025": 1690000, "JUL 2025": 1700000, "AUG 2025": 1720000,
            "SEP 2025": 1740000, "OCT 2025": 1760000, "NOV 2025": 1780000, "DEC 2025": 1800000,
            "JAN 2026": 1820000, "FEB 2026": 1840000, "MAR 2026": 1860000, "JUN 2026": 1900000
          }
        },
        {
          asset: "Cryptocurrency",
          data: {
            "JAN 2025": 0, "FEB 2025": 0, "MAR 2025": 1000000, "APR 2025": 1500000,
            "MAY 2025": 2000000, "JUN 2025": 2500000, "JUL 2025": 3000000, "AUG 2025": 3500000,
            "SEP 2025": 4000000, "OCT 2025": 4500000, "NOV 2025": 5000000, "DEC 2025": 6000000,
            "JAN 2026": 6500000, "FEB 2026": 7000000, "MAR 2026": 7500000, "JUN 2026": 8500000
          }
        },
        {
          asset: "Reksadana",
          data: {
            "JAN 2025": 6261618, "FEB 2025": 6261618, "MAR 2025": 6300000, "APR 2025": 6350000,
            "MAY 2025": 6400000, "JUN 2025": 6450000, "JUL 2025": 6500000, "AUG 2025": 6600000,
            "SEP 2025": 6700000, "OCT 2025": 6800000, "NOV 2025": 6900000, "DEC 2025": 7000000,
            "JAN 2026": 7100000, "FEB 2026": 7200000, "MAR 2026": 7300000, "JUN 2026": 7500000
          }
        },
        {
          asset: "Dana Cadangan",
          data: {
            "JAN 2025": 33302347, "FEB 2025": 33302347, "MAR 2025": 33400000, "APR 2025": 33500000,
            "MAY 2025": 33600000, "JUN 2025": 33700000, "JUL 2025": 34000000, "AUG 2025": 34200000,
            "SEP 2025": 34500000, "OCT 2025": 34800000, "NOV 2025": 35000000, "DEC 2025": 36000000,
            "JAN 2026": 36500000, "FEB 2026": 37000000, "MAR 2026": 37500000, "JUN 2026": 39000000
          }
        },
        {
          asset: "Bisnis Crowdfunding",
          data: {
            "JAN 2025": 7549671, "FEB 2025": 7612846, "MAR 2025": 7612846, "APR 2025": 7650000,
            "MAY 2025": 7700000, "JUN 2025": 7750000, "JUL 2025": 7800000, "AUG 2025": 7850000,
            "SEP 2025": 7900000, "OCT 2025": 7950000, "NOV 2025": 8000000, "DEC 2025": 8100000,
            "JAN 2026": 8200000, "FEB 2026": 8300000, "MAR 2026": 8400000, "JUN 2026": 8600000
          }
        },
        {
          asset: "Koperasi",
          data: {
            "JAN 2025": 6195942, "FEB 2025": 6195942, "MAR 2025": 6200000, "APR 2025": 6250000,
            "MAY 2025": 6300000, "JUN 2025": 6350000, "JUL 2025": 6400000, "AUG 2025": 6450000,
            "SEP 2025": 6500000, "OCT 2025": 6550000, "NOV 2025": 6600000, "DEC 2025": 6700000,
            "JAN 2026": 6800000, "FEB 2026": 6900000, "MAR 2026": 7000000, "JUN 2026": 7200000
          }
        }
      ];
      setRows(initialRows);
      localStorage.setItem("sinyalai_asset_rekap", JSON.stringify(initialRows));
      localStorage.setItem("sinyalai_asset_rekap_months", JSON.stringify(months));
    }
  }, []);

  // Auto-scroll ke kolom kanan (data paling baru) saat halaman atau data dimuat
  useEffect(() => {
    if (scrollContainerRef.current) {
      const timer = setTimeout(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollLeft = scrollContainerRef.current.scrollWidth;
        }
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [months, rows]);

  const saveToLocal = (newRows: RowData[], newMonths?: string[]) => {
    const activeMonths = newMonths || months;
    setRows(newRows);
    if (newMonths) setMonths(newMonths);
    localStorage.setItem("sinyalai_asset_rekap", JSON.stringify(newRows));
    localStorage.setItem("sinyalai_asset_rekap_months", JSON.stringify(activeMonths));
    
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 2000);
  };

  const handleCellClick = (assetIndex: number, month: string, currentValue: number) => {
    setEditingCell({ assetIndex, month });
    setEditValue(currentValue.toString());
  };

  const handleCellSave = () => {
    if (!editingCell) return;
    const valueNum = parseFloat(editValue) || 0;

    const newRows = [...rows];
    newRows[editingCell.assetIndex].data[editingCell.month] = valueNum;

    saveToLocal(newRows);
    setEditingCell(null);
  };

  const handleAddMonth = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanMonth = newMonthName.trim().toUpperCase();
    if (!cleanMonth) return;

    if (months.includes(cleanMonth)) {
      alert("Bulan ini sudah ada!");
      return;
    }

    const newMonths = [...months, cleanMonth];
    const newRows = rows.map(r => {
      // Ambil nilai bulan terakhir sebagai default value agar mempermudah input
      const lastMonth = months[months.length - 1];
      const defaultValue = r.data[lastMonth] || 0;
      return {
        ...r,
        data: {
          ...r.data,
          [cleanMonth]: defaultValue
        }
      };
    });

    saveToLocal(newRows, newMonths);
    setShowAddMonthModal(false);
    setNewMonthName("");
  };

  const handleRemoveMonth = (monthToRemove: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus kolom ${monthToRemove}?`)) {
      const newMonths = months.filter(m => m !== monthToRemove);
      const newRows = rows.map(r => {
        const newData = { ...r.data };
        delete newData[monthToRemove];
        return {
          ...r,
          data: newData
        };
      });
      saveToLocal(newRows, newMonths);
    }
  };

  // Hitung TOTAL bulanan
  const calculateMonthTotal = (month: string) => {
    return rows.reduce((sum, row) => sum + (row.data[month] || 0), 0);
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -250, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 250, behavior: "smooth" });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-accent-purple" />
            Rekapitulasi Portofolio Aset
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            Matriks pertumbuhan nilai bersih kekayaan pribadi bulanan untuk melacak tren portofolio secara komprehensif.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {showSuccessToast && (
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-accent-emerald/10 border border-accent-emerald/20 text-accent-emerald text-xs font-semibold animate-fade-in">
              <CheckCircle className="w-3.5 h-3.5" /> Saved
            </span>
          )}
          
          <button 
            onClick={() => setShowAddMonthModal(true)}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-accent-purple hover:bg-accent-purple/80 text-white text-xs font-bold transition shadow-lg shadow-accent-purple/25"
          >
            <Plus className="w-4 h-4" />
            Tambah Bulan
          </button>
        </div>
      </div>

      {/* Matrix Table Card */}
      <div className="glass-card rounded-2xl p-6 relative overflow-hidden">
        {/* Navigation Arrows for Matrix Scroll */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider text-gray-400 flex items-center gap-2">
            <Layers className="w-4 h-4 text-accent-cyan" />
            Matriks Historis Kekayaan
          </h3>
          <div className="flex gap-2">
            <button 
              onClick={scrollLeft}
              className="p-1.5 rounded-lg bg-black/40 border border-border text-gray-400 hover:text-white transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button 
              onClick={scrollRight}
              className="p-1.5 rounded-lg bg-black/40 border border-border text-gray-400 hover:text-white transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Container */}
        <div 
          ref={scrollContainerRef}
          className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent pb-3"
        >
          <table className="min-w-max w-full text-left border-collapse select-none">
            <thead>
              <tr className="border-b border-border text-[11px] text-gray-400 uppercase font-semibold">
                <th className="py-4 px-4 sticky left-0 z-10 bg-[#090a0f] border-r border-border min-w-[180px]">ASSET</th>
                {months.map((month) => (
                  <th key={month} className="py-4 px-5 text-right font-bold group relative min-w-[130px]">
                    <div className="flex items-center justify-end gap-1.5">
                      <span>{month}</span>
                      <button 
                        onClick={() => handleRemoveMonth(month)}
                        className="opacity-0 group-hover:opacity-100 p-0.5 text-accent-rose hover:bg-accent-rose/10 rounded transition-opacity"
                        title={`Hapus kolom ${month}`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            
            <tbody className="divide-y divide-border text-xs">
              {rows.map((row, assetIdx) => (
                <tr key={row.asset} className="hover:bg-white/5 transition-colors duration-100">
                  <td className="py-3 px-4 font-bold text-gray-300 sticky left-0 z-10 bg-[#090a0f] border-r border-border">
                    {row.asset}
                  </td>
                  {months.map((month) => {
                    const val = row.data[month] || 0;
                    const isEditing = editingCell?.assetIndex === assetIdx && editingCell?.month === month;
                    
                    return (
                      <td 
                        key={month} 
                        className="py-3 px-5 text-right font-medium text-gray-300 hover:text-accent-cyan cursor-pointer transition-colors relative"
                        onClick={() => handleCellClick(assetIdx, month, val)}
                      >
                        {isEditing ? (
                          <div className="flex items-center justify-end" onClick={(e) => e.stopPropagation()}>
                            <input 
                              type="number"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onBlur={handleCellSave}
                              onKeyDown={(e) => { if (e.key === "Enter") handleCellSave(); }}
                              className="w-full max-w-[110px] bg-black/60 border border-accent-cyan text-white text-right px-2 py-1 rounded text-xs focus:outline-none"
                              autoFocus
                            />
                          </div>
                        ) : (
                          <div className="group flex items-center justify-end gap-1 font-mono">
                            <span className="underline decoration-dotted decoration-gray-600 hover:decoration-accent-cyan">
                              {val === 0 ? "0" : val.toLocaleString("id-ID")}
                            </span>
                            <Edit2 className="w-2.5 h-2.5 opacity-0 group-hover:opacity-50 text-accent-cyan" />
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}

              {/* TOTAL ROW */}
              <tr className="border-t-2 border-border bg-[#0d0e14] font-bold text-xs">
                <td className="py-4 px-4 sticky left-0 z-10 bg-[#0d0e14] border-r border-border text-white">
                  TOTAL
                </td>
                {months.map((month) => {
                  const tot = calculateMonthTotal(month);
                  return (
                    <td key={month} className="py-4 px-5 text-right text-accent-emerald font-mono">
                      {tot === 0 ? "0" : tot.toLocaleString("id-ID")}
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Month Modal */}
      {showAddMonthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="glass-card max-w-sm w-full rounded-2xl p-6 relative border border-border">
            <button 
              onClick={() => setShowAddMonthModal(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h3 className="text-lg font-bold text-white mb-2">Tambah Bulan Rekap</h3>
            <p className="text-xs text-gray-400 mb-6">
              Masukkan nama bulan baru (contoh: JUL 2026) untuk ditambahkan sebagai kolom matriks.
            </p>

            <form onSubmit={handleAddMonth} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">Nama Bulan &amp; Tahun</label>
                <input 
                  type="text" 
                  placeholder="Contoh: JUL 2026, AUG 2026" 
                  value={newMonthName}
                  onChange={(e) => setNewMonthName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-black/40 border border-border text-white text-sm focus:outline-none focus:border-accent-purple transition-colors"
                  required
                  autoFocus
                />
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowAddMonthModal(false)}
                  className="px-4 py-2 rounded-xl border border-border text-gray-400 hover:text-white text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 rounded-xl bg-accent-purple hover:bg-accent-purple/80 text-white text-xs font-bold transition shadow-lg shadow-accent-purple/25"
                >
                  Tambah Kolom
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
