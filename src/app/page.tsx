import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-neutral-950">
      <div className="max-w-5xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/50 border border-indigo-800/50 text-indigo-400 text-xs font-medium mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            Visual Data Flow Orchestration
          </div>
          <h1 className="text-5xl font-bold text-white mb-4 tracking-tight">
            Flow<span className="text-indigo-400">Forge</span>
          </h1>
          <p className="text-lg text-neutral-400 max-w-2xl mx-auto">
            Build, visualize, and execute data pipelines with a drag-and-drop
            interface. Inspired by Apache NiFi, designed for modern workflows.
          </p>
          <div className="flex items-center justify-center gap-4 mt-8">
            <Link
              href="/flows"
              className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-500 transition-colors"
            >
              Get Started →
            </Link>
            <Link
              href="/flows"
              className="px-6 py-3 bg-neutral-800 text-neutral-300 font-medium rounded-lg hover:bg-neutral-700 transition-colors border border-neutral-700"
            >
              View Flows
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <FeatureCard
            icon="↗"
            title="Source Processors"
            description="Read data from JSON files, CSV files, and more. Configure input paths and formats."
            color="emerald"
          />
          <FeatureCard
            icon="⇄"
            title="Transform Processors"
            description="Rename fields, filter records, convert formats, and apply data mappings."
            color="blue"
          />
          <FeatureCard
            icon="↙"
            title="Sink Processors"
            description="Write transformed data to files, databases, or API endpoints."
            color="amber"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          <FeatureHighlight
            title="Visual Flow Designer"
            description="Drag and drop processors onto a canvas. Connect them with arrows to define data flow. Configure each processor with an intuitive properties panel."
          />
          <FeatureHighlight
            title="Data Provenance"
            description="Track every data transformation with detailed provenance logs. See input/output record counts, timing, and errors at each step."
          />
          <FeatureHighlight
            title="Flow Execution Engine"
            description="Topological sorting ensures correct execution order. Parallel execution support for independent processor chains."
          />
          <FeatureHighlight
            title="Extensible Architecture"
            description="Plugin-based processor system. Add custom processors for any data source or transformation with a simple interface."
          />
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8 text-center">
          <h2 className="text-xl font-semibold text-neutral-200 mb-3">
            Ready to build your first pipeline?
          </h2>
          <p className="text-sm text-neutral-500 mb-6 max-w-lg mx-auto">
            Create a flow, add processors for reading and writing data, configure
            transformations, and execute your pipeline with a single click.
          </p>
          <Link
            href="/flows"
            className="inline-block px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-500 transition-colors"
          >
            Create Your First Flow
          </Link>
        </div>
      </div>
    </main>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  color,
}: {
  icon: string;
  title: string;
  description: string;
  color: string;
}) {
  const borderColor =
    {
      emerald: "border-emerald-800/50",
      blue: "border-blue-800/50",
      amber: "border-amber-800/50",
    }[color] || "border-neutral-700";

  const bgColor =
    {
      emerald: "bg-emerald-950/30",
      blue: "bg-blue-950/30",
      amber: "bg-amber-950/30",
    }[color] || "bg-neutral-800";

  const iconColor =
    {
      emerald: "text-emerald-400",
      blue: "text-blue-400",
      amber: "text-amber-400",
    }[color] || "text-neutral-400";

  return (
    <div className={`rounded-xl border ${borderColor} ${bgColor} p-6`}>
      <span className={`text-2xl ${iconColor}`}>{icon}</span>
      <h3 className="text-sm font-semibold text-neutral-200 mt-3 mb-2">
        {title}
      </h3>
      <p className="text-xs text-neutral-500">{description}</p>
    </div>
  );
}

function FeatureHighlight({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6">
      <h3 className="text-sm font-semibold text-neutral-200 mb-2">{title}</h3>
      <p className="text-xs text-neutral-500 leading-relaxed">{description}</p>
    </div>
  );
}
