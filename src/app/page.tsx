"use client";

import Link from "next/link";
import { useState } from "react";

export default function Home() {
  const [settingUp, setSettingUp] = useState(false);
  const [setupResult, setSetupResult] = useState<string | null>(null);

  const runSetup = async () => {
    setSettingUp(true);
    try {
      const res = await fetch("/api/setup", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setSetupResult(`Created ${data.sampleFiles} sample files, ${data.databases} database connections, ${data.workflows} workflow templates`);
      }
    } finally { setSettingUp(false); }
  };

  return (
    <main className="min-h-screen bg-neutral-950">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/50 border border-indigo-800/50 text-indigo-400 text-xs font-medium mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            Visual Data Flow Orchestration
          </div>
          <h1 className="text-5xl font-bold text-white mb-4 tracking-tight">
            Flow<span className="text-indigo-400">Forge</span>
          </h1>
          <p className="text-lg text-neutral-400 max-w-2xl mx-auto">
            Build, visualize, and execute data pipelines. Process files across JSON, CSV, Excel, Parquet, XML, and PDF.
            Connect to MySQL, PostgreSQL, MongoDB, Oracle, Cassandra, Neo4j, and cloud databases.
          </p>
        </div>

        {/* Setup button */}
        <div className="mb-12 text-center">
          {setupResult ? (
            <div className="inline-block bg-emerald-950/30 border border-emerald-800 rounded-xl px-6 py-3">
              <p className="text-sm text-emerald-300">{setupResult}</p>
            </div>
          ) : (
            <button
              onClick={runSetup}
              disabled={settingUp}
              className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-500 transition-colors disabled:opacity-50"
            >
              {settingUp ? "Setting up environment..." : "⚡ Quick Setup - Generate All Sample Data, Databases & Workflows"}
            </button>
          )}
        </div>

        {/* Navigation grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          <NavLink
            href="/workflows"
            title="Workflow Library"
            description="10 pre-built ETL workflows covering file processing, database loading, cross-DB migration, and cloud ETL"
            icon="⚡"
            color="indigo"
          />
          <NavLink
            href="/flows"
            title="Flow Editor"
            description="Visual drag-and-drop canvas for building and executing data pipelines"
            icon="🎨"
            color="blue"
          />
          <NavLink
            href="/databases"
            title="Database Connections"
            description="14 database connections: MySQL, PostgreSQL, MongoDB, Oracle, Cassandra, Neo4j, AWS, Azure, GCP"
            icon="🗄️"
            color="amber"
          />
          <NavLink
            href="/data"
            title="Data Browser"
            description="Browse sample files, outputs, database tables, and persisted workflow data"
            icon="📁"
            color="emerald"
          />
          <NavLink
            href="/data?path=samples"
            title="Sample Files"
            description="JSON, CSV, Excel, Parquet, XML, and PDF files with customer, product, order, employee data"
            icon="📊"
            color="purple"
          />
          <NavLink
            href="/data?path=outputs"
            title="Output Files"
            description="Generated outputs in CSV, JSON, Excel, Parquet, XML, and PDF report formats"
            icon="📤"
            color="cyan"
          />
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <FeatureCard
            icon="↗"
            title="30+ Processors"
            description="File sources (JSON, CSV, Excel, Parquet, XML, PDF), transforms (filter, sort, aggregate, merge, deduplicate, lookup), and sinks for every format."
            color="emerald"
          />
          <FeatureCard
            icon="⇄"
            title="14 Database Adapters"
            description="MySQL, PostgreSQL, MSSQL, Oracle, MongoDB, Cassandra, Neo4j, Google Cloud SQL/BigQuery, AWS RDS/DynamoDB/Redshift, Azure SQL/Cosmos DB."
            color="blue"
          />
          <FeatureCard
            icon="↙"
            title="10 Workflow Templates"
            description="Pre-built scenarios: JSON-to-DB, CSV-to-DB, DB-to-files, cross-DB migration, cloud ETL, Excel-to-email, Parquet enrichment, and more."
            color="amber"
          />
        </div>

        {/* Architecture overview */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8 mb-12">
          <h2 className="text-xl font-semibold text-neutral-200 mb-4 text-center">System Architecture</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            <ArchBlock title="Sources" items={["JSON", "CSV", "Excel", "Parquet", "XML", "PDF", "Database Query", "Data Generator"]} color="emerald" />
            <ArchBlock title="Transforms" items={["JSON Transform", "Filter", "Sort", "Aggregate", "Merge", "Deduplicate", "Lookup/Enrich", "Script"]} color="blue" />
            <ArchBlock title="Sinks" items={["JSON", "CSV", "Excel", "Parquet", "XML", "PDF Report", "DB Insert", "Email Send"]} color="amber" />
            <ArchBlock title="Databases" items={["MySQL", "PostgreSQL", "MongoDB", "Oracle", "Cassandra", "Neo4j", "AWS/Redshift", "Azure Cosmos"]} color="purple" />
          </div>
        </div>

        {/* Sample workflows */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8 text-center">
          <h2 className="text-xl font-semibold text-neutral-200 mb-3">Pre-Built Workflow Scenarios</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-left max-w-4xl mx-auto mt-6">
            {[
              { name: "JSON to Multi-Format Export", desc: "Read JSON → Transform → Export to CSV + JSON" },
              { name: "CSV to Database Load", desc: "Read CSV → Filter delivered orders → Insert to MySQL" },
              { name: "Database to Multi-Format Export", desc: "Query DB → Sort → Export to Excel, Parquet, XML, PDF" },
              { name: "Cross-Database Migration", desc: "MySQL + MongoDB → Merge → Deduplicate → PostgreSQL + Oracle" },
              { name: "Cloud-to-Cloud ETL", desc: "GCP BigQuery → Transform → Filter → AWS Redshift + Azure Cosmos" },
              { name: "Excel Report to Email", desc: "Read Excel → Aggregate by region → CSV → Send Email" },
              { name: "Parquet Data Enrichment", desc: "Read Parquet → Lookup products → Sort → Parquet + Excel" },
              { name: "XML Processing Pipeline", desc: "Read XML → Filter electronics → Normalize → CSV + XML + JSON" },
              { name: "Multi-Database Aggregation", desc: "PostgreSQL + MSSQL + Cassandra → Merge → Aggregate → CSV + Neo4j" },
              { name: "AWS + Azure Cloud ETL", desc: "DynamoDB + Azure SQL → Enrich → Filter → Redshift + Cosmos + Email" },
            ].map((w) => (
              <div key={w.name} className="bg-neutral-800/50 border border-neutral-700/50 rounded-lg px-4 py-2.5">
                <span className="text-xs font-medium text-neutral-200">{w.name}</span>
                <p className="text-[10px] text-neutral-500 mt-0.5">{w.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

function NavLink({ href, title, description, icon, color }: { href: string; title: string; description: string; icon: string; color: string }) {
  const bgColors: Record<string, string> = {
    indigo: "hover:bg-indigo-950/30 hover:border-indigo-800/50",
    blue: "hover:bg-blue-950/30 hover:border-blue-800/50",
    amber: "hover:bg-amber-950/30 hover:border-amber-800/50",
    emerald: "hover:bg-emerald-950/30 hover:border-emerald-800/50",
    purple: "hover:bg-purple-950/30 hover:border-purple-800/50",
    cyan: "hover:bg-cyan-950/30 hover:border-cyan-800/50",
  };
  return (
    <Link href={href} className={`block bg-neutral-900/50 border border-neutral-800 rounded-xl p-5 transition-all ${bgColors[color] || ""}`}>
      <div className="text-2xl mb-2">{icon}</div>
      <h3 className="text-sm font-semibold text-neutral-200 mb-1">{title}</h3>
      <p className="text-xs text-neutral-500">{description}</p>
    </Link>
  );
}

function FeatureCard({ icon, title, description, color }: { icon: string; title: string; description: string; color: string }) {
  const borderColor: Record<string, string> = { emerald: "border-emerald-800/50", blue: "border-blue-800/50", amber: "border-amber-800/50" };
  const bgColor: Record<string, string> = { emerald: "bg-emerald-950/30", blue: "bg-blue-950/30", amber: "bg-amber-950/30" };
  const iconColor: Record<string, string> = { emerald: "text-emerald-400", blue: "text-blue-400", amber: "text-amber-400" };
  return (
    <div className={`rounded-xl border ${borderColor[color] || "border-neutral-700"} ${bgColor[color] || "bg-neutral-800"} p-6`}>
      <span className={`text-2xl ${iconColor[color] || "text-neutral-400"}`}>{icon}</span>
      <h3 className="text-sm font-semibold text-neutral-200 mt-3 mb-2">{title}</h3>
      <p className="text-xs text-neutral-500">{description}</p>
    </div>
  );
}

function ArchBlock({ title, items, color }: { title: string; items: string[]; color: string }) {
  const colors: Record<string, string> = { emerald: "text-emerald-400", blue: "text-blue-400", amber: "text-amber-400", purple: "text-purple-400" };
  return (
    <div>
      <h3 className={`text-xs font-semibold uppercase tracking-wider mb-2 ${colors[color] || "text-neutral-400"}`}>{title}</h3>
      <div className="space-y-0.5">
        {items.map((item) => (
          <p key={item} className="text-[10px] text-neutral-500">{item}</p>
        ))}
      </div>
    </div>
  );
}
