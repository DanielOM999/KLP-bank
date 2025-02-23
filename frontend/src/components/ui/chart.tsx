"use client";

// Importing the 'React' module to access type definitions for React components.
import type React from "react";

// Importing 'ResponsiveContainer' component and 'TooltipProps' type from the 'recharts' library
// to create responsive charts and define custom tooltip properties.
import { ResponsiveContainer, type TooltipProps } from "recharts";

// Importing various chart components from the 'recharts' library and renaming them for clarity.
import {
  AreaChart as RechartsAreaChart, // Component for rendering area charts.
  Area as RechartsArea, // Represents the shaded area in an AreaChart.
  XAxis as RechartsXAxis, // Component for the horizontal axis in a chart.
  YAxis as RechartsYAxis, // Component for the vertical axis in a chart.
  Tooltip as RechartsTooltip, // Component that displays information when hovering over chart elements.
  CartesianGrid as RechartsCartesianGrid, // Component that adds a grid to Cartesian charts for better readability.
  Legend as RechartsLegend, // Component that renders a legend for the chart.
  LineChart as RechartsLineChart, // Component for rendering line charts.
  Line as RechartsLine, // Represents a line in a LineChart.
  BarChart as RechartsBarChart, // Component for rendering bar charts.
  Bar as RechartsBar, // Represents a bar in a BarChart.
} from "recharts";

// Creating a ChartContainer component that wraps its children with a ResponsiveContainer.
// This ensures that the chart adapts to the size of its parent container.
// The component accepts all props that ResponsiveContainer does, including 'children' and 'className'.
export function ChartContainer({
  children,
  className,
}: React.ComponentProps<typeof ResponsiveContainer>) {
  return (
    <ResponsiveContainer width="100%" height="100%" className={className}>
      {children}
    </ResponsiveContainer>
  );
}

// Exporting recharts components with more descriptive names for use in other parts of the application.
export const ChartArea = RechartsArea;
export const ChartXAxis = RechartsXAxis;
export const ChartYAxis = RechartsYAxis;
export const ChartTooltip = RechartsTooltip;
export const ChartGrid = RechartsCartesianGrid;
export const ChartLegend = RechartsLegend;
export const ChartLine = RechartsLine;
export const ChartBar = RechartsBar;

// Exporting chart components for use in other parts of the application.
export const AreaChart = RechartsAreaChart;
export const LineChart = RechartsLineChart;
export const BarChart = RechartsBarChart;

// Creating a CustomTooltip component to display custom content when hovering over chart elements.
// The component utilizes the TooltipProps type to ensure it receives the correct props.
export function CustomTooltip({
  active,
  payload,
  label,
}: TooltipProps<number, string>) {
  // Check if the tooltip is active and contains data.
  if (active && payload && payload.length > 0) {
    // Extract the value and name from the first item in the payload.
    const value = payload[0]?.value;
    const name = payload[0]?.name;

    // Ensure that 'value' is a number and 'name' is a string before rendering.
    if (typeof value === "number" && typeof name === "string") {
      // Return a styled tooltip displaying the label (date) and value with currency formatting.
      return (
        <div className="rounded-lg border bg-background p-2 shadow-sm">
          <div className="grid grid-cols-2 gap-2">
            <div className="font-medium">Date:</div>
            <div>{label}</div>
            <div className="font-medium">{name}:</div>
            <div>{value.toLocaleString()} kr</div>
          </div>
        </div>
      );
    }
  }

  // Return null if the tooltip is not active or doesn't contain valid data.
  return null;
}
