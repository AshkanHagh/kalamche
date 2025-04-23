"use client"

import { Card, CardContent, CardFooter } from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from "@/components/ui/chart"
import { PriceHistory } from "../_types/index"
import { TrendingUp } from "lucide-react"
import { XAxis, CartesianGrid, Area, AreaChart } from "recharts"

type PriceHistoryCartProps = {
  priceHistory: PriceHistory[]
}

const chartConfig = {
  price: {
    label: "Price",
    color: "hsl(var(--primary))"
  }
}
const PriceHistoryChart = ({ priceHistory }: PriceHistoryCartProps) => {
  return (
    <div>
      <h2 className="text-2xl font-bold text-foreground mb-6">Price History</h2>
      <Card>
        <CardContent className="p-2 sm:p-6">
          <ChartContainer
            config={chartConfig}
            className="max-h-96 min-w-10 w-full"
          >
            <AreaChart
              accessibilityLayer
              data={priceHistory}
              margin={{
                left: 12,
                right: 12,
                top: 10,
                bottom: 10
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => value.slice(0, 3)}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="line" />}
              />
              <Area
                dataKey="price"
                type="natural"
                fill="var(--color-price)"
                fillOpacity={0.4}
                stroke="var(--color-price)"
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
        <CardFooter>
          <div className="flex w-full items-start gap-2 text-sm">
            <div className="grid gap-2">
              <div className="flex items-center gap-2 font-medium leading-none">
                Trending up by 5.2% this month{" "}
                <TrendingUp className="h-4 w-4" />
              </div>
              <div className="flex items-center gap-2 leading-none text-muted-foreground">
                {`${priceHistory.at(0)?.month} - ${priceHistory.at(-1)?.month}`}
              </div>
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
export default PriceHistoryChart
