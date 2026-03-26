"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface DatabaseConnection {
  id: string;
  name: string;
  type: string;
  host: string;
  port: number;
  database: string;
  status: string;
  createdAt: string;
}

const dbColors: Record<string, string> = {
  mysql: "bg-orange-900/30 border-orange-700 text-orange-300",
  mssql: "bg-red-900/30 border-red-700 text-red-300",
  oracle: "bg-red-900/30 border-red-700 text-red-300",
  cassandra: "bg-blue-900/30 border-blue-700 text-blue-300",
  mongodb: "bg-green-900/30 border-green-700 text-green-300",
  neo4j: "bg-cyan-900/30 border-cyan-700 text-cyan-300",
  postgresql: "bg-blue-900/30 border-blue-700 text-blue-300",
  "gcp-sql": "bg-blue-900/30 border-blue-700 text-blue-300",
  "gcp-bigquery": "bg-blue-900/30 border-blue-700 text-blue-300",
  "aws-rds": "bg-amber-900/30 border-amber-700 text-amber-300",
  "aws-dynamodb": "bg-amber-900/30 border-amber-700 text-amber-300",
  "aws-redshift": "bg-amber-900/30 border-amber-700 text-amber-300",
  "azure-sql": "bg-indigo-900/30 border-indigo-700 text-indigo-300",
  "azure-cosmos": "bg-indigo-900/30 border-indigo-700 text-indigo-300",
};

function getCategoryLabel(type: string): string {
  if (type.startsWith("gcp-")) return "Google Cloud";
  if (type.startsWith("aws-")) return "AWS";
  if (type.startsWith("azure-")) return "Azure";
  return "On-Premise";
}

export default function DatabasesPage() {
  const [connections, setConnections] = useState<DatabaseConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedConn, setSelectedConn] = useState<string | null>(null);
  const [tables, setTables] = useState<{ name: string; columns: { name: string; type: string }[]; rowCount: number }[]>([]);
  const [tableData, setTableData] = useState<Record<string, unknown>[]>([]);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);

  useEffect(() => { fetchConnections(); }, []);

  const fetchConnections = async () => {
    try {
      const res = await fetch("/api/databases");
      if (res.ok) setConnections(await res.json());
    } finally { setLoading(false); }
  };

  const selectConnection = async (id: string) => {
    setSelectedConn(id);
    setSelectedTable(null);
    setTableData([]);
    try {
      const res = await fetch(`/api/databases/${id}/tables`);
      if (res.ok) setTables(await res.json());
    } catch { /* ignore */ }
  };

  const viewTable = async (tableName: string) => {
    if (!selectedConn) return;
    setSelectedTable(tableName);
    try {
      const res = await fetch(`/api/databases/${selectedConn}/tables/${tableName}?limit=50`);
      if (res.ok) {
        const data = await res.json();
        setTableData(data.rows);
      }
    } catch { /* ignore */ }
  };

  const categories = [...new Set(connections.map((c) => getCategoryLabel(c.type)))];

  return (
    <div className="min-h-screen bg-neutral-950">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link href="/" className="text-neutral-500 hover:text-neutral-300 text-sm mb-1 inline-block">← Home</Link>
            <h1 className="text-2xl font-bold text-neutral-100">Database Connections</h1>
            <p className="text-sm text-neutral-500 mt-1">Manage database connections and browse table data</p>
          </div>
        </div>

        {loading ? (
          <p className="text-neutral-500 text-sm py-12 text-center">Loading connections...</p>
        ) : connections.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-neutral-400 text-lg font-medium">No database connections</p>
            <p className="text-neutral-600 text-sm mt-1">Run the setup to create default connections</p>
          </div>
        ) : (
          <div className="grid grid-cols-12 gap-6">
            {/* Connection list */}
            <div className="col-span-4 space-y-4">
              {categories.map((cat) => (
                <div key={cat}>
                  <h3 className="text-[10px] uppercase tracking-wider text-neutral-500 font-semibold mb-2 px-1">{cat}</h3>
                  <div className="space-y-1.5">
                    {connections.filter((c) => getCategoryLabel(c.type) === cat).map((conn) => (
                      <button
                        key={conn.id}
                        onClick={() => selectConnection(conn.id)}
                        className={`w-full text-left px-3 py-2.5 rounded-lg border transition-all ${selectedConn === conn.id ? "border-indigo-500 bg-indigo-950/30" : "border-neutral-800 hover:border-neutral-700 bg-neutral-900/50"}`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-neutral-200">{conn.name}</span>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded ${dbColors[conn.type] || "bg-neutral-800 text-neutral-400"}`}>
                            {conn.type}
                          </span>
                        </div>
                        <div className="text-[10px] text-neutral-600 mt-0.5">{conn.database}</div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Table browser */}
            <div className="col-span-8">
              {selectedConn ? (
                <div className="space-y-4">
                  <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
                    <h3 className="text-sm font-semibold text-neutral-200 mb-3">Tables</h3>
                    {tables.length === 0 ? (
                      <p className="text-xs text-neutral-600">No tables in this database</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {tables.map((t) => (
                          <button
                            key={t.name}
                            onClick={() => viewTable(t.name)}
                            className={`px-3 py-1.5 rounded-lg text-xs border transition-all ${selectedTable === t.name ? "border-indigo-500 bg-indigo-950/30 text-indigo-300" : "border-neutral-700 hover:border-neutral-600 text-neutral-400"}`}
                          >
                            {t.name} <span className="text-neutral-600">({t.rowCount})</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {selectedTable && tableData.length > 0 && (
                    <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
                      <div className="px-4 py-3 border-b border-neutral-800">
                        <h3 className="text-sm font-semibold text-neutral-200">{selectedTable} <span className="text-neutral-500 font-normal">({tableData.length} rows)</span></h3>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="border-b border-neutral-800">
                              {Object.keys(tableData[0]).map((col) => (
                                <th key={col} className="px-3 py-2 text-left text-neutral-400 font-medium">{col}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {tableData.map((row, i) => (
                              <tr key={i} className="border-b border-neutral-800/50 hover:bg-neutral-800/30">
                                {Object.values(row).map((val, j) => (
                                  <td key={j} className="px-3 py-1.5 text-neutral-300 max-w-[200px] truncate">
                                    {typeof val === "object" ? JSON.stringify(val) : String(val ?? "")}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {selectedTable && tableData.length === 0 && (
                    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-8 text-center">
                      <p className="text-sm text-neutral-500">No data in table &quot;{selectedTable}&quot;</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-12 text-center">
                  <p className="text-neutral-500">Select a database connection to browse tables</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
