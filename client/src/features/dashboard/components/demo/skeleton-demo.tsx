/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

import { useState, useEffect } from "react"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Label } from "@/shared/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs"

type SkeletonVariant = React.ComponentProps<typeof Skeleton>["variant"]

const variants: { id: SkeletonVariant; name: string }[] = [
  { id: "text", name: "Text" },
  { id: "title", name: "Title" },
  { id: "heading", name: "Heading" },
  { id: "avatar", name: "Avatar" },
  { id: "button", name: "Button" },
  { id: "input", name: "Input" },
  { id: "card", name: "Card" },
  { id: "list", name: "List Item" },
  { id: "image", name: "Image" },
]

export function SkeletonDemo() {
  const [isLoading, setIsLoading] = useState(true)
  const [effect, setEffect] = useState<"none" | "pulse" | "shimmer">("pulse")
  const [loadingTime, setLoadingTime] = useState(3000)

  // Simulate loading state
  useEffect(() => {
    setIsLoading(true)
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, loadingTime)

    return () => clearTimeout(timer)
  }, [loadingTime])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">Skeleton Loading</h2>
          <p className="text-sm text-muted-foreground">
            Different skeleton loading states for various UI components
          </p>
        </div>
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <Label htmlFor="effect" className="whitespace-nowrap">Effect:</Label>
            <select
              id="effect"
              value={effect}
              onChange={(e) => setEffect(e.target.value as "none" | "pulse" | "shimmer")}
              className="rounded-md border border-input bg-background px-3 py-1 text-sm"
            >
              <option value="pulse">Pulse</option>
              <option value="shimmer">Shimmer</option>
              <option value="none">None</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <Label htmlFor="loading-time" className="whitespace-nowrap">Loading time (ms):</Label>
            <input
              id="loading-time"
              type="number"
              min="500"
              max="10000"
              step="500"
              value={loadingTime}
              onChange={(e) => setLoadingTime(Number(e.target.value))}
              className="w-20 rounded-md border border-input bg-background px-2 py-1 text-sm"
            />
          </div>
        </div>
      </div>

      <Tabs defaultValue="preview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="code">Code</TabsTrigger>
        </TabsList>
        
        <TabsContent value="preview" className="space-y-6">
          {/* Basic Variants */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Variants</CardTitle>
              <CardDescription>Common skeleton loading states</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {variants.map((variant) => (
                <div key={variant.id} className="flex items-center space-x-4">
                  <span className="w-32 text-sm text-muted-foreground">{variant.name}</span>
                  <Skeleton 
                    variant={variant.id} 
                    effect={effect}
                    isLoading={isLoading}
                    className={effect === 'shimmer' ? 'bg-muted/50' : ''}
                  >
                    <div className="text-sm text-muted-foreground">
                      {`This is the ${variant.name} content`}
                    </div>
                  </Skeleton>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Card Example */}
          <Card>
            <CardHeader>
              <CardTitle>Card Example</CardTitle>
              <CardDescription>Loading state for a product card</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="overflow-hidden">
                    <Skeleton 
                      variant="image"
                      effect={effect}
                      isLoading={isLoading}
                      className={`w-full h-48 ${effect === 'shimmer' ? 'bg-muted/50' : ''}`}
                    >
                      <div className="aspect-video bg-muted flex items-center justify-center">
                        <span className="text-muted-foreground">Product Image {i}</span>
                      </div>
                    </Skeleton>
                    <div className="p-4 space-y-2">
                      <Skeleton 
                        variant="title"
                        effect={effect}
                        isLoading={isLoading}
                        className={effect === 'shimmer' ? 'bg-muted/50' : ''}
                      >
                        <h3 className="font-medium">Product Title {i}</h3>
                      </Skeleton>
                      <Skeleton 
                        variant="text"
                        effect={effect}
                        isLoading={isLoading}
                        count={2}
                        containerClassName="space-y-2"
                        className={effect === 'shimmer' ? 'bg-muted/50' : ''}
                      >
                        <p className="text-sm text-muted-foreground">
                          This is a product description that will be shown when loaded.
                        </p>
                      </Skeleton>
                      <div className="flex justify-between items-center pt-2">
                        <Skeleton 
                          variant="button"
                          effect={effect}
                          isLoading={isLoading}
                          className={effect === 'shimmer' ? 'bg-muted/50' : ''}
                        >
                          <span className="text-lg font-semibold">$99.99</span>
                        </Skeleton>
                        <Skeleton 
                          variant="button"
                          effect={effect}
                          isLoading={isLoading}
                          className={effect === 'shimmer' ? 'bg-muted/50' : ''}
                        >
                          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm">
                            Add to Cart
                          </button>
                        </Skeleton>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* List Example */}
          <Card>
            <CardHeader>
              <CardTitle>List Example</CardTitle>
              <CardDescription>Loading state for a list of items</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
                    <Skeleton 
                      variant="avatar"
                      effect={effect}
                      isLoading={isLoading}
                      className={effect === 'shimmer' ? 'bg-muted/50' : ''}
                    >
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                        <span className="text-muted-foreground">U</span>
                      </div>
                    </Skeleton>
                    <div className="flex-1 space-y-2">
                      <Skeleton 
                        variant="text"
                        effect={effect}
                        isLoading={isLoading}
                        className={`w-1/2 ${effect === 'shimmer' ? 'bg-muted/50' : ''}`}
                      >
                        <h4 className="font-medium">List Item {i}</h4>
                      </Skeleton>
                      <Skeleton 
                        variant="text"
                        effect={effect}
                        isLoading={isLoading}
                        className={`w-3/4 ${effect === 'shimmer' ? 'bg-muted/50' : ''}`}
                      >
                        <p className="text-sm text-muted-foreground">
                          This is a description for list item {i}
                        </p>
                      </Skeleton>
                    </div>
                    <Skeleton 
                      variant="button"
                      effect={effect}
                      isLoading={isLoading}
                      className={effect === 'shimmer' ? 'bg-muted/50' : ''}
                    >
                      <button className="text-sm text-muted-foreground hover:text-foreground">
                        View
                      </button>
                    </Skeleton>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="code">
          <Card>
            <CardHeader>
              <CardTitle>Implementation</CardTitle>
              <CardDescription>How to use the Skeleton component</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-md overflow-auto text-sm">
                {`// Basic usage
<Skeleton variant="text" isLoading={isLoading}>
  <p>Your content here</p>
</Skeleton>

// With shimmer effect
<Skeleton variant="card" effect="shimmer" isLoading={isLoading}>
  <div>Your card content</div>
</Skeleton>

// Multiple items
<Skeleton 
  variant="list" 
  count={5} 
  isLoading={isLoading}
  containerClassName="space-y-2"
>
  {items.map(item => (
    <div key={item.id} className="p-4 border rounded-lg">
      <h3>{item.title}</h3>
      <p>{item.description}</p>
    </div>
  ))}
</Skeleton>`}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
