"use client"

import type React from "react"
import { ResponsiveContainer, type TooltipProps } from "recharts"
import {
  AreaChart as RechartsAreaChart,
  Area as RechartsArea,
  XAxis as RechartsXAxis,
  YAxis as RechartsYAxis,
  Tooltip as RechartsTooltip,
  CartesianGrid as RechartsCartesianGrid,
  Legend as RechartsLegend,
  LineChart as RechartsLineChart,
  Line as RechartsLine,
  BarChart as RechartsBarChart,
  Bar as RechartsBar,
} from "recharts"

export function ChartContainer({ children, className }: React.ComponentProps<typeof ResponsiveContainer>) {
  return (
    <ResponsiveContainer width="100%" height="100%" className={className}>
      {children}
    </ResponsiveContainer>
  )
}

export const ChartArea = RechartsArea
export const ChartXAxis = RechartsXAxis
export const ChartYAxis = RechartsYAxis
export const ChartTooltip = RechartsTooltip
export const ChartGrid = RechartsCartesianGrid
export const ChartLegend = RechartsLegend
export const ChartLine = RechartsLine
export const ChartBar = RechartsBar

export const AreaChart = RechartsAreaChart
export const LineChart = RechartsLineChart
export const BarChart = RechartsBarChart

export function CustomTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (active && payload && payload.length > 0) {
    const value = payload[0]?.value
    const name = payload[0]?.name

    if (typeof value === 'number' && typeof name === 'string') {
      return (
        <div className="rounded-lg border bg-background p-2 shadow-sm">
          <div className="grid grid-cols-2 gap-2">
            <div className="font-medium">Date:</div>
            <div>{label}</div>
            <div className="font-medium">{name}:</div>
            <div>{value.toLocaleString()} kr</div>
          </div>
        </div>
      )
    }
  }

  return null
}