"use client"

import { Card, CardContent } from "@/components/ui/card"
import { PriceHistory } from "@/types"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts"
import { format, parseISO } from "date-fns"

type PriceHistoryCartProps = {
  priceHistory: PriceHistory[]
}

const PriceHistoryChart = ({ priceHistory }: PriceHistoryCartProps) => {
  const priceHistoryData = priceHistory.map(({ date, price }) => ({
    date: format(parseISO(date), "MMM dd"),
    price: price
  }))
  return (
    <div>
      <h2 className="text-2xl font-bold text-foreground mb-6">Price History</h2>
      <Card>
        <CardContent className="p-6">
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={priceHistoryData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--muted))"
                />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)"
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--primary))", strokeWidth: 2 }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
export default PriceHistoryChart
