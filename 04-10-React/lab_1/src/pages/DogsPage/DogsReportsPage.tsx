import Paper from "@mui/material/Paper"
import { BarChart } from "@mui/x-charts/BarChart"
import { PieChart } from "@mui/x-charts/PieChart"
import type { ReactNode } from "react"
import { useAppSelector } from "../../store/hooks"
import { buildDogCharts, chartHeight, formatChartNumber } from "./dog-charts"
import "./dogs-reports.css"

type ChartCardProps = {
  title: string
  subtitle: string
  wide?: boolean
  children: ReactNode
}

function ChartCard({ title, subtitle, wide = false, children }: ChartCardProps) {
  const className = wide ? "dogs-reports__card dogs-reports__card--wide" : "dogs-reports__card"

  return (
    <Paper variant="outlined" className={className}>
      <h2>{title}</h2>
      <p>{subtitle}</p>
      {children}
    </Paper>
  )
}

export default function DogsReportsPage() {
  const { breeds, status, page, totalRecords } = useAppSelector((state) => state.dogs)
  const charts = buildDogCharts(breeds)
  const isPending = status === "idle" || status === "pending"

  if (breeds.length === 0) {
    return (
      <section className="dogs-reports" aria-busy={isPending}>
        <header className="dogs-reports__header">
          <h1>Dog reports</h1>
          <p>Charts appear after the shared Dog API request finishes.</p>
        </header>
        <p className="dogs-reports__empty">No dog breeds loaded. Try again.</p>
      </section>
    )
  }

  return (
    <section className="dogs-reports" aria-busy={isPending}>
      <header className="dogs-reports__header">
        <h1>Dog reports</h1>
        <p>
          Charts for page {page} of the Dog API ({breeds.length} breeds on this page, {totalRecords}{" "}
          in the catalog). Same Redux data as the breeds table.
        </p>
      </header>

      <div className="dogs-reports__stats">
        <article className="dogs-reports__stat">
          <span>On this page</span>
          <strong>{breeds.length}</strong>
        </article>
        <article className="dogs-reports__stat">
          <span>Catalog</span>
          <strong>{totalRecords}</strong>
        </article>
        <article className="dogs-reports__stat">
          <span>Hypoallergenic</span>
          <strong>{charts.hypoallergenicCount}</strong>
        </article>
        <article className="dogs-reports__stat">
          <span>Countries</span>
          <strong>{charts.countryCount}</strong>
        </article>
        <article className="dogs-reports__stat">
          <span>Heaviest male avg</span>
          <strong>{charts.heaviest?.name ?? "—"}</strong>
          {charts.heaviest && <em>{formatChartNumber(charts.heaviest.kg)} kg</em>}
        </article>
      </div>

      <div className="dogs-reports__grid">
        <ChartCard title="Coat types" subtitle="How many breeds on this page share each coat.">
          <PieChart
            height={320}
            series={[
              {
                data: charts.coats,
                innerRadius: 58,
                outerRadius: 108,
                paddingAngle: 2,
                cornerRadius: 4,
                arcLabel: "value",
                arcLabelMinAngle: 18,
              },
            ]}
          />
        </ChartCard>

        <ChartCard title="Hypoallergenic" subtitle="Breeds marked hypoallergenic versus the rest.">
          <PieChart
            height={320}
            series={[
              {
                data: charts.hypoallergenic,
                innerRadius: 58,
                outerRadius: 108,
                paddingAngle: 2,
                cornerRadius: 4,
                arcLabel: "value",
                arcLabelMinAngle: 12,
              },
            ]}
          />
        </ChartCard>

        <ChartCard
          title="Breeds by country"
          subtitle="Origin country for the breeds loaded on this page."
          wide
        >
          <BarChart
            layout="horizontal"
            height={chartHeight(charts.countries.length)}
            yAxis={[
              {
                scaleType: "band",
                data: charts.countries.map((row) => row.label),
                width: "auto",
              },
            ]}
            series={[
              {
                data: charts.countries.map((row) => row.value),
                label: "Breeds",
                color: "#1565c0",
              },
            ]}
            grid={{ vertical: true }}
            hideLegend
          />
        </ChartCard>

        <ChartCard
          title="Average weight"
          subtitle="Male and female weight, using the midpoint of each breed's range."
          wide
        >
          <BarChart
            layout="horizontal"
            height={chartHeight(charts.weights.length)}
            yAxis={[
              {
                scaleType: "band",
                data: charts.weights.map((row) => row.name),
                width: "auto",
                categoryGapRatio: 0.35,
              },
            ]}
            series={[
              {
                data: charts.weights.map((row) => row.male),
                label: "Male avg (kg)",
                color: "#1565c0",
                valueFormatter: (value) => (value == null ? "" : `${formatChartNumber(value)} kg`),
              },
              {
                data: charts.weights.map((row) => row.female),
                label: "Female avg (kg)",
                color: "#00897b",
                valueFormatter: (value) => (value == null ? "" : `${formatChartNumber(value)} kg`),
              },
            ]}
            grid={{ vertical: true }}
          />
        </ChartCard>

        <ChartCard
          title="Average life span"
          subtitle="Midpoint of each breed's life-span range, longest first."
          wide
        >
          <BarChart
            layout="horizontal"
            height={chartHeight(charts.lifeSpans.length)}
            yAxis={[
              {
                scaleType: "band",
                data: charts.lifeSpans.map((row) => row.name),
                width: "auto",
              },
            ]}
            series={[
              {
                data: charts.lifeSpans.map((row) => row.years),
                label: "Avg life span (years)",
                color: "#ef6c00",
                valueFormatter: (value) => (value == null ? "" : `${formatChartNumber(value)} years`),
              },
            ]}
            grid={{ vertical: true }}
            hideLegend
          />
        </ChartCard>
      </div>
    </section>
  )
}
