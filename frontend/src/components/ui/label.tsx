"use client";

// Imports the entire 'react' module to access 'forwardRef' function.
import * as React from "react";

// Imports all exports from '@radix-ui/react-label' to utilize Radix UI's accessible label primitives.
// This provides the base 'Root' component used for rendering the label.
import * as LabelPrimitive from "@radix-ui/react-label";

// Imports the 'cva' function and 'VariantProps' type from 'class-variance-authority' to define label variants and styles.
import { cva, type VariantProps } from "class-variance-authority";

// Imports the 'cn' function from '@/src/lib/utils' to merge and conditionally apply class names.
import { cn } from "@/src/lib/utils";

// Defines label variants and default styles using 'cva'.
// These styles set the text size, font weight, line-height, and handle disabled state appearance.
const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
);

// Defines the 'Label' component that forwards its ref to Radix UI's 'LabelPrimitive.Root'.
// It applies default label styles and merges any additional class names passed via props.
// Also extends the label's properties with variant props from 'labelVariants'.
const Label = React.forwardRef<
  React.ComponentRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
    VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(labelVariants(), className)}
    {...props}
  />
));

// Sets the display name of the 'Label' component for improved debugging and development experience.
Label.displayName = LabelPrimitive.Root.displayName;

// Exports the 'Label' component for use in other parts of the application.
export { Label };
